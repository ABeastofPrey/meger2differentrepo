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
  public errors: MCError[] = [];
  public initDone: boolean = false;

  private interval: any;
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
    this.interval = setInterval(() => {
      this.refreshErrors();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  update(errString: string) {
    if (errString === this.lastErrString) return;
    this.lastErrString = errString;
    if (errString === 'No error history') {
      this.errors = [];
      this.initDone = true;
      return;
    }
    let errors: string[] = errString.split('\n').reverse();
    let newErrors: MCError[] = [];
    for (let i = 1; i < errors.length - 3; i++) {
      newErrors.push(new MCError(errors[i]));
    }
    this.errors = newErrors;
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
  private code: string;
  private task: string;
  private file: string;
  private line: string;
  private module: string;
  private message: string;

  constructor(str: string) {
    var index = str.indexOf('"');
    var data = str.substr(0, index).split(' ');
    var parts: string[] = [];
    data.forEach(str => {
      if (str !== null && str.length > 0) parts.push(str);
    });
    this.date = parts[0];
    this.time = parts[1];
    this.severity = parts[2].toUpperCase();
    this.code = parts[3];
    this.task = parts[4];
    this.file = parts[5];
    this.line = parts[6];
    this.module = parts[7];
    if (this.module === undefined) {
      this.module = this.line;
      this.line = this.file;
      this.file = ' ';
    }
    this.message = str.substr(index + 1).slice(0, -2);
    for (var j = 8; j < parts.length; j++) this.message += parts[j] + ' ';
  }
}
