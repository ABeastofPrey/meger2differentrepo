import { Injectable } from '@angular/core';
import {MCProject, ProjectSettings} from '../models/project/mc-project.model';
import {WebsocketService, MCQueryResponse} from './websocket.service';
import {TpStatService} from './tp-stat.service';
import {BehaviorSubject} from 'rxjs';
import {EventEmitter} from '@angular/core';
import {DataService} from './data.service';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class ProjectManagerService {
  
  currProject: BehaviorSubject<MCProject> = new BehaviorSubject(null);
  onExpand: EventEmitter<string> = new EventEmitter();
  onExpandLib: EventEmitter<{app:string,lib:string}> = new EventEmitter();
  onAppStatusChange: BehaviorSubject<any> = new BehaviorSubject(null);
  
  private interval: any;
  private oldStat: string = null;

  constructor(
    private ws: WebsocketService,
    private stat: TpStatService,
    private data: DataService,
    private snack: MatSnackBar
  ) {
    this.stat.onlineStatus.subscribe(ret=>{
      if (ret) {
        this.getCurrentProject().then(()=>{
          this.getProjectStatus();
        });
      } else {
        clearInterval(this.interval);
        this.currProject.next(null);
      }
    });
  }
  
  getProjectStatus() {
    if (this.interval)
      clearInterval(this.interval);
    this.interval = setInterval(()=>{
      if (this.currProject.value) {
        this.ws.query('?prj_get_status("' + this.currProject.value.name + '")')
        .then((ret: MCQueryResponse)=>{
          if (this.oldStat === ret.result)
            return;
          this.oldStat = ret.result;
          const status = ret.result.split(',');
          for (let i = 0; i < this.currProject.value.apps.length; i++) {
            this.currProject.value.apps[i].status = Number(status[i]);
          }
          this.onAppStatusChange.next(null);
        });
      } else {
        clearInterval(this.interval);
      }
    },200);
  }
  
  getCurrentProject() : Promise<any> {
    return this.ws.query('?prj_get_current_project').then((ret:MCQueryResponse)=>{
      if (ret.err)
        return Promise.reject(null);
      const projName = ret.result;
      let proj = new MCProject(projName);
      return this.ws.query('?prj_get_app_list("' + projName + '")')
      .then((ret:MCQueryResponse)=>{
        proj.initAppsFromString(ret.result);
        let promises : Promise<any>[] = [];
        const cmd = '?prj_get_app_libraries_list("' + projName + '","';
        for (let app of proj.apps) {
          promises.push(this.ws.query(cmd + app.name + '")'));
        }
        return Promise.all(promises);
      }).then((ret:MCQueryResponse[])=>{
        for (let i = 0; i < proj.apps.length; i++) {
          if (ret[i].result.length > 0) {
            proj.apps[i].libs = ret[i].result.split(',');
          }
        }
        return this.loadProgramSettings(proj);
        }).then(()=>{
          this.currProject.next(proj);
        });
    });
  }
  
  private loadProgramSettings(proj: MCProject) : Promise<any> {
    let promises: Promise<any>[] = [
      this.ws.query('?TP_GET_PROJECT_PARAMETER("vcruise","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("vtran","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("blendingmethod","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("tool","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("base","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("machinetable","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("workpiece","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("MOTIONOVERLAP","")'),
    ];
    return Promise.all(promises).then((results:MCQueryResponse[])=>{
      if (results[0].err === null && results[0].result.length > 0) {
        let n = Number(results[0].result);
        if (!isNaN(n))
          proj.settings.vcruise = n;
      }
      if (results[1].err === null && results[1].result.length > 0) {
        let n = Number(results[1].result);
        if (!isNaN(n))
          proj.settings.vtran = n;
      }
      if (results[2].err === null && results[2].result.length > 0) {
        let n = Number(results[2].result);
        if (!isNaN(n))
          proj.settings.blendingMethod = n;
      }
      if (results[3].err === null && results[3].result.length > 0) {
        proj.settings.tool = results[3].result;
      }
      if (results[4].err === null && results[4].result.length > 0) {
        proj.settings.base = results[4].result;
      }
      if (results[5].err === null && results[5].result.length > 0) {
        proj.settings.mtable = results[5].result;
      }
      if (results[6].err === null && results[6].result.length > 0) {
        proj.settings.wpiece = results[6].result;
      }
      proj.settings.overlap = results[7].result === '1';
    });
  }
  
  onProgramSettingChanged(setting:string) {
    let cmd = '?TP_SET_PROJECT_PARAMETER(';
    const settings = this.currProject.value.settings;
    switch (setting) {
      case 'tool':
        cmd += '"tool","","' + settings.tool + '")';
        break;
      case 'vcruise':
        cmd += '"vcruise","","' + settings.vcruise + '")';
        break;
      case 'vtran':
        cmd += '"vtran","","' + settings.vtran + '")';
        break;
      case 'blendingMethod':
        cmd += '"blendingmethod","","' + settings.blendingMethod + '")';
        break;
      case 'base':
        cmd += '"base","","' + settings.base + '")';
        break;
      case 'mtable':
        cmd += '"machinetable","","' + settings.mtable + '")';
        break;
      case 'wpiece':
        cmd += '"workpiece","","' + settings.wpiece + '")';
        break;
      case 'overlap':
        const val = settings.overlap ? '1' : '0';
        cmd += '"MOTIONOVERLAP","","' + val + '")';
        break;
      default:
        return;
    }
    this.ws.query(cmd).then(()=>{
      this.snack.open('Changes Saved.','',{duration:1500});
      switch (setting) {
        case 'tool':
          this.data.refreshTools();
          break;
        case 'base':
          this.data.refreshBases();
          break;
        case 'mtable':
          this.data.refreshMachineTables();
          break;
        case 'wpiece':
          this.data.refreshWorkPieces();
          break;
        default:
          return;
      }
    });
  }
}
