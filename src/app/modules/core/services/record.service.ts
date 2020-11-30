import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse, errorString } from './websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {GroupManagerService} from './group-manager.service';
import {ApiService} from './api.service';
import {BehaviorSubject} from 'rxjs';
import { PlotData } from 'plotly.js';
import {UtilsService} from '../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  
  private timeout: number;
  private _isRecording = false;
  
  private _tabs: RecordTab[] = [];
  private _selectedTabIndex = 0;

  private _words: {};
  
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
      const t = this._tabs[i];
      localStorage.removeItem('plotRanges_' + t.file);
      this._tabs.splice(i,1);
    }
  }

  constructor(
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    public grp: GroupManagerService,
    private api: ApiService,
    private trn: TranslateService,
    private utils: UtilsService,
  ) {
    this.grp.sysInfoLoaded.subscribe(loaded=>{
      this.available.next(loaded);
    });
    this.trn.get(['record_done']).subscribe(words=>{
      this._words = words;
    });
  }

  private closeRecording() {
    this.ws.query('RecordClose').then(() => {
        // this.snack.open(this._words['record_done'], null, { duration: 1500 });
        this.snackbarService.openTipSnackBar("record_done");
    });
    clearTimeout(this.timeout);
    this._isRecording = false;
  }


  toggle() {
    const samples = 120000; // 120000 samples
    if (this._isRecording) {
      return this.closeRecording();
    }
    this.ws.query('?TP_GET_MOTION_ELEMENT_AXES_NAMES').then((ret: MCQueryResponse)=>{
      const axes = ret.result.split(',').map(a=>{
        return a + '.PFB'
      }).join();
      const cmd = `Record CSRECORD.rec ${samples} Gap=1 RecData=${axes}`;
      this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err) {
        //   return this.snack.open(errorString(ret.err), 'DISMISS');
            return this.snackbarService.openTipSnackBar(errorString(ret.err));
        }
        this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
        //   if (ret.err) return this.snack.open(errorString(ret.err), 'DISMISS');
          if(ret.err) return this.snackbarService.openTipSnackBar(errorString(ret.err));
          if (ret.err) {
            //   return this.snack.open(errorString(ret.err), 'DISMISS');
            return this.snackbarService.openTipSnackBar(errorString(ret.err));
          }
          this._isRecording = true;
          clearInterval(this.timeout);
          const time = this.grp.sysInfo.cycleTime * samples + 1000;
          this.timeout = window.setInterval(() => {
            return this.closeRecording();
          }, time);
        });
      });
    });
  }
}

export class RecordTab {
  
  file: string = null;
  data: Array<Partial<PlotData>> = null;

  private _csv: string = null;
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
  private _additionalData: RecordTab = null;
  
  constructor(fileName: string, ref: RecordService) {
    this.file = fileName;
    this._serviceRef = ref;
  }

  get additionalData() {
    return this._additionalData;
  }

  get csv() {
    if (this._csv === null) return null;
    let csv = this._csv.split('\n');
    if (this._derData && this._derData.length > 0) {
      csv[1] += ',' + this._derData.map(d=>d.name).join(',');
      const yData = this._derData.map(d=>d.y);
      for (let i=2; i<csv.length; i++) {
        csv[i] += yData.map(y=>y[i-2]).join(',');
      }
    }
    if (this._additionalData &&  this._additionalData.data && this._additionalData.data.length > 0) {
      const sizeBefore = csv[1].split(',');
      csv[1] += ',' + this._additionalData.data.map(d=>d.name).join(',');
      const yData = this._additionalData.data.map(d=>d.y);
      for (let i=2; i<this._additionalData.data.length; i++) {
        if (i >= csv.length) {
          csv[i] = new Array(sizeBefore).join('0,').slice(0,-1);
        }
        csv[i] += yData.map(y=>y[i-2]).join(',');
      }
    }
    const ret = csv.join('\n');
    return ret;
  }
  
  get err() {
    return this._err;
  }
  
  get legends() {
    return this._legends;
  }

  get legendsWithoutBreaks() {
    return this._legends.map(l=>{
      return l.replace(/<br>/g,'');
    });
  }
  
  get chartType() {
    return this._chartType;
  }
  
  get derData() {
    return this._derData;
  }
  
  set derData(data: Array<Partial<Plotly.PlotData>>) {
    this._derData = data;
    this.init(this._csv);
  }

  addData(otherTab: RecordTab) {
    this._additionalData = otherTab;
    this.init(this._csv);
  }
  
  set chartType(val: ChartType) {
    this._chartType = val;
    this.derData = [];
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
    this.init(this._csv);
  }
  set legendY(val: number) {
    this._legendY = val;
    this.init(this._csv);
  }
  set legendZ(val: number) {
    this._legendZ = val;
    this.init(this._csv);
  }
  
  get compareTo() {
    return this._compareTo;
  }
  
  set compareTo(val: RecordTab) {
    this._compareTo = val;
  }
  
  init(csv: string) {
    this._csv = csv;
    try {
      let newData = [];
      if (this._legendX === null) { // FIRST INIT
        // parse CSR
        this._recLines = csv.split('\n');
        // parse legends string
        const line = this._recLines[1];
        const legends: string[] = [];
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
        const MAX_LEGEND = 20;
        const REG = new RegExp('(.{' + MAX_LEGEND + '})', 'g');
        this._legends = legends.map(l=>{
          return l.length <= MAX_LEGEND ? l : l.replace(REG,'$1<br>');
        });
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
      if (this._additionalData && this._additionalData.data) {
        newData = newData.concat(this._additionalData.data);
      }
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
