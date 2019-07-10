import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { TaskService, MCTask } from './task.service';
import { LoginService } from './login.service';

const GLOBAL = '_Global';

@Injectable()
export class WatchService {
  vars: WatchVar[];
  newVarName: string;
  newVarContext: string = GLOBAL;
  contexts: string[] = [GLOBAL];

  private _windowOpen: boolean = false;
  private interval: any;

  get windowOpen() {
    return this._windowOpen;
  }

  constructor(
    private ws: WebsocketService,
    private task: TaskService,
    private login: LoginService
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
      for (let t of list) {
        if (
          (t.name.endsWith('LIB') || t.name.endsWith('PRG')) &&
          !this.login.isAdmin
        )
          continue;
        this.contexts.push(t.name);
      }
    });
    this.interval = setInterval(() => {
      for (let v of this.vars) {
        if (!v.active) continue;
        if (v.name.length === 0) {
          v.active = false;
          continue;
        }
        let context = v.context === GLOBAL ? '' : v.context + '.';
        this.ws
          .query('watch ' + context + ' ' + v.name)
          .then((ret: MCQueryResponse) => {
            if (!v.active) return;
            if (ret.err) {
              v.value = ret.err.errMsg;
              v.active = false;
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
      ',"value":"' +
      (this.value || '') +
      '"}'
    );
  }
}
