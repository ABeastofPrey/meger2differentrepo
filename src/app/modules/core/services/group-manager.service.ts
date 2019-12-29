import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { ApiService } from './api.service';
import { NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupManagerService {
  sysInfo: SysInfo = null;
  groups: Group[] = [];
  sysInfoLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  groupsLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private groupInterval = NaN;
  private lastGrouplist: string = null;

  constructor(
    private ws: WebsocketService,
    private api: ApiService,
    private zone: NgZone
  ) {
    this.ws.isConnected.subscribe(stat => {
      if (stat) {
        this.api.getSysInfo().then((ret: SysInfo) => {
          ret.ver = ret.ver.substring(0, ret.ver.indexOf(','));
          this.sysInfo = ret;
          this.zone.runOutsideAngular(() => {
            this.groupInterval = window.setInterval(() => {
              this.refreshGroupsAndInfo();
            }, 2000);
          });
          return this.ws.query('?BUS[0].Cycletime');
        }).then((ret: MCQueryResponse)=>{
          const cycleTime = Number(ret.result) || 4; // in microseconds
          this.sysInfo.cycleTime = cycleTime / 1000; // in milliseconds
          this.sysInfoLoaded.next(true);
        });
      } else {
        clearInterval(this.groupInterval);
      }
    });
  }
  
  setDebugMode(on: boolean) {
    if (on) {
      clearInterval(this.groupInterval);
    } else {
      this.zone.runOutsideAngular(() => {
        this.groupInterval = window.setInterval(() => {
          this.refreshGroupsAndInfo();
        }, 2000);
      });
    }
  }

  private refreshSysInfo() {
    // ONLY REFRESHES REAL AXES
    this.ws.query('?sys.information').then((ret: MCQueryResponse) => {
      let index = ret.result.indexOf('Real number');
      if (index > 0) {
        let str = ret.result.substring(index + 19).trim();
        index = str.indexOf('\n');
        str = str.substring(0, index);
        this.sysInfo.realAxes = Number(str);
      }
    });
  }

  getGroup(name: string) {
    if (!name) return null;
    for (const g of this.groups) {
      if (g.name.toLowerCase() === name.toLowerCase()) return g;
    }
    return null;
  }

  private refreshGroupsAndInfo() {
    const promises = [this.ws.query('?grouplist')];
    Promise.all(promises).then(ret => {
      const grouplist: MCQueryResponse = ret[0];
      if (grouplist.result === this.lastGrouplist) return;
      this.zone.run(()=>{
        this.refreshSysInfo();
        this.lastGrouplist = grouplist.result;
        const elements: Group[] = [];
        if (grouplist.result.indexOf('No groups') === 0) {
          this.groups = [];
          this.groupsLoaded.next(true);
          return;
        }
        const groups = grouplist.result.split('\n');
        for (const g of groups) {
          const parts = g.split(':');
          elements.push({
            name: parts[0].trim(),
            axes: parts[1].trim().split(','),
          });
        }
        this.groups = elements;
        this.groupsLoaded.next(true);
      });
    });
  }
}

export interface Group {
  name: string;
  axes: string[];
}

export interface SysInfo {
  realAxes: number;
  features: string[];
  ver: string;
  diskSize: number;
  cycleTime: number;
  cpu: string;
  cpuFreq: number;
  freeDiskSpace: number;
  ramSize: number;
  platform: string;
  maxAxes: number;
  freeRamSpace: number;
  hash: string;
}
