import { Component, OnInit } from '@angular/core';
import { RobotService } from '../../../core/services/robot.service';
import { MatDialog, MatSnackBar, MatDatepickerInputEvent } from '@angular/material';
import { UpdateDialogComponent } from '../../../../components/update-dialog/update-dialog.component';
import {
  WebsocketService,
  MCQueryResponse,
  ApiService,
  DataService,
  TpStatService,
  GroupManagerService,
  ScreenManagerService,
  CoordinatesService,
  ProjectManagerService,
  TaskService,
  LoginService,
} from '../../../core';
import { RobotModel } from '../../../core/models/robot.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { RobotSelectionComponent } from '../../../../components/robot-selection/robot-selection.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import {ProgramEditorService} from '../../../program-editor/services/program-editor.service';
import { FormControl, Validators } from '@angular/forms';
import {UtilsService} from '../../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

const DEFAULT_MC_NAME = 'MC';

@Component({
  selector: 'app-robots',
  templateUrl: './robots.component.html',
  styleUrls: ['./robots.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('1s', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class RobotsComponent implements OnInit {
  
  disp: number[] = [];
  units: string[] = [];
  dh: DH[] = [];
  dhImgPath1: string | undefined;
  dhImgPath2: string | undefined;
  busy = false;
  sysDate = new FormControl(new Date());
  sysTime = new FormControl('',[Validators.pattern(/^(?:\d\d:\d\d)$/)]);

  // BATTERY
  private _batteryInterval: number;
  private _battery: number[] = []; // battery status
  private _masteringAck = false; // Is mastering acknowledge required after resetting
  get battery() { return this._battery };
  get masteringAck() {
    return this.batteryErrorExists ? false : this._masteringAck;
  }
  get batteryErrorExists() {
    return this._battery.some(n=>{
      return n !== 0;
    });
  }
  async acknowledgeMastering() {
    const result = await this.ws.query('?BTR_SET_ACKNOWLEGE');
    this.refreshBattery();
  }

  async refreshBattery() {
    const cmd1 = this.ws.query('?BTR_GET_BATTERY_STATUS');
    const cmd2 = this.ws.query('?BTR_GET_ACKNOWLEGE');
    const results = await Promise.all([cmd1,cmd2]);
    if (results[0].err || results[1].err){
      return;
    }
    this._battery = results[0].result.split(',').map(s=>{
      return Number(s);
    });
    this._masteringAck = results[1].result === '1';
  }

  async clearBattery(index: number) {
    this.busy = true;
    index++; // mc starts with 1
    const ret = await this.ws.query('?BTR_CLEAR_BATTERY_FAULT('+index+')');
    this.busy = false;
  }

  // SYSTEM
  sysName: FormControl = new FormControl('',[Validators.required, Validators.maxLength(11)]);
  
  // MCU
  mcuThreshold = 0;
  mcuConnected = false;

  private wordOk = '';
  private wordUpdating: string | undefined;
  private words: {};
  private notifier: Subject<boolean> = new Subject();

  constructor(
    public robot: RobotService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private api: ApiService,
    private data: DataService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private trn: TranslateService,
    public stat: TpStatService,
    private grp: GroupManagerService,
    private mgr: ScreenManagerService,
    private coos: CoordinatesService,
    private prj: ProjectManagerService,
    private task: TaskService,
    private prg: ProgramEditorService,
    public login: LoginService,
    private utils: UtilsService,
  ) {}

  ngOnInit() {
    const words = ['changeOK', 'robots.updating'];
    this.trn.get(words).subscribe(words => {
      this.wordOk = words['changeOK'];
      this.wordUpdating = words['robots.updating'];
      this.words = words;
    });
    this.ws.isConnected.subscribe(stat=>{
      if (!stat) return;
      this.ws.query('?sys.name').then((ret: MCQueryResponse) => {
        this.sysName.setValue(ret.result);
      });
      this.ws.query('?sys.date').then(ret=>{
        const s = ret.result.split('/');
        const d = new Date();
        d.setFullYear(Number('20' + s[2]));
        d.setMonth(Number(s[1])-1);
        d.setDate(Number(s[0]));
        this.sysDate.setValue(d);
      });
      this.ws.query('?sys.time').then(ret=>{
        const t = ret.result;
        this.sysTime.setValue(t.substring(0,t.lastIndexOf(':')));
      });
    });
    this.data.dataLoaded.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat) {
        this.grp.groupsLoaded.pipe(takeUntil(this.notifier)).subscribe(loaded => {
          if (loaded) {
            switch (this.data.robotType) {
              case 'PUMA':
                this.dhImgPath1 = 'DH_puma1.jpg';
                this.dhImgPath2 = 'DH_puma2.jpg';
                break;
              case 'SCARA':
                this.dhImgPath1 = 'DH_scara1.jpg';
                break;
              default:
                break;
            }
            this.refreshDisp();
            this.refreshDH();
            clearInterval(this._batteryInterval);
            this._batteryInterval = window.setInterval(()=>{
              this.refreshBattery();
            },1000);
          }
        });
        this.initMCU();
      }
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
    clearInterval(this._batteryInterval);
  }

  onThresholdUpdate() {
    const cmd = '?MCU_SET_FanThresholdFromUser(' + this.mcuThreshold + ')';
    this.ws.query(cmd).then(() => {
      this.initMCU();
    });
  }

  private pad(n){return n<10 ? '0'+n : n}

  async onDateChange(e:MatDatepickerInputEvent<Date>) {
      const d = e.value;
      if (d === null) return;
      const day = this.pad(d.getDate());
      const month = this.pad(d.getMonth()+1);
      const year = d.getFullYear().toString().slice(-2);
      const dateFormated = `${day}/${month}/${year}`;
      const ret = await this.ws.query('sys.date="'+dateFormated+'"');
      if (!ret.err) {

		this.snackbarService.openTipSnackBar(this.wordOk);
      }
  }

  async onTimeChange() {
    if (this.sysTime.invalid) return;
    const t = this.sysTime.value + ':00';
    const ret = await this.ws.query('sys.time="'+t+'"');
    if (!ret.err) {
      this.snackbarService.openTipSnackBar(this.wordOk);
    }
  }

  initMCU() {
    this.ws.query('?MCU_GET_CONNECTION_STATUS').then((ret: MCQueryResponse)=>{
      this.mcuConnected = ret.result === '1';
    }).then(()=>{
      this.ws.query('?MCU_GET_FAN_THRESHOLD').then((ret: MCQueryResponse) => {
        this.mcuThreshold = Number(ret.result);
      });
    });
  }

  onNameChange() {
    if (this.sysName.invalid) return;
    this.ws.query('call UTL_SET_SYSTEM_NAME("' + this.sysName.value + '")');
    //   this.snack.open(this.wordOk, '', { duration: 1500 });
      this.snackbarService.openTipSnackBar(this.wordOk);
  }

  private async refreshDisp() {
    const cmd = '?TP_GET_ROBOT_DISPLACEMENTS(' + this.data.selectedRobot + ')';
    const ret = await this.ws.query(cmd) as MCQueryResponse;
    const values = ret.result.split(',');
    const nValues: number[] = [];
    let n;
    for (const val of values) {
      n = Number(val);
      if (!isNaN(n)) {
         // ROUND TO NEAREST 2 DECIMALS
        nValues.push(Math.round(n * 100) / 100);
      }
    }
    if (values.length === nValues.length) this.disp = nValues;
    const promises = [];
    const g = this.grp.getGroup(this.data.selectedRobot);
    if (g === null) return;
    for (const a of g.axes) {
      promises.push(this.ws.query('?' + a + '.axisType'));
    }
    const ret2 = await Promise.all(promises) as MCQueryResponse[];
    const units: string[] = [];
    for (const result of ret2) {
      units.push(result.result === '0' ? 'mm' : 'deg');
    }
    this.units = units;
  }

  private refreshDH() {
    this.dh = [];
    const dh: DH[] = [];
    if (this.data.robotType === 'PUMA') {
      dh.push({ name: 'a1', value: 0 });
      dh.push({ name: 'a2', value: 0 });
      dh.push({ name: 'd2', value: 0 });
      dh.push({ name: 'a3', value: 0 });
      dh.push({ name: 'd4', value: 0 });
      dh.push({ name: 'd6', value: 0 });
    } else if (this.data.robotType === 'SCARA') {
      dh.push({ name: 'L1', value: 0 });
      dh.push({ name: 'L2', value: 0 });
    }
    const promises = [];
    const cmd = '?TP_GET_ROBOT_DH(' + this.data.selectedRobot + ',';
    for (const d of dh) {
      promises.push(this.ws.query(cmd + '"' + d.name + '")'));
    }
    Promise.all(promises).then((ret: MCQueryResponse[]) => {
      for (let i = 0; i < ret.length; i++) {
        if (dh[i]) dh[i].value = Number(ret[i].result);
      }
      this.dh = dh;
    });
  }

  trackByFn(index: number, item: number) {
    return index;
  }

  setHome(axis: number) {
    const cmd =
      '?TP_SET_HOME_POSITION(' + this.data.selectedRobot + ',' + axis + ')';
    this.ws.query(cmd).then(() => {
      this.refreshDisp();
    });
  }

  onSettingsKeyboardClose(index = -1) {
    if (this.disp.some(v=>v === null)) {
      this.refreshDisp();
      return;
    }
    const values = this.disp.join(',');
    const robot = this.data.selectedRobot;
    const cmd = `?TP_SET_ROBOT_DISPLACEMENTS(${robot},"${values}")`;
    this.ws.query(cmd).then(ret => {
      if (index === -1) {
        if (ret.result !== '0') {
          this.refreshDisp();
          return;
        }
        if(ret.result === '0') {
        //   this.snack.open(this.wordOk, '', { duration: 1500 });
          this.snackbarService.openTipSnackBar(this.wordOk);
        }
      } else {
        this.ws
          .query(
            '?tp_set_robot_dh(' +
              this.data.selectedRobot +
              ',"' +
              this.dh[index].name +
              '",' +
              this.dh[index].value +
              ')'
          )
          .then((ret: MCQueryResponse) => {
            if (ret.result === '0') {
                // this.snack.open(this.wordOk, '', { duration: 1500 });
                this.snackbarService.openTipSnackBar(this.wordOk);
            }
          });
      }
    });
  }

  openRobotSelectionDialog() {
    this.dialog
      .open(RobotSelectionComponent)
      .afterClosed()
      .subscribe((ret: RobotModel) => {
        if (ret) {
          const dialog = this.dialog.open(UpdateDialogComponent, {
            disableClose: true,
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            closeOnNavigation: false,
            data: this.wordUpdating,
            id: 'update',
          });
          this.ws
            .query(
              '?ROB_SELECT_ROBOT_CONFIGURATION("' + ret.part_number + '",0)'
            )
            .then((ret: MCQueryResponse) => {
              if (ret.result === '0') {
                this.ws.updateFirmwareMode = true;
                this.ws.query('?user sys_reboot(0,0,0)');
                setTimeout(() => {
                  let ok = false;
                  const interval = setInterval(() => {
                    if (ok) return;
                    this.api
                      .getFile('isWebServerAlive.HTML')
                      .then(ret => {
                        ok = true;
                        clearInterval(interval);
                        location.href = location.href + '?from=robot';
                      })
                      .catch(err => {});
                  }, 2000);
                }, 10000);
              } else {
                dialog.close();
              }
            });
        }
      });
  }
  
  toggleDebug(on: boolean) {
    if (!on) return;
    this.mgr.debugMode = on;
    this.coos.setDebugMode(on);
    this.grp.setDebugMode(on);
    this.prj.setDebugMode(on);
    this.task.setDebugMode(on);
    this.prg.setDebugMode(on);
    
  }
}

interface DH {
  name: string;
  value: number;
}
