import { Router, NavigationEnd } from '@angular/router';
import { Injectable } from '@angular/core';
import { IPosition } from 'angular2-draggable';
import { MatDialog, MatSnackBar } from '@angular/material';
import {WebsocketService } from '../../../modules/core/services/websocket.service';
import { ScreenManagerService } from '../../../modules/core/services/screen-manager.service';
import { ApiService } from '../../../modules/core/services/api.service';
import { NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {GroupManagerService} from '../../core/services/group-manager.service';
import {RecordParams} from '../../../components/record-dialog/record-dialog.component';
import {UtilsService} from '../../../modules/core/services/utils.service';
import { takeUntil } from 'rxjs/operators';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';

@Injectable()
export class DashboardService {
  private _windows: DashboardWindow[] = [];
  private graphType: string;
  private _busy = false;
  private words: {};
  private _interval: number;

  lastChartData: Graph[] = null;
  
  longProcess = false; // true when a long operation (like enable=1) is called, works almost like busy

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
    for (const w of this.windows) {
      if (w.name === params.name) return;
    }
    this.windows.push(new DashboardWindow(params));
    this.save();
  }

  close(name: string) {
    const index = this.findWindow(name);
    if (index > -1) {
      this._windows.splice(index, 1);
      this.save();
    }
  }

  get totalParamCount() {
    let count = 0;
    for (const w of this._windows) {
      count += w.params.length;
    }
    return count;
  }

  constructor(
    private ws: WebsocketService,
    private mgr: ScreenManagerService,
    private dialog: MatDialog,
    private api: ApiService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private zone: NgZone,
    private trn: TranslateService,
    private grp: GroupManagerService,
    private utils: UtilsService,
    private router: Router
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
    const cache = localStorage.getItem('dashboards');
    if (cache) {
      const windows: DashboardWindow[] = JSON.parse(cache);
      for (let i = 0; i < windows.length; i++) {
        if (windows[i].name === 'SCARA (Tour)') {
          windows.splice(i, 1);
          break;
        }
      }
      this._windows = windows;
      this.resetWindows();
    }
    this.ws.isConnected.subscribe(stat=>{
      window.clearInterval(this._interval);
      if (stat && this.router.url === '/dashboard/dashboards') {
        this.startInterval();
      }
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/dashboard/dashboards') {
          this.zone.runOutsideAngular(() => {
            if (this.ws.connected) {
              this.startInterval();
            }
          });
        } else {
          window.clearInterval(this._interval);
        }
      }
    });
  }

  private startInterval() {
    window.clearInterval(this._interval);
    this._interval = window.setInterval(()=>{
      if (this._busy) return;
      this._busy = true;
      for (const w of this.windows) {
        if (w.name === 'SCARA (Tour)') continue;
        this.zone.run(async ()=>{
          const promises = [];
          promises.push(this.ws.query('?' + w.name + '.en'));
          for (const p of w.params) {
            promises.push(this.ws.query('?' + w.name + '.' + p.name));
          }
          const ret = await Promise.all(promises);
          this._busy = false;
          if (ret[0].err) {
            this.close(w.name);
            return;
          }
          w.enable = !(ret[0].result === '0' || ret[0].err);
          for (let i = 0; i < w.params.length; i++) {
            if (ret[i + 1] && w.params[i]) {
              w.params[i].value = ret[i + 1].result;
            }
          }
        });
      }
    }, 500);
  }

  resetWindows() {
    for (const w of this._windows) {
      w.isRecording = false;
      w.recordingTime = 0;
    }
  }

  save() {
    localStorage.setItem('dashboards', JSON.stringify(this._windows));
  }

  onChange(w: DashboardWindow, p: DashboardParam, v: boolean | string | number) {
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

  /*
   * Returns TRACES array for PlotlyJS
   */
  private csvToGraphs(csv: string): Graph[] {
    const newData: Graph[] = [];
    // parse CSR
    const recLines = csv.split('\n');
    const legends = recLines[1].split(',');
    if (this.graphType === '3d') {
      // 3D GRAPH
      const chartData: Graph3D = {
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
      for (const legend of legends) {
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
        const vals = recLines[i].slice(0, -1).split(',');
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
          (newData[0] as Graph3D).z.push(Number(vals[2]));
        }
      }
    }
    return newData;
  }
}

export class DashboardWindow {
  name: string;
  axes: string[];
  enable = false;
  params: DashboardParam[] = [];
  isExpanded = false;
  cartesian = false;
  target: number[];
  vscale: number;
  ascale: number;
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
  value: string | number | boolean = null;
  base = 'DEC'; // DEC, HEX, BIN
  inputType = 'INPUT'; // INPUT, TOGGLE, SLIDER
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
