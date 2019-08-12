import { Component, OnInit, ViewChild } from '@angular/core';
import { CoordinatesService, ApiService } from '../../core';
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

@Component({
  selector: 'simulator-v2',
  templateUrl: './simulator-v2.component.html',
  styleUrls: ['./simulator-v2.component.css'],
})
export class SimulatorV2Component implements OnInit {
  jointsAsArr: number[];
  showTrace: boolean = false;
  loaded: boolean = false;
  liveMode: boolean = true;
  env = environment;

  @ViewChild('simulator', { static: false }) simulator: SimulatorComponent;

  private notifier: Subject<boolean> = new Subject();

  constructor(
    public coos: CoordinatesService,
    public robots: RobotService,
    public sim: SimulatorService,
    private api: ApiService,
    private player: PlayerService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private scene: SceneService
  ) {}

  ngOnInit() {
    this.jointsAsArr = this.coos.jointsAsArr;
    this.coos.positonChange.pipe(takeUntil(this.notifier)).subscribe(ret => {
      this.jointsAsArr = ret;
    });
    this.sim.getScene();
    this.loaded = this.sim.shouldShowSimulator ? false : true;
  }
  
  openRecording() {
    if (!this.liveMode) {
      this.player.unload();
      this.liveMode = true;
      return;
    }
    this.loaded = false;
    this.api.getRecordingCSV(null).then((result: string) => {
      if (result === null) {
        this.loaded = true;
        this.liveMode = true;
        return;
      }
      let gap = 1;
      const data: MotionSample[] = result
        .split('\n')
        .map((line: string, i: number) => {
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
            timeFromStartMs: (i - 2) * 4 * gap,
          };
        });
      data.shift();
      data.shift();
      this.player.load(data);
      this.loaded = true;
      this.liveMode = false;
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
        },
      })
      .afterClosed()
      .subscribe((name: string) => {
        if (!name || name.indexOf('.') !== -1 || name.indexOf('/') !== -1)
          return;
        name = name.toUpperCase() + '.SIM';
        const str = this.scene.exportToJson();
        const f = new File([new Blob([str])], name);
        this.api.upload(f, true).then(ret => {
          const msg = ret ? 'SUCCUSS' : 'FAILED';
          this.snack.open(msg, null, { duration: 1500 });
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
