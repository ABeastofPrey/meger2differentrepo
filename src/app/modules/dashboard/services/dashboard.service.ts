import { Injectable } from '@angular/core';
import { IPosition } from 'angular2-draggable';
import { MatDialog, MatSnackBar } from '@angular/material';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../../modules/core/services/websocket.service';
import { ScreenManagerService } from '../../../modules/core/services/screen-manager.service';
import { ApiService } from '../../../modules/core/services/api.service';
import { RecordParams } from '../components/record-dialog/record-dialog.component';
import { TourService } from 'ngx-tour-md-menu';
import { ApplicationRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RecordGraphComponent } from '../../../components/record-graph/record-graph.component';
import {GroupManagerService} from '../../core/services/group-manager.service';

@Injectable()
export class DashboardService {
  private _windows: DashboardWindow[] = [];
  private graphType: string;
  private _busy: boolean = false;
  private words: any;

  lastChartData: Graph[] = null;

  get busy() {
    return this._busy;
  }

  get windows() {
    return this._windows;
  }

  findWindow(name: string): number {
    for (let i = 0; i < this._windows.length; i++) {
      if (this._windows[i].name === name) return i;
    }
    return -1;
  }

  add(params: DashboardInitParams) {
    for (let w of this.windows) {
      if (w.name === params.name) return;
    }
    this.windows.push(new DashboardWindow(params));
    this.save();
  }

  close(name: string) {
    let index = this.findWindow(name);
    if (index > -1) {
      this._windows.splice(index, 1);
      this.save();
    }
  }

