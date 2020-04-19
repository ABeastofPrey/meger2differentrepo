import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { TaskService, MCTask } from './task.service';
import { LoginService } from './login.service';
import { environment } from '../../../../environments/environment';
import {ProjectManagerService} from './project-manager.service';
import { Observable, of, Observer, interval } from 'rxjs';
import { map as rxjsMap, catchError, take, mergeMap } from 'rxjs/operators';
import { remove } from 'ramda';

const GLOBAL = '_Global';

@Injectable()
export class WatchService {
  vars: WatchVar[];
  newVarName: string;
  newVarContext: string = GLOBAL;
  contexts: string[] = [GLOBAL];

  private _windowOpen = false;
  private interval: number;
  private env = environment;
  private variableListMap = new Map<string, string[]>();

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
        const vars: WatchVar[] = [];
        for (const v of JSON.parse(cachedStr)) {
          vars.push(new WatchVar(v.name, v.context));
        }
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
    // this.vars[i].active = false;
    // this.vars.splice(i, 1);
    // this.vars[this.vars.length - 1].value = '';
    // this.storeVars();

    localStorage.removeItem('watch');
    const _remove = remove(i, 1);
    this.vars = _remove(this.vars);
    this.vars[this.vars.length - 1].value = '';
    this.vars[this.vars.length - 1].name = '';
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
    this.interval = window.setInterval(() => {
      for (const v of this.vars) {
        if (v.name.trim().length === 0) v.record = false;
        if (!v.active) continue;
        if (v.name.length === 0) {
          v.active = false;
          continue;
        }
        let context: string;
        let separator = ' ';
        if (v.context === GLOBAL) {
          context = '';
        }
        else if (v.context.endsWith('_DATA')) {
          context = v.context.slice(0,-5) + '::';
          separator = '';
        }
        else {
        context = v.context;
 }
        this.ws
          .query('watch ' + context + separator + v.name)
          .then((ret: MCQueryResponse) => {
            if (!v.active) return;
            if (ret.err) {
              for (const err of ret.err) {
                if (err.errType !== 'error') continue;
                v.value = err.errCode === '7195' ? '-' : err.errMsg;
                v.active = false;
                if (!this.env.production) console.log(ret);
              }
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
      // this.vars.push(new WatchVar('', GLOBAL));
      this.vars = [...this.vars, (new WatchVar('', GLOBAL))];
      result = true;
    }
    this.storeVars();
    return result;
  }

  public catchVariables(): void {
    this.variableListMap.clear();
    const contextSet = new Set<string>();
    this.vars.forEach(item => {
      contextSet.add(item.context);
    });
    const contextList = [...contextSet];
    const queryCount = contextList.length > 5 ? 5 : contextList.length;
    contextSet.clear();
    interval(300).pipe(
      mergeMap(i => {
        if (!contextList[i]) return of(null);
        return this.getVariablesWithContext(contextList[i])
      }),
      take(queryCount)
    ).subscribe((res) => {
      if (!res) return;
      this.vars.forEach(item => {
        const hasCatche = this.variableListMap.has(item.context);
        hasCatche && (item.variableList = of(this.variableListMap.get(item.context)))
      });
    });
  }

  public getVariablesWithContext(context: string): Observable<string[]> {
    return Observable.create((overver: Observer<string[]>) => {
      const hasCatche = this.variableListMap.has(context);
      if (hasCatche) {
        overver.next(this.variableListMap.get(context));
        return;
      }
      const api = `?getContextVariableList("${context}")`;
      const parser = (res: MCQueryResponse) => JSON.parse(res.result);
      const handler = errs => {
        console.warn(`Get variables with ${context} context failed: ${errs[0].msg}`);
        return of([]);
      };
      this.ws.observableQuery(api).pipe(
        rxjsMap(parser),
        catchError(handler)
      ).subscribe(queryList => {
        this.variableListMap.set(context, queryList);
        overver.next(queryList);
      });
    });
  }
}

export class WatchVar {
  name: string;
  context: string;
  active = true;
  value: string;
  record = false;
  public variableList: Observable<string[]>;

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
