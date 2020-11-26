import { Injectable, NgZone } from '@angular/core';
import { MCProject, Limit } from '../models/project/mc-project.model';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { BehaviorSubject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { DataService } from './data.service';
import { MatSnackBar } from '@angular/material';
import { ScreenManagerService } from './screen-manager.service';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { TreeNode } from '../../file-tree/components/mc-file-tree/mc-file-tree.component';
import { TpStatService } from './tp-stat.service';
import {CommonService} from './common.service';
import {UtilsService} from '../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';
import { CustomKeyBoardComponent } from '../../../components/custom-key-board/custom-key-board.component';

/*
 * THIS SERVICE MANAGES THE PROJECTS IN THE PROJECT EDITOR, BUT ALSO MANAGES
 * SOME FUNCTIONALITY OF THE CONTROLLER FILES, BECAUSE IT'S ON THE SAME
 * SCREEN.
 */
@Injectable()
export class ProjectManagerService {
  currProject: BehaviorSubject<MCProject> = new BehaviorSubject(null);
  onExpand: EventEmitter<number> = new EventEmitter();
  onExpandLib: EventEmitter<{ app: string; lib: string }> = new EventEmitter();
  onExpandDep: EventEmitter<string> = new EventEmitter();
  fileRefreshNeeded: EventEmitter<void> = new EventEmitter();
  onAppStatusChange: BehaviorSubject<void> = new BehaviorSubject(null);
  activeProject = false; // TRUE IF ONE APP IS LOADED AND NOT KILLED
  isLoading = false;
  checklistSelection = new SelectionModel<TreeNode>(true /* multiple */);

  private interval: number;
  private oldStat: string = null;

  private words: string;

  constructor(
    private ws: WebsocketService,
    private data: DataService,
    private snack: MatSnackBar,
    private mgr: ScreenManagerService,
    private trn: TranslateService,
    private stat: TpStatService,
    private zone: NgZone,
    private cmn: CommonService,
    private utils: UtilsService,
    private snackbarService: SysLogSnackBarService
  ) {
    this.trn.get('changeOK').subscribe(words => {
      this.words = words;
    });
    this.data.dataLoaded.subscribe(ret => {
      this.zone.run(() => {
        if (ret) {
          this.getCurrentProject();
        } else {
          clearInterval(this.interval);
          this.currProject.next(null);
        }
      });
    });
    this.ws.isConnected.subscribe(stat => {
      if (!stat) {
        this.reset();
      }
    });
    this.stat.onlineStatus.subscribe(stat => {
      if (!stat) {
        this.reset();
      }
    });
  }

  reset() {
    this.stopStatusRefresh();
    this.currProject.next(null);
    this.oldStat = null;
    this.stat.onProjectLoaded.emit(false);
  }

  stopStatusRefresh() {
    if (this.interval) clearInterval(this.interval);
  }

  setDebugMode(on: boolean) {
    if (on) {
      this.reset();
    }
  }

  getProjectStatus() {
    if (this.interval) clearInterval(this.interval);
    this.oldStat = null;
    let waiting = false;
    this.zone.runOutsideAngular(()=>{
      this.interval = window.setInterval(() => {
        if (waiting) return;
        if (this.currProject.value) {
          waiting = true;
          return this.ws
            .query('cyc3,' + this.currProject.value.name)
            .then((ret: MCQueryResponse) => {
              waiting = false;
              if (ret.result.length === 0) {
                console.warn('CYC3 RETURNED BLANK RESULT');
                this.stopStatusRefresh();
                return;
              }
              if (this.currProject.value === null || this.oldStat === ret.result) return;
              this.zone.run(()=>{
                this.oldStat = ret.result;
                const parts = ret.result.split(';');
                this.currProject.value.dependenciesLoaded = parts[1] === '1';
                this.currProject.value.projectPaused = parts[2] === '1';
                if (parts[0].length === 0) {
                  this.activeProject = false;
                  this.mgr.projectActiveStatusChange.next(this.activeProject);
                  for (const app of this.currProject.value.apps) {
                    app.status = -1;
                  }
                  this.onAppStatusChange.next(null);
                  return;
                }
                const status = parts[0].split(',');
                let i = 0;
                let activeProject = false;
                while (
                  status.length > 0 ||
                  i < this.currProject.value.apps.length
                ) {
                  if (
                    this.currProject.value.apps[i] &&
                    !this.currProject.value.apps[i].active
                  ) {
                    i++;
                    continue;
                  }
                  const code = Number(status.shift());
                  if (this.currProject.value.apps[i]) {
                    this.currProject.value.apps[i].status = code;
                  }
                  if (code !== -1) {
                    activeProject = true;
                  }
                  i++;
                }
                this.activeProject = activeProject;
                this.mgr.projectActiveStatusChange.next(this.activeProject);
                if (this.activeProject && !this.cmn.isTablet) {
                  this.mgr.closeControls();
                }
                this.onAppStatusChange.next(null);
              });
            });
        } else {
          clearInterval(this.interval);
        }
      }, 200);
    });
  }

  /* Refreshes the app list and lib list for the given project.
   *  Params: MCPRoject   - project to refresh
   *          existing  - TRUE if refresh is done for an existing project
   */
  refreshAppList(proj: MCProject, existing: boolean): Promise<void> {
    const projName = proj.name;
    if (existing) {
      this.isLoading = true;
      this.stopStatusRefresh();
    }
    const queries = [
      this.ws.query('?prj_get_app_list("' + projName + '")'),
      this.ws.query('?bkg_getbgtasklist')
    ];
    return Promise.all(queries).then(([ret, bgtRes]) => {
      const bgtList = JSON.parse(bgtRes.result);
      proj.backgroundTaskList = bgtList;
      proj.initAppsFromString(ret.result);
      const promises = [];
      const cmd = '?prj_get_app_libraries_list("' + projName + '","';
      for (const app of proj.apps) {
        promises.push(this.ws.query(cmd + app.name + '")'));
      }
      return Promise.all(promises);
    })
      .then((ret: MCQueryResponse[]) => {
        for (let i = 0; i < proj.apps.length; i++) {
          if (ret[i].result.length > 0) {
            proj.apps[i].libs = ret[i].result.split(',');
          }
        }
        return this.refreshAppIds(proj);
      })
      .then(() => {
        if (existing) {
          this.getProjectStatus(); // RESTART PROJECT STATUS QUERY
          this.isLoading = false;
          this.currProject.next(proj);
        }
      });
  }

  getCurrentProject(): Promise<void> {
    return this.ws.query('?prj_get_current_project').then((ret: MCQueryResponse) => {
      if (ret.err || !this.stat.onlineStatus.value) {
        return Promise.resolve(null);
      }
      this.isLoading = true;
      const projName = ret.result;
      const proj = new MCProject(projName);
      return this.refreshAppList(proj, false)
        .then(() => {
          return this.loadProgramSettings(proj);
        })
        .then(() => {
          return this.refreshDependencies(proj);
        })
        .then(() => {
          this.isLoading = false;
          this.currProject.next(proj);
          this.stat.onProjectLoaded.emit(true);
        });
    });
  }

  refreshDependencies(proj: MCProject): Promise<void> {
    this.isLoading = true;
    const cmd = '?PRJ_GET_USER_DEPENDENCIES("' + proj.name + '")';
    return this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result.length === 0) {
        proj.dependencies = [];
        this.isLoading = false;
        return;
      }
      proj.dependencies = ret.result.split(',');
      this.currProject.next(proj);
      this.isLoading = false;
    });
  }

  private refreshAppIds(proj: MCProject): Promise<void> {
    const promises = [];
    for (const app of proj.apps) {
      promises.push(this.ws.query('?TP_GET_APP_ID("' + app.name + '")'));
      promises.push(
        this.ws.query(
          '?PRJ_GET_APP_DESCRIPTION("' + proj.name + '","' + app.name + '")'
        )
      );
    }
    return Promise.all(promises).then((results: MCQueryResponse[]) => {
      for (let i = 0; i < results.length; i += 2) {
        proj.apps[i / 2].id = Number(results[i].result);
        proj.apps[i / 2].desc = results[i + 1].result;
      }
    });
  }

  toggleAutoStart() {
    const prj = this.currProject.value;
    const newVal = prj.settings.autoStart ? 0 : 1;
    const cmd = '?PRJ_SET_AUTO_START("' + prj.name + '",' + newVal + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        prj.settings.autoStart = !prj.settings.autoStart;
      }
    });

  }

  private loadProgramSetting(setting: string, proj: MCProject): Promise<void> {
    switch (setting) {
      case 'ascale':
        return this.ws.query('?TP_GET_PROJECT_PARAMETER("ascale","")').then(ret=>{
          if (ret.err || ret.result.length === 0) return;
          const n = Number(ret.result);
          if (!isNaN(n)) proj.settings.ascale = n;
        });
      case 'vscale':
        return this.ws.query('?TP_GET_PROJECT_PARAMETER("vscale","")').then(ret=>{
          if (ret.err || ret.result.length === 0) return;
          const n = Number(ret.result);
          if (!isNaN(n)) proj.settings.vscale = n;
        });
      case 'vtran':
        return this.ws.query('?TP_GET_PROJECT_PARAMETER("vtran","")').then(ret=>{
          if (ret.err || ret.result.length === 0) return;
          const n = Number(ret.result);
          if (!isNaN(n)) proj.settings.vtran = n;
        });
      case 'blendingmethod':
        return this.ws.query('?TP_GET_PROJECT_PARAMETER("blendingmethod","")').then(ret=>{
          if (ret.err || ret.result.length === 0) return;
          const n = Number(ret.result);
          if (!isNaN(n)) proj.settings.blendingMethod = n;
        });
      default:
        break;
    }
    return Promise.reject();
  }

  private async loadProgramSettings(proj: MCProject): Promise<void> {
    let promises: Array<Promise<void | MCQueryResponse>> = [
      this.loadProgramSetting('vscale',proj),
      this.loadProgramSetting('ascale',proj),
      this.loadProgramSetting('vtran',proj),
      this.loadProgramSetting('blendingmethod',proj)
    ];
    await Promise.all(promises);
    promises =[
      this.ws.query('?TP_GET_PROJECT_PARAMETER("tool","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("base","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("machinetable","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("workpiece","")'),
      this.ws.query('?TP_GET_PROJECT_PARAMETER("MOTIONOVERLAP","")'),
      this.ws.query('?TP_GET_PROJECT_VRATE'),
      this.ws.query('?PRJ_GET_AUTO_START("' + proj.name + '")'),
    ];
    return Promise.all(promises as Array<Promise<MCQueryResponse>>)
      .then(results => {
        if (results[0].err === null && results[0].result.length > 0) {
          proj.settings.tool = results[0].result;
        }
        if (results[1].err === null && results[1].result.length > 0) {
          proj.settings.base = results[1].result;
        }
        if (results[2].err === null && results[2].result.length > 0) {
          proj.settings.mtable = results[2].result;
        }
        if (results[3].err === null && results[3].result.length > 0) {
          proj.settings.wpiece = results[3].result;
        }
        proj.settings.overlap = results[4].result === '1';
        proj.settings.vrate = Number(results[5].result);
        proj.settings.autoStart = results[6].result === '1';
        const posArr: Limit[] = [];
        const promises = [];
        for (let j = 1; j <= this.data.locationDescriptions.length; j++) {
          const unit = j === 3 && this.data.robotType === 'SCARA' ? 'mm' : 'deg';
          posArr.push(new Limit('P', unit));
          promises.push(
            this.ws.query('?TP_GET_PROJECT_PARAMETER("PMIN","' + j + '")')
          );
          promises.push(
            this.ws.query('?TP_GET_PROJECT_PARAMETER("PMAX","' + j + '")')
          );
        }
        proj.settings.limits.position = posArr;
        return Promise.all(promises);
      })
      .then((ret: MCQueryResponse[]) => {
        for (let j = 0; j < ret.length; j++) {
          const i = Math.floor(j / 2);
          if (j % 2 === 0) {
            proj.settings.limits.position[i].min = Number(ret[j].result);
          }
          else proj.settings.limits.position[i].max = Number(ret[j].result);
        }
        const promises = [
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMIN","")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMAX","")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMIN","")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMAX","")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMIN","")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMAX","")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMIN","BASE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMAX","BASE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMIN","BASE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMAX","BASE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMIN","BASE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMAX","BASE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMIN","TOOL")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMAX","TOOL")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMIN","TOOL")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMAX","TOOL")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMIN","TOOL")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMAX","TOOL")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMIN","WORKPIECE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMAX","WORKPIECE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMIN","WORKPIECE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMAX","WORKPIECE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMIN","WORKPIECE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMAX","WORKPIECE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMIN","MACHINETABLE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("XMAX","MACHINETABLE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMIN","MACHINETABLE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("YMAX","MACHINETABLE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMIN","MACHINETABLE")'),
          this.ws.query('?TP_GET_PROJECT_PARAMETER("ZMAX","MACHINETABLE")'),
        ];
        return Promise.all(promises).then((ret: MCQueryResponse[]) => {
          // WORLD
          proj.settings.limits.world[0].min = ret[0].result;
          proj.settings.limits.world[0].max = ret[1].result;
          proj.settings.limits.world[1].min = ret[2].result;
          proj.settings.limits.world[1].max = ret[3].result;
          proj.settings.limits.world[2].min = ret[4].result;
          proj.settings.limits.world[2].max = ret[5].result;
          // BASE
          proj.settings.limits.base[0].min = ret[6].result;
          proj.settings.limits.base[0].max = ret[7].result;
          proj.settings.limits.base[1].min = ret[8].result;
          proj.settings.limits.base[1].max = ret[9].result;
          proj.settings.limits.base[2].min = ret[10].result;
          proj.settings.limits.base[2].max = ret[11].result;
          // TOOL
          proj.settings.limits.tool[0].min = ret[12].result;
          proj.settings.limits.tool[0].max = ret[13].result;
          proj.settings.limits.tool[1].min = ret[14].result;
          proj.settings.limits.tool[1].max = ret[15].result;
          proj.settings.limits.tool[2].min = ret[16].result;
          proj.settings.limits.tool[2].max = ret[17].result;
          // WORKPIECE
          proj.settings.limits.wp[0].min = ret[18].result;
          proj.settings.limits.wp[0].max = ret[19].result;
          proj.settings.limits.wp[1].min = ret[20].result;
          proj.settings.limits.wp[1].max = ret[21].result;
          proj.settings.limits.wp[2].min = ret[22].result;
          proj.settings.limits.wp[2].max = ret[23].result;
          // MACHINETABLE
          proj.settings.limits.mt[0].min = ret[24].result;
          proj.settings.limits.mt[0].max = ret[25].result;
          proj.settings.limits.mt[1].min = ret[26].result;
          proj.settings.limits.mt[1].max = ret[27].result;
          proj.settings.limits.mt[2].min = ret[28].result;
          proj.settings.limits.mt[2].max = ret[29].result;
        });
      });
  }

  onLimitChanged(
    name: string,
    e: Event,
    paramType: string,
    prevValue: number,
    limit: Limit,
    keyboardContext?: CustomKeyBoardComponent
  ) {
    const target = e.target as HTMLInputElement;
    if (target.value === null || target.value === undefined || target.value.toString().trim().length === 0) {
      this.updateModel(name, limit, prevValue,keyboardContext);
      return;
    }
    const cmd =
      '?TP_SET_PROJECT_PARAMETER("' +
      name +
      '","' +
      paramType +
      '","' +
      target.value +
      '")';
    this.ws.query(cmd).then(ret => {
      if (ret.result === '0') {
        //   this.snack.open(this.words, '', { duration: 1500 });
          this.snackbarService.openTipSnackBar(this.words);
          this.updateModel(name, limit, target.value,keyboardContext);

      } else {
        this.updateModel(name, limit, prevValue,keyboardContext);
      }
    });
  }

  private updateModel(name: string, limit: Limit, newVal: number | string,keyboardContext?: CustomKeyBoardComponent) {
    newVal = newVal.toString();
    if (name.endsWith('min')) {
      limit.min = newVal.toString();
    } else {
      limit.max = newVal.toString();
    }
    keyboardContext && keyboardContext.setControlValue(newVal);
  }

  onProgramSettingChanged(setting: string) {
    let cmd = '?TP_SET_PROJECT_PARAMETER(';
    const settings = this.currProject.value.settings;
    switch (setting) {
      case 'tool':
        cmd += '"tool","","' + settings.tool + '")';
        break;
      case 'ascale':
        cmd += '"ascale","","' + settings.ascale + '")';
        break;
      case 'vscale':
        cmd += '"vscale","","' + settings.vscale + '")';
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
    this.ws.query(cmd).then(ret => {
      let ok = false;
      if (ret.result === '0') {
        ok = true;
        this.snackbarService.openTipSnackBar(this.words);
      }
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
        case 'ascale':
        case 'vscale':
        case 'vtran':
          if (!ok) {
            this.loadProgramSetting(setting, this.currProject.value);
          }
          break;
        default:
          return;
      }
    });
  }

  public async isBGTLoaded(name: string): Promise<boolean> {
    const api = `?${name}.BKG.STATE`;
    return new Promise(resolve => {
      this.ws.query(api).then(({err}) => {
        resolve(err === null);
      });
    });
  }
}
