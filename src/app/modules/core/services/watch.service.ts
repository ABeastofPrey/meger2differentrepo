import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { TaskService, MCTask } from './task.service';
import { LoginService } from './login.service';
import { environment } from '../../../../environments/environment';
import {ProjectManagerService} from './project-manager.service';

const GLOBAL = '_Global';

@Injectable()
export class WatchService {
  vars: WatchVar[];
  newVarName: string;
  newVarContext: string = GLOBAL;
  contexts: string[] = [GLOBAL];

  private _windowOpen: boolean = false;
  private interval: any;
  private env = environment;

  get windowOpen() {
    return this._windowOpen;
  }

  constructor(
    private ws: WebsocketService,
    private task: TaskService,
    private login: LoginService,
    private prj: ProjectManagerService
  ) {
    const cachedStr = localStorage.getItem('watch');
    if (cachedStr) {
      try {
        let vars: WatchVar[] = [];
        for (let v of JSON.parse(cachedStr))
          vars.push(new WatchVar(v.name, v.context));
        this.vars = vars;
      } catch (err) {
        console.log('ERROR', cachedStr, err);
        this.vars = [new WatchVar('', GLOBAL)];
      }
    } else {
      this.vars = [new WatchVar('', GLOBAL)];
    }
    this.ws.isConnected.subscribe(stat => {
      if (!stat) {
        this.stop();
      }
    });
  }

  toggleWindow() {
    this._windowOpen = !this._windowOpen;
    if (this._windowOpen) this.start();
    else this.stop();
  }

  delete(i: number) {
    this.vars[i].active = false;
    this.vars.splice(i, 1);
    this.vars[this.vars.length - 1].value = '';
    this.storeVars();
  }

  storeVars() {
    localStorage.setItem('watch', '[' + this.vars.toString() + ']');
  }

  start() {
    this.task.getList().then((list: MCTask[]) => {
      this.contexts = list
        .filter(t => {
          return (
            this.login.isAdmin ||
            (!t.name.endsWith('LIB') && !t.name.endsWith('PRG'))
          );
        })
        .map(t => {
          return t.name;
        });
      const prj = this.prj.currProject.value;
      if (prj) {
        this.contexts = this.contexts.concat(prj.apps.map(app=>{
          return app.name + '_DATA';
        }));
      this.contexts.sort();
      this.contexts.unshift(GLOBAL);
      }
    });
    this.interval = setInterval(() => {
      for (let v of this.vars) {
        if (v.name.trim().length === 0) v.record = false;
        if (!v.active) continue;
        if (v.name.length === 0) {
          v.active = false;
          continue;
        }
        let context: string;
        let separator:string = ' ';
        if (v.context === GLOBAL)
          context = '';
        else if (v.context.endsWith('_DATA')) {
          context = v.context.slice(0,-5) + '::';
          separator = '';
        }
        else
        context = v.context;
        this.ws
          .query('watch ' + context + separator + v.name)
          .then((ret: MCQueryResponse) => {
            if (!v.active) return;
            if (ret.err) {
              v.value = ret.err.errCode === '7195' ? '-' : ret.err.errMsg;
              v.active = false;
              if (!this.env.production) console.log(ret);
            } else {
              v.value = ret.result;
            }
          });
      }
    }, 200);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  toggleActive(v: WatchVar) {
    v.active = !v.active;
  }

  /*
   * @param WatchVar - The variable that was blurred
   */
  addBlankIfNeeded(v: WatchVar): boolean {
    let result = false;
    if (v.name.length > 0 && !v.active) v.active = true;
    if (this.vars[this.vars.length - 1].name.length > 0) {
      this.vars.push(new WatchVar('', GLOBAL));
      result = true;
    }
    this.storeVars();
    return result;
  }
}

class WatchVar {
  name: string;
  context: string;
  active: boolean = true;
  value: string;
  record: boolean = false;

  constructor(name: string, context: string) {
    this.name = name;
    this.context = context;
  }

  toString() {
    return (
      '{"name":"' +
      this.name +
      '","context":"' +
      this.context +
      '","active":' +
      this.active +
      ',"record":' +
      this.record +
      ',"value":"' +
      (this.value || '') +
      '"}'
    );
  }
}
