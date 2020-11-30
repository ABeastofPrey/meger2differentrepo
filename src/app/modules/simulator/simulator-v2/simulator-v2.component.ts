import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CoordinatesService, ApiService, GroupManagerService, UploadResult } from '../../core';
import {
  SimulatorComponent,
  PlayerService,
  MotionSample,
  SceneService,
} from 'stxsim-ng';
import { RobotService } from '../../core/services/robot.service';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SingleInputDialogComponent } from '../../../components/single-input-dialog/single-input-dialog.component';
import { FileSelectorDialogComponent } from '../../../components/file-selector-dialog/file-selector-dialog.component';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { SimulatorService } from '../../core/services/simulator.service';
import { ExternalGraphDialogComponent } from '../../dashboard/components/external-graph-dialog/external-graph-dialog.component';
import { UtilsService } from '../../core/services/utils.service';
import { YesNoDialogComponent } from '../../../components/yes-no-dialog/yes-no-dialog.component';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'simulator-v2',
  templateUrl: './simulator-v2.component.html',
  styleUrls: ['./simulator-v2.component.css'],
})
export class SimulatorV2Component implements OnInit {

  jointsAsArr: number[] = [];
  loaded = false;
  liveMode = true;
  env = environment;
  resizing = false;

  private _recName = null;
  get recName() { return this._recName; }

  @ViewChild('simulator') simulator: SimulatorComponent;
  @ViewChild('upload') uploadInput: ElementRef;

  private notifier: Subject<boolean> = new Subject();

  private words: {};

  constructor(
    public coos: CoordinatesService,
    public robots: RobotService,
    public sim: SimulatorService,
    private api: ApiService,
    private player: PlayerService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private scene: SceneService,
    private grp: GroupManagerService,
    private dataService: DataService,
    private trn: TranslateService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    const words = ['error.invalid_rec_motion','dismiss','error.err','success','projects.toolbar','button.overwrite','button.cancel'];
    this.trn.get(words).subscribe(words=>{
      this.words = words;
    });
    this.jointsAsArr = this.coos.jointsAsArr;
    this.coos.positonChange.pipe(takeUntil(this.notifier)).subscribe(ret => {
      this.jointsAsArr = ret;
    });
    this.sim.getScene();
    this.loaded = this.sim.shouldShowSimulator ? false : true;
  }

  openRecording() {
    const cycleTime = this.grp.sysInfo.cycleTime;
    if (!this.liveMode) {
      this.player.unload();
      this.liveMode = true;
      return;
    }
    this.dialog.open(ExternalGraphDialogComponent).afterClosed().subscribe(name=>{
      if (!name) return;
      this.loaded = false;
      this.api.getRecordingCSV(name).then((result: string) => {
        if (result === null) {
          this.loaded = true;
          this.liveMode = true;
          return;
        }
        let gap = 1;
        const lines = result.split('\n');
        // parse legends string
        const legendLine = lines[1];
        const legends = [];
        let isFuncFlag = false;
        let currLegend = '';
        for (let i = 0; i < legendLine.length; i++) {
          const c = legendLine.charAt(i);
          if (c === '(') {
            isFuncFlag = true;
          }
          else if (c === ')') {
            isFuncFlag = false;
          }
          if (c !== ',' || isFuncFlag) {
            currLegend += c;
          } else {
            legends.push(currLegend);
            currLegend = '';
          }
          if (i === legendLine.length-1) {
            legends.push(currLegend);
          }
        }
        this._recName = name + '.REC';
        // VERIFY LEGENDS MATCH MOTION RECORDING
        const axesCount = this.dataService.robotCoordinateType.flags.length;
        for (let i=1; i<=axesCount; i++) {
          const name1 = 'A' + i + '.PFB';
          const name2 = 'A' + i + '.PCMD';
          const len = legends.length;
          if (i-1 === len || (legends[i-1] !== name1 && legends[i-1] !== name2)) {
            this.loaded = true;
            // this.snack.open(this.words['error.invalid_rec_motion'],this.words['dismiss']);
            this.snackbarService.openTipSnackBar("error.invalid_rec_motion");
            return;
          }
        }
        const data: MotionSample[] = lines.map((line: string, i: number) => {
            if (i < 2) {
              if (i === 0) gap = Number(line);
              return null;
            }
            return {
              jointValues: line
                .slice(0, -1)
                .split(',')
                .map(val => {
                  return Number(val);
                }),
              timeFromStartMs: (i - 2) * cycleTime * gap,
            };
          });
        data.shift();
        data.shift();
        this.player.load(data);
        this.loaded = true;
        this.liveMode = false;
      });
    });
  }

