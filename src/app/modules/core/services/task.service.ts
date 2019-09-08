import { Injectable, ApplicationRef } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { ErrorFrame } from '../models/error-frame.model';
import { TpStatService } from './tp-stat.service';
import { TaskFilterPipe } from '../../task-manager/task-filter.pipe';

@Injectable()
export class TaskService {
  private interval: number = null;
  private lastTaskList: string = null;
  private isActive: boolean = false;
  private tasklistCommand = '?tasklist';

  tasks: MCTask[] = [];

  constructor(
    private ws: WebsocketService,
    private ref: ApplicationRef,
    private filter: TaskFilterPipe,
    private stat: TpStatService
  ) {
    this.stat.onlineStatus.subscribe(stat => {
      if (!this.ws.connected) {
        this.tasklistCommand = '?tasklist';
        return;
      }
      // TP LIB IS ONLINE
      this.stop();
      this.tasklistCommand = stat ? 'cyc1' : '?tasklist';
      this.start();
    });
  }

  parseTasklist(list: string): MCTask[] {
    if (list.length === 0) {
      this.tasklistCommand = '?tasklist';
      return [];
    }
    let tasks: MCTask[] = [];
    if (list === 'No tasks found') return tasks;
    let lines = list.split('\n');
    for (let line of lines) {
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
        name: name,
        state: state,
        priority: priority,
        filePath: path,
      });
    }
    return tasks;
  }

  getList(): Promise<MCTask[]> {
    return this.ws.query(this.tasklistCommand).then((ret: MCQueryResponse) => {
      return this.parseTasklist(ret.result);
    });
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.interval = this.ws.send(
      this.tasklistCommand,
      false,
      (ret: string, cmd: string, err: ErrorFrame) => {
        if (err || ret === this.lastTaskList) return;
        this.lastTaskList = ret;
        this.tasks = this.parseTasklist(ret);
        this.ref.tick();
      },
      200
    );
  }

  stop() {
    if (this.interval) this.ws.clearInterval(this.interval);
    this.isActive = false;
    this.interval = null;
  }

  run(indexes: number[], filters: boolean[]) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (let i of indexes) {
      let task = filtered[i];
      if (task.priority === null) continue;
      this.ws.query('KillTask ' + task.name).then(() => {
        this.ws.query('StartTask ' + task.name);
      });
    }
  }

  kill(indexes: number[], filters: boolean[]) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (let i of indexes) {
      const task = filtered[i];
      if (task.priority == null) continue;
      this.ws.query('KillTask ' + task.name);
    }
  }

  idle(indexes: number[], filters: boolean[]) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (let i of indexes) {
      let task = filtered[i];
      if (task.priority == null) continue;
      this.ws.query('IdleTask ' + task.name);
    }
  }

  unload(indexes: number[], filters: boolean[]) {
    const filtered: MCTask[] = this.filter.transform(this.tasks, filters);
    for (let i of indexes) {
      let task = filtered[i];
      const promise =
        task.priority == null
          ? Promise.resolve(null)
          : this.ws.query('KillTask ' + task.name);
      promise.then(() => {
        if (task.priority || task.state.indexOf('Global') === -1)
          this.ws.query('Unload ' + task.name);
      });
    }
  }

  resetAll() {
    this.stop();
    this.tasklistCommand = '?tasklist';
    return this.getList()
      .then(() => {
        let promises = [];
        const tasksCopy = this.tasks.slice();
        for (let task of tasksCopy) {
          if (task.priority !== null)
            promises.push(this.ws.query('KillTask ' + task.name));
        }
        return Promise.all(promises).then(ret => {
          console.log(ret);
          let promises = [];
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
