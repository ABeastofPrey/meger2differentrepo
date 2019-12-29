import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { MatSnackBar } from '@angular/material';
import {GroupManagerService} from './group-manager.service';
import {ApiService} from './api.service';
import {BehaviorSubject} from 'rxjs';
import { PlotData } from 'plotly.js';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  
  private timeout: number;
  private _isRecording = false;
  
  private _tabs: RecordTab[] = [];
  private _selectedTabIndex = 0;
  
  available: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get recording() {
    return this._isRecording;
  }
  
  get selectedTabIndex() {
    return this._selectedTabIndex;
  }
  
  get tabs() {
    return this._tabs;
  }
  
  set selectedTabIndex(i: number) {
    this._selectedTabIndex = i;
    this.openTab(i);
  }
  
  openTab(i: number) {
    const tab = this._tabs[i];
    if (tab && !tab.csv) {
      return this.api.getRecordingCSV(tab.file).then(result=>{
        tab.init(result);
      });
    }
  }
  
  createTab(name: string) {
    this._tabs.push(new RecordTab(name,this));
    this.selectedTabIndex = this._tabs.length - 1;
  }
  
  closeTab(i: number) {
    if (i >= 0 && i < this._tabs.length) {
      this._tabs.splice(i,1);
    }
  }

  constructor(
    private ws: WebsocketService,
    private snack: MatSnackBar,
    public grp: GroupManagerService,
    private api: ApiService
  ) {
    this.grp.sysInfoLoaded.subscribe(loaded=>{
      this.available.next(loaded);
    });
  }


  toggle() {
    if (this._isRecording) {
      this.ws.query('RecordClose').then(() => {
        this.snack.open('Motion Recording finished!', null, { duration: 1500 });
      });
      clearTimeout(this.timeout);
      this._isRecording = false;
      return;
    }
    this.ws.query('?TP_GET_MOTION_ELEMENT_AXES_NAMES').then((ret: MCQueryResponse)=>{
      const axes = ret.result.split(',').map(a=>{
        return a + '.PFB'
      }).join();
      const cmd = 'Record CSRECORD.rec 120000 Gap=1 RecData=' + axes;
      this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
        this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
          if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
          this._isRecording = true;
          clearTimeout(this.timeout);
          this.timeout = window.setTimeout(() => {
            this._isRecording = false;
            this.snack.open('Motion Recording finished!', null, {
              duration: 1500,
            });
          }, 120000);
        });
      });
    });
  }
}

export class RecordTab {
  
  file: string = null;
  data: Array<Partial<PlotData>> = null;
  csv: string = null;
  
  private _err = false;
  private _serviceRef: RecordService = null;
  private _legends: string[] = [];
  private _chartType: ChartType = ChartType.Time;
  private _legendX: number = null;
  private _legendY: number = null;
  private _legendZ: number = null;
  private _recLines: string[] = [];
  private _derData: Array<Partial<Plotly.PlotData>> = [];
  private _compareTo: RecordTab = null;
  
  constructor(fileName: string, ref: RecordService) {
    this.file = fileName;
    this._serviceRef = ref;
  }
  
  get err() {
    return this._err;
  }
  
  get legends() {
    return this._legends;
  }
  
  get chartType() {
    return this._chartType;
  }
  
  get derData() {
    return this._derData;
  }
  
  set derData(data: Array<Partial<Plotly.PlotData>>) {
    this._derData = data;
    this.init(this.csv);
  }
  
  set chartType(val: ChartType) {
    this._chartType = val;
    this.init(this.csv);
  }
  
  get legendX() {
    return this._legendX;
  };
  get legendY() {
    return this._legendY;
  };
  get legendZ() {
    return this._legendZ;
  };
  set legendX(val: number) {
    this._legendX = val;
    this.init(this.csv);
  }
  set legendY(val: number) {
    this._legendY = val;
    this.init(this.csv);
  }
  set legendZ(val: number) {
    this._legendZ = val;
    this.init(this.csv);
  }
  
  get compareTo() {
    return this._compareTo;
  }
  
  set compareTo(val: RecordTab) {
    this._compareTo = val;
  }
  
  init(csv: string) {
    this.csv = csv;
    try {
      let newData = [];
      if (this._legendX === null) { // FIRST INIT
        // parse CSR
        this._recLines = csv.split('\n');
        // parse legends string
        const line = this._recLines[1];
        const legends = [];
        let isFuncFlag = false;
        let currLegend = '';
        for (let i = 0; i < line.length; i++) {
          const c = line.charAt(i);
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
          if (i === line.length-1) {
            legends.push(currLegend);
          }
        }
        this._legends = legends;
        this._legendX = 0;
        this._legendY = this.legends[1] ? 1 : 0;
        this._legendZ = this.legends[2] ? 2 : (this.legends[1] ? 1 : 0);
      }
      if (this.chartType === ChartType.Three) {
        // 3D GRAPH
        const chartData: Graph3D = {
          mode: 'lines',
          name: this.file,
          x: [],
          y: [],
          z: [],
          type: 'scatter3d',
        };
        newData.push(chartData);
      } else if (this.chartType === ChartType.Time) {
        // X/T
        for (const legend of this.legends) {
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
          name: this.file,
          x: [],
          y: [],
        });
      }
      const cycleTime = this._serviceRef.grp.sysInfo.cycleTime;
      const gap = Number(this._recLines[0]) || 1;
      for (let i = 2; i < this._recLines.length; i++) {
        if (this._recLines[i] !== '') {
          const vals = this._recLines[i].slice(0, -1).split(',');
          if (this.chartType !== ChartType.Three) {
            // 2D
            if (this.chartType === ChartType.Two) {
              // ADVANCED 2D
              if (vals.length < 2) continue;
              newData[0].x.push(Number(vals[this.legendX]));
              newData[0].y.push(Number(vals[this.legendY]));
            } else {
              vals.forEach((val, index) => {
                newData[index].x.push((i-2) * cycleTime * gap);
                newData[index].y.push(Number(val));
              });
            }
          } else {
            //3D
            if (vals.length < 3) continue;
            newData[0].x.push(Number(vals[this.legendX]));
            newData[0].y.push(Number(vals[this.legendY]));
            (newData[0] as Graph3D).z.push(Number(vals[this.legendZ]));
          }
        }
      }
      newData = newData.concat(this.derData);
      this.data = newData;
      this._err = false;
    } catch (err) {
      this._err = true;
      this.data = null;
    }
  }
  
}

export enum ChartType { Time, Two, Three }

export interface Graph {
  mode: string;
  name: string;
  x: number[];
  y: number[];
}

export interface Graph3D extends Graph {
  z: number[];
  type: string;
}
