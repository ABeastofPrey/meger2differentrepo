import { Component, OnInit } from '@angular/core';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../modules/core/services/websocket.service';
import { ScreenManagerService, LoginService } from '../core';
import { Router } from '@angular/router';
import { ProgramEditorService } from '../program-editor/services/program-editor.service';

@Component({
  selector: 'error-history',
  templateUrl: './error-history.component.html',
  styleUrls: ['./error-history.component.css'],
})
export class ErrorHistoryComponent implements OnInit {
  
  initDone = false;

  private _errors: MCError[] = [];
  private interval: number;
  private lastErrString: string = null;

  constructor(
    private ws: WebsocketService,
    private mgr: ScreenManagerService,
    private router: Router,
    private prg: ProgramEditorService,
    public login: LoginService
  ) {}

  ngOnInit() {
    this.refreshErrors();
    this.interval = window.setInterval(() => {
      this.refreshErrors();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
  
  get errors() {
    return this._errors;
  }

  update(errString: string) {
    if (errString === this.lastErrString) return;
    this.lastErrString = errString;
    if (errString === 'No error history') {
      this._errors = [];
      this.initDone = true;
      return;
    }
    const errors: string[] = errString.split('\n').reverse();
    let newErrors: MCError[] = [];
    for (let i = 1; i < errors.length - 3; i++) {
      newErrors.push(new MCError(errors[i]));
    }
    // GROUP
    newErrors.forEach((err: MCError, i, arr)=>{
      if (i === 0) return;
      if (arr[i - 1].code === err.code &&
         arr[i - 1].task === err.task &&
         arr[i - 1].line === err.line
      ) {
        err.parent = arr[i - 1].parent || arr[i-1];
        err.parent.children.push(err);
      }
    });
    newErrors = newErrors.filter(err=>{
      return err.parent === null;
    });
    this._errors = newErrors.sort((e1,e2)=>{
      return e1.timestamp > e2.timestamp ? -1 : 1;
    });
    if (!this.initDone) this.initDone = true;
  }

  clearErrors() {
    this.ws.query('errorhistoryclear').then(() => {
      this.refreshErrors();
    });
  }

  clearDrive() {
    this.ws.query('?TP_CLRFAULT').then(() => {
      this.ws.query('?TP_CONFIRM_ERROR');
    });
  }

  acknowledge() {
    this.ws.send('?TP_CONFIRM_ERROR', true);
  }

  refreshErrors() {
    // ONCE, NOT INTERVAL
    this.ws.query('?errorhistory').then((result: MCQueryResponse) => {
      if (result.err) return;
      this.update(result.result);
      this.ws.query('?TP_CONFIRM_ERROR');
    });
  }

  goToError(err: string) {
    let path = err.substring(11);
    path = path.substring(0, path.lastIndexOf('/')) + '/';
    const fileName = err.substring(err.lastIndexOf('/') + 1);
    this.mgr.screen = this.mgr.screens[2];
    this.router.navigateByUrl('/projects');
    this.prg.setFile(fileName, path, null, -1);
    this.prg.mode = 'editor';
  }
}

export class MCError {
  
  private date: string;
  private time: string;
  private severity: string;
  private _code: string;
  private _task: string;
  private file: string;
  private _line: string;
  private module: string;
  private message: string;
  private _parent: MCError = null;
  
  children: MCError[] = [];
  
  get timestamp(): number {
    if (this.date && this.time) {
      return Date.parse(this.date + ' ' + this.time);
    }
    return 0;
  }
  
  get code() {
    return this._code;
  }
  
  set parent(err: MCError) {
    this._parent = err;
  }
  
  get parent() {
    return this._parent;
  }
  
  get task() {
    return this._task;
  }
  
  get line() {
    return this._line;
  }

  constructor(str: string) {
    try {
      const index = str.indexOf('"');
      const data = str.substr(0, index).split(' ');
      const parts: string[] = [];
      data.forEach(str => {
        if (str !== null && str.length > 0) parts.push(str);
      });
      let count = 0;
      this.date = parts[count];
      count++;
      this.time = parts[count];
      count++;
      this.severity = parts[count].toUpperCase();
      if (this.severity === 'FATAL') {
        count++;
        this.severity += ' ' + parts[count].toUpperCase();
      }
      count++;
      this._code = parts[count];
      count++;
      this._task = parts[count];
      count++;
      this.file = parts[count];
      count++;
      this._line = parts[count];
      count++;
      this.module = parts[count];
      if (this.module === undefined) {
        this.module = this.line;
        this._line = this.file;
        this.file = ' ';
      }
      count++;
      this.message = str.substr(index + 1).slice(0, -2);
      for (let j = count; j < parts.length; j++) {
        this.message += parts[j] + ' ';
      }
    } catch (err) {
      this.date = '';
      this.time = '';
      this.severity = '';
      this._code = '';
      this._task = '';
      this.file = '';
      this._line = '';
      this.module = '';
      this.message = '';
      console.log(err);
    }
  }
}
