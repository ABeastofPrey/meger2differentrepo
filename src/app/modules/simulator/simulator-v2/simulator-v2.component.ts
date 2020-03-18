import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CoordinatesService, ApiService, GroupManagerService } from '../../core';
import {
  SimulatorComponent,
  PlayerService,
  MotionSample,
  SceneService,
} from 'stxsim-ng';
import { RobotService } from '../../core/services/robot.service';
import { environment } from '../../../../environments/environment';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SingleInputDialogComponent } from '../../../components/single-input-dialog/single-input-dialog.component';
import { FileSelectorDialogComponent } from '../../../components/file-selector-dialog/file-selector-dialog.component';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { SimulatorService } from '../../core/services/simulator.service';
import { ExternalGraphDialogComponent } from '../../dashboard/components/external-graph-dialog/external-graph-dialog.component';
import { UtilsService } from '../../core/services/utils.service';

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

  @ViewChild('simulator', { static: false }) simulator: SimulatorComponent;

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
    private scene: SceneService,
    private grp: GroupManagerService,
    private dataService: DataService,
    private trn: TranslateService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this.trn.get(['error.invalid_rec_motion','dismiss','error.err','success']).subscribe(words=>{
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
        console.log(legends);
        // VERIFY LEGENDS MATCH MOTION RECORDING
        const axesCount = this.dataService.robotCoordinateType.flags.length;
        for (let i=1; i<=axesCount; i++) {
          const name1 = 'A' + i + '.PFB';
          const name2 = 'A' + i + '.PCMD';
          if (legends[i-1] !== name1 && legends[i-1] !== name2) {
            this.loaded = true;
            this.snack.open(this.words['error.invalid_rec_motion'],this.words['dismiss']);
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

  save() {
    this.dialog
      .open(SingleInputDialogComponent, {
        data: {
          type: 'text',
          title: 'Save Simulation',
          suffix: '.SIM',
          placeholder: 'File Name',
          accept: 'SAVE',
          regex: '(\\w+)$'
        },
      })
      .afterClosed()
      .subscribe((name: string) => {
        if (!name || name.indexOf('.') !== -1 || name.indexOf('/') !== -1) {
          return;
        }
        name = name.toUpperCase() + '.SIM';
        const str = this.scene.exportToJson();
        const f = new File([new Blob([str])], name);
        this.api.upload(f, true).then(ret => {
          const msg = ret ? this.words['success'] : this.words['error.err'];
          if(!this.utils.IsKuka)
          {
            this.snack.open(msg, null, { duration: 1500 });
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
