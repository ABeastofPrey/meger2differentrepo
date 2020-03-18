import { Injectable, NgZone } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { ErrorFrame } from '../models/error-frame.model';
import { TpStatService } from './tp-stat.service';
import { TaskFilterPipe } from '../../task-manager/task-filter.pipe';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';


@Injectable()
export class TaskService {
  private interval: number = null;
  private lastTaskList: string = null;
  private isActive = false;
  private tasklistCommand = '?tasklist';
  private words: {};

  tasks: MCTask[] = [];

  constructor(
    private ws: WebsocketService,
    private filter: TaskFilterPipe,
    private stat: TpStatService,
    private zone: NgZone,
    private snack: MatSnackBar,
    private trn: TranslateService
  ) {
    this.trn.get(['dismiss']).subscribe(words=>{
      this.words = words;
    });
    this.stat.onlineStatus.subscribe(stat => {
      if (!this.ws.connected) {
        this.tasklistCommand = '?tasklist';
        return;
      }
      // TP LIB IS ONLINE
      const wasActive = this.isActive;
      this.stop();
      this.tasklistCommand = stat ? 'cyc1' : '?tasklist';
      if (wasActive) this.start();
    });
  }

  parseTasklist(list: string): MCTask[] {
    if (list.length === 0) {
      console.log('CYC1 RETURNED BLANK RESULT');
      this.tasklistCommand = '?tasklist';
      if (this.isActive) {
        this.start();
      }
      return [];
    }
    const tasks: MCTask[] = [];
    if (list === 'No tasks found') return tasks;
    const lines = list.split('\n');
    for (const line of lines) {
      if (line.trim().length === 0) continue;
      const parts: string[] = line.split(',');
      let name: string,
        state: string,
        priority: number,
        path: string = null;
      if (line.indexOf('Task') === 0) {
        name = parts[0].substring(9).trim();
        state = parts[1].substring(6).trim();
        priority = Number(parts[2].substring(9));
        if (parts[3]) {
          path = parts[3].substring(9);
        }
      } else if (line.indexOf('Global') === 0) {
        name = parts[0].substring(18).trim();
        (state = 'Loaded Globally'), (priority = null);
      } else {
        name = parts[0].substring(12).trim();
        (state = 'Loaded'), (priority = null);
      }
      tasks.push({
        name,
        state,
        priority,
        filePath: path,
      });
    }
    return tasks.sort((t1,t2)=>{
      return t1.name > t2.name ? 1 : -1;
    });
  }

  getList(): Promise<MCTask[]> {
    return this.ws.query(this.tasklistCommand).then((ret: MCQueryResponse) => {
      return this.parseTasklist(ret.result);
    });
  }

  start() {
    if (this.isActive) return;
    if (this.interval) this.ws.clearInterval(this.interval);
    this.isActive = true;
    this.interval = this.ws.send(
      this.tasklistCommand,
      false,
      (ret: string, cmd: string, err: ErrorFrame) => {
        if (err || ret === this.lastTaskList) return;
        this.zone.run(()=>{
          this.lastTaskList = ret;
          this.tasks = this.parseTasklist(ret);
        });
      },
      200
    );
  }

  stop() {
    if (this.interval) this.ws.clearInterval(this.interval);
    this.isActive = false;
    this.interval = null;
  }
  
  setDebugMode(on: boolean) {
    if (on) {
      this.stop();
    }
    else {
      this.start();
    }
  }

  run(indexes: number[], filters: boolean[], showErrors?: boolean) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (const i of indexes) {
      const task = filtered[i];
      if (task.priority === null) continue;
      this.ws.query('KillTask ' + task.name).then(() => {
        this.ws.query('StartTask ' + task.name).then(ret=>{
          if (!showErrors || !ret.err) return;
            this.snack.open(ret.err.errMsg,this.words['dismiss']);        
        });
      });
    }
  }

  kill(indexes: number[], filters: boolean[], showErrors?:boolean) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (const i of indexes) {
      const task = filtered[i];
      if (task.priority == null) continue;
      this.ws.query('KillTask ' + task.name).then(ret=>{
        if (!showErrors || !ret.err) return;
          this.snack.open(ret.err.errMsg,this.words['dismiss']);       
      });
    }
  }

  idle(indexes: number[], filters: boolean[], showErrors?: boolean) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (const i of indexes) {
      const task = filtered[i];
      if (task.priority == null) continue;
      this.ws.query('IdleTask ' + task.name).then(ret=>{
        if (!showErrors || !ret.err) return;
          this.snack.open(ret.err.errMsg,this.words['dismiss']);       
      });
    }
  }

  unload(indexes: number[], filters: boolean[], showErrors?: boolean) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (const i of indexes) {
      const task = filtered[i];
      const promise =
        task.priority == null
          ? Promise.resolve(null)
          : this.ws.query('KillTask ' + task.name);
      promise.then(() => {
        if (task.priority || task.state.indexOf('Global') === -1) {
          this.ws.query('Unload ' + task.name).then(ret=>{
            if (!showErrors || !ret.err) return;
            this.snack.open(ret.err.errMsg,this.words['dismiss']);           
          });
        }
      });
    }
  }

  resetAll() {
    this.stop();
    this.tasklistCommand = '?tasklist';
    return this.getList()
      .then(list => {
        this.tasks = list;
        const promises = [];
        const tasksCopy = this.tasks.slice();
        for (const task of tasksCopy) {
          if (task.priority !== null) {
            promises.push(this.ws.query('KillTask ' + task.name));
          }
        }
        return Promise.all(promises).then(ret => {
          console.log(ret);
          const promises = [];
          for (let i = 0; i < tasksCopy.length; i++) {
            const task = tasksCopy[i];
            if (task.priority || task.state.indexOf('Global') === -1) {
              console.log('Unload ' + task.name);
              promises.push(this.ws.query('Unload ' + task.name));
            }
          }
          return Promise.all(promises);
        });
      })
      .then(ret => {
        console.log(ret);
        this.start();
      });
  }
}

export interface MCTask {
  name: string;
  state: string;
  priority: number;
  filePath: string;
}
