import { Injectable } from '@angular/core';
import {WebsocketService, MCQueryResponse} from './websocket.service';
import {ApiService} from './api.service';
import {ApplicationRef} from '@angular/core';
import {NgZone} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupManagerService {
  
  sysInfo : SysInfo = null;
  groups : Group[] = [];
  sysInfoLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  private groupInterval : any;
  private lastGrouplist : string = null;

  constructor(
    private ws: WebsocketService,
    private api: ApiService,
    private zone: NgZone,
    private ref: ApplicationRef
  ) {
    this.ws.isConnected.subscribe(stat=>{
      if (stat) {
        this.api.getSysInfo().then((ret:SysInfo)=>{
          ret.ver = ret.ver.substring(0, ret.ver.indexOf(','));
          this.sysInfo = ret;
          this.zone.runOutsideAngular(()=>{
            this.groupInterval = setInterval(()=>{
              this.refreshGroupsAndInfo();
            },2000);
          });
          this.sysInfoLoaded.next(true);
        });
      } else {
        clearInterval(this.groupInterval);
      }
    });
  }
  
  private refreshSysInfo() { // ONLY REFRESHES REAL AXES
    this.ws.query('?sys.information').then((ret: MCQueryResponse)=>{
      let index = ret.result.indexOf('Real number');
      if (index > 0) {
        let str = ret.result.substring(index+19).trim();
        index = str.indexOf('\n');
        str = str.substring(0,index);
        this.sysInfo.realAxes = Number(str);
      }
    });
  }
  
  getGroup(name: string) {
    if (!name)
      return null;
    for (let g of this.groups) {
      if (g.name.toLowerCase() === name.toLowerCase())
        return g;
    }
    return null;
  }
  
  private refreshGroupsAndInfo() {
    let promises = [
      this.ws.query('?grouplist'),
    ];
    Promise.all(promises).then((ret: any[])=>{
      let grouplist: MCQueryResponse = ret[0];
      if (grouplist.result === this.lastGrouplist)
        return;
      this.refreshSysInfo();
      this.lastGrouplist = grouplist.result;
      let elements : Group[] = [];
      if (grouplist.result.indexOf('No groups') === 0) {
        this.groups = [];
        this.ref.tick();
        return;
      }
      let groups = grouplist.result.split('\n');
      for (let g of groups) {
        let parts = g.split(':');
        elements.push({
          name: parts[0].trim(),
          axes: parts[1].trim().split(',')
        });
      }
      this.groups = elements;
      this.ref.tick();
    });
  }
}

export interface Group {
  name: string;
  axes: string[];
}

export interface SysInfo {
  realAxes : number;
  features : string[];
  ver : string;
  diskSize : number;
  cycleTime : number;
  cpu : string;
  cpuFreq : number;
  freeDiskSpace : number;
  ramSize : number;
  platform : string;
  maxAxes : number;
  freeRamSpace : number;
}