  export() {
    this.utils.downloadFromText('MYSIM.SIM',this.scene.exportToJson());
  }

  import() {
    this.uploadInput.nativeElement.click();
  }

  onImportFile(e: {target: {files: File[], value: File }}) {
    const f = e.target.files[0];
    this.api.uploadToPath(f,true,'').then((ret: UploadResult) => {
      e.target.value = null;
      if (ret.success) {
        this.api.getFile(f.name).then(content => {
          this.scene.importFromJson(content);
          this.sim.data.next(this.scene.simulatorScene.children);
          this.sim.scene.name = name;
          this.sim.selected = null;
        });
      }
    });
  }

  save() {
    const sceneName = this.sim.scene.name.endsWith('.SIM') ? this.sim.scene.name.slice(0,-4) : null;
    this.dialog
      .open(SingleInputDialogComponent, {
        data: {
          type: 'text',
          title: 'Save Simulation',
          suffix: '.SIM',
          placeholder: 'File Name',
          accept: 'SAVE',
          regex: '[a-zA-Z]+(\\w*)$',
          maxLength: 32,
          initialValue: sceneName,
          nameRules: true
        },
      })
      .afterClosed()
      .subscribe((name: string) => {
        if (!name) {
          return;
        }
        name = name.toUpperCase() + '.SIM';
        const str = this.scene.exportToJson();
        const f = new File([new Blob([str])], name);
        this.api.upload(f, false).then(async (ret: UploadResult) => {
          if (ret.success) {
            this.sim.scene.name = name;
            //   this.snack.open(this.words['success'], null, { duration: 1500 });
              this.snackbarService.openTipSnackBar("success");
          } else if (ret.err === -1) {
            const word = await this.trn.get('projects.toolbar.overwrite_file.msg', { name: name }).toPromise();
            this.dialog.open(YesNoDialogComponent, {
              data: {
                title: this.words['projects.toolbar']['overwrite_file']['title'],
                msg: word,
                yes: this.words['button.overwrite'],
                no: this.words['button.cancel'],
              },
            })
            .afterClosed()
            .subscribe(overwrite => {
              if (overwrite) {
                this.api.upload(f, true).then(async (ret: UploadResult) => {
                  if (ret.success) {
                    this.sim.scene.name = name;
                  }
                  const msg = ret.success ? this.words['success'] : this.words['error.err'];
                  if(ret.err) {
                    // this.snack.open(msg, null, { duration: 1500 });
                    this.snackbarService.openTipSnackBar(msg);
                  }
                });
              }
            });
          }
        });
      });
  }

  open() {
    this.dialog
      .open(FileSelectorDialogComponent, {
        data: {
          ext: ['SIM'],
        },
      })
      .afterClosed()
      .subscribe(name => {
        if (!name) return;
        this.api.getFile(name).then(content => {
          this.scene.importFromJson(content);
          this.sim.data.next(this.scene.simulatorScene.children);
          this.sim.scene.name = name;
          this.sim.selected = null;
        });
      });
  }

  ngOnDestroy() {
    this.sim.selected = null;
    this.player.unload();
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  snapshot() {}
}
