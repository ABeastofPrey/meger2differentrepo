import { Injectable } from '@angular/core';
import {WebsocketService, MCQueryResponse} from './websocket.service';
import {TaskService, MCTask} from './task.service';

const GLOBAL = '_Global';

@Injectable()
export class WatchService {
  
  vars : WatchVar[] = [];
  newVarName : string;
  newVarContext : string = GLOBAL;
  contexts : string[] = [GLOBAL];
  
  private _windowOpen : boolean = false;
  private interval : any;
  
  get windowOpen() {
    return this._windowOpen;
  }

  constructor(private ws: WebsocketService, private task: TaskService) {
    this.ws.isConnected.subscribe(stat=>{
      if (!stat) {
        this.stop();
      }
    })
  }
  
  toggleWindow() {
    this._windowOpen = !this._windowOpen;
    if (this._windowOpen)
      this.start();
    else
      this.stop();
  }
  
  addVar() {
    if (typeof this.newVarName==='undefined' || this.newVarName === null || this.newVarName.length===0)
      return;
    this.vars.push(new WatchVar(this.newVarName, this.newVarContext));
    this.newVarName = null;
    this.newVarContext = GLOBAL;
  }
  
  delete(i:number) {
    this.vars.splice(i,1);
  }
  
  start() {
    this.task.getList().then((list:MCTask[])=>{
      for (let t of list) {
        this.contexts.push(t.name);
      }
    });
    this.interval = setInterval(()=>{
      let promises : Promise<any>[] = [];
      for (let i = 0; i < this.vars.length; i++) {
        let v = this.vars[i];
        let context = v.context === GLOBAL ? '' : v.context + '.';
        promises.push(this.ws.query('?' + context + v.name));
      }
      Promise.all(promises).then((results:MCQueryResponse[])=>{
        for (let i = 0; i < results.length; i++) {
          if (this.vars[i] && results[i].cmd.indexOf(this.vars[i].name)>-1){
            this.vars[i].value = 
              results[i].err ? results[i].err.errMsg : results[i].result;
          }
        }
      });
    },1000);
  }
  
  stop() {
    if (this.interval)
      clearInterval(this.interval);
  }

}

class WatchVar {
  name: string;
  context: string;
  active: boolean = true;
  value: string;
  
  constructor(name:string, context:string){
    this.name = name;
    this.context = context;
  }
}