  constructor(
    private ws: WebsocketService,
    private mgr: ScreenManagerService,
    private dialog: MatDialog,
    private api: ApiService,
    private snack: MatSnackBar,
    private tour: TourService,
    private zone: NgZone,
    private ref: ApplicationRef,
    private trn: TranslateService,
    private grp: GroupManagerService
  ) {
    this.trn
      .get([
        'dashboard.err_file',
        'dismiss',
        'dashboard.charts.2d',
        'dashboard.charts.3d',
      ])
      .subscribe(words => {
        this.words = words;
      });
    this.tour.start$.subscribe(start => {
      localStorage.removeItem('dashboards');
    });
    this.tour.end$.subscribe(end => {
      for (let i = 0; i < this._windows.length; i++) {
        if (this._windows[i].name === 'SCARA (Tour)') {
          this._windows.splice(i, 1);
          break;
        }
      }
    });
    let cache = localStorage.getItem('dashboards');
    if (cache) {
      let windows: DashboardWindow[] = JSON.parse(cache);
      for (let i = 0; i < windows.length; i++) {
        if (windows[i].name === 'SCARA (Tour)') {
          windows.splice(i, 1);
          break;
        }
      }
      this._windows = windows;
      this.resetWindows();
    }
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        if (this.mgr.screen.name !== 'dashboard') return;
        for (let w of this.windows) {
          if (w.name === 'SCARA (Tour)') continue;
          let promises: Promise<any>[] = [];
          promises.push(this.ws.query('?' + w.name + '.en'));
          for (let p of w.params) {
            promises.push(this.ws.query('?' + w.name + '.' + p.name));
          }
          Promise.all(promises).then((ret: MCQueryResponse[]) => {
            if (ret[0].err) {
              this.close(w.name);
              this.ref.tick();
              return;
            }
            w.enable = !(ret[0].result === '0' || ret[0].err);
            for (let i = 0; i < w.params.length; i++) {
              if (ret[i + 1] && w.params[i])
                w.params[i].value = ret[i + 1].result;
            }
            this.ref.tick();
          });
        }
      }, 200);
    });
  }

  resetWindows() {
    for (let w of this._windows) {
      w.isRecording = false;
      w.recordingTime = 0;
    }
  }

  save() {
    localStorage.setItem('dashboards', JSON.stringify(this._windows));
  }

  onChange(w: DashboardWindow, p: DashboardParam, v: any) {
    let cmd = w.name + '.' + p.name + '=';
    switch (v) {
      case true:
      case false:
        cmd += v ? '1' : '0';
        break;
      default:
        cmd += v;
    }
    this.ws.query(cmd);
  }

  showGraphDialog(graphType: string, recName?: string) {
    this.graphType = graphType;
    this.getRecordingData(recName).then((ret: boolean) => {
      this._busy = false;
      if (!ret) return;
      this.dialog.open(RecordGraphComponent, {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        data: this.lastChartData,
        autoFocus: false,
      });
    });
  }

  private getRecordingData(recName: string) {
    this._busy = true;
    return this.api.getRecordingCSV(recName).then((csv: string) => {
      if (csv === null) {
        this.snack.open(
          this.words['dashboard.err_file'],
          this.words['dismiss']
        );
        return false;
      }
      this.lastChartData = this.csvToGraphs(csv);
      return true;
    });
  }

  /*
   * Returns TRACES array for PlotlyJS
   */
  private csvToGraphs(csv: string): Graph[] {
    let newData: Graph[] = [];
    // parse CSR
    let recLines = csv.split('\n');
    let legends = recLines[1].split(',');
    if (this.graphType === '3d') {
      // 3D GRAPH
      let chartData: Graph3D = {
        mode: 'lines',
        name: this.words['dashboard.charts.3d'],
        x: [],
        y: [],
        z: [],
        type: 'scatter3d',
      };
      newData.push(chartData);
    } else if (this.graphType === '2d') {
      // 2D
      for (let legend of legends) {
        newData.push({
          mode: 'lines',
          name: legend,
          x: [],
          y: [],
        });
      }
    } else {
      // 2D ADVANCED
      newData.push({
        mode: 'lines',
        name: this.words['dashboard.charts.2d'],
        x: [],
        y: [],
      });
    }
    const cycleTime = this.grp.sysInfo.cycleTime;
    const gap = Number(recLines[0]) || 1;
    for (let i = 2; i < recLines.length; i++) {
      if (recLines[i] !== '') {
        let vals = recLines[i].slice(0, -1).split(',');
        if (this.graphType !== '3d') {
          // 2D
          if (this.graphType === '2da') {
            // ADVANCED 2D
            if (vals.length !== 2) continue;
            newData[0].x.push(Number(vals[0]));
            newData[0].y.push(Number(vals[1]));
          } else {
            vals.forEach((val, index) => {
              newData[index].x.push((i-2) * cycleTime * gap);
              newData[index].y.push(Number(val));
            });
          }
        } else {
          //3D
          if (vals.length !== 3) continue;
          newData[0].x.push(Number(vals[0]));
          newData[0].y.push(Number(vals[1]));
          (<Graph3D>newData[0]).z.push(Number(vals[2]));
        }
      }
    }
    return newData;
  }
}

export class DashboardWindow {
  name: string;
  axes: string[];
  enable: boolean = false;
  params: DashboardParam[] = [];
  isExpanded: boolean = false;
  cartesian: boolean = false;
  target: number[];
  vel: number;
  acc: number;
  dec: number;
  jerk: number;
  pos: IPosition;
  isGroup: boolean;
  isRecording: boolean;
  recordingParams: RecordParams;
  recordingTime: number;

  constructor(params: DashboardInitParams) {
    this.name = params.name;
    this.axes = params.axes;
    this.isGroup = params.axes.length > 1;
    this.target = new Array<number>(this.axes.length);
    for (let i = 0; i < this.target.length; i++) this.target[i] = 0;
  }
}

export interface DashboardInitParams {
  name: string;
  axes: string[];
}

export class DashboardParam {
  name: string = null;
  value: any = null;
  base: string = 'DEC'; // DEC, HEX, BIN
  inputType: string = 'INPUT'; // INPUT, TOGGLE, SLIDER
  sliderMin: number = 0;
  sliderMax: number = 100;
}

interface Graph {
  mode: string;
  name: string;
  x: number[];
  y: number[];
}

interface Graph3D extends Graph {
  z: number[];
  type: string;
}
