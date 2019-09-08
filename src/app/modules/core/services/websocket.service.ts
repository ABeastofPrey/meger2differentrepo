import { Injectable, NgZone } from '@angular/core';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { NotificationService } from './notification.service';
import { JwtService } from './jwt.service';
import { ErrorFrame } from '../models/error-frame.model';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './lang.service';
import { TpDialogComponent } from '../../../components/tp-dialog/tp-dialog.component';

interface MCResponse {
  msg: string;
  cmd: string;
  cmd_id: number;
}

export interface MCQueryResponse {
  result: string;
  cmd: string;
  err: ErrorFrame;
}

@Injectable()
export class WebsocketService {
  private socketQueueId: number = 0;
  private socketQueue: Function[] = [];
  private socketQueueIntervals: boolean[] = [];
  private _isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private _isTimeout: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private timeout: any;
  private worker = new Worker('assets/scripts/conn.js');
  private _port: string = null;
  private _otherClients: number = 0;

  private words: any;

  get port() {
    return this._port;
  }
  updateFirmwareMode: boolean = false;

  get connected(): boolean {
    return this._isConnected.value;
  }

  get isConnected(): Observable<boolean> {
    return this._isConnected.asObservable();
  }

  get isTimeout(): Observable<boolean> {
    return this._isTimeout.asObservable();
  }

  get otherClients(): number {
    return this._otherClients;
  }

  connect() {
    this.worker.postMessage({ msg: 0, serverMsg: true }); // CONNECT REQUEST
    this.timeout = setTimeout(() => {
      if (!this._isConnected.value) {
        this._isTimeout.next(true);
        this.timeout = null;
      }
    }, 5000);
  }

  reset() {
    this.worker.postMessage({ msg: 1, serverMsg: true }); // RESET REQUEST
    this.socketQueueId = 0;
    this.socketQueue = [];
    this._isTimeout.next(false);
    this._isConnected.next(false);
    this.notification.clear();
  }

  constructor(
    public dialog: MatDialog,
    private _zone: NgZone,
    private notification: NotificationService,
    private jwt: JwtService,
    private router: Router,
    private lang: LangService,
    private trn: TranslateService
  ) {
    this.lang.init();
    this.trn.get('websocket.err_es_busy').subscribe(words => {
      this.words = words;
    });
    this._zone.runOutsideAngular(() => {
      this.worker.onmessage = e => {
        if (e.data.serverMsg) {
          this._zone.run(() => {
            switch (e.data.msg) {
              case 0: // ONOPEN - Websocket connected, Testing connection...
                Promise.all([
                  this.query('java_port'),
                  this.query('java_es'),
                ]).then(
                  (ret: any[]) => {
                    this._port = ret[0].result;
                    this._otherClients = Number(ret[1].result) - 1;
                    this._isConnected.next(true);
                    clearTimeout(this.timeout);
                    this.timeout = null;
                  },
                  err => {
                    console.log('error!');
                  }
                );
                break;
              case 1: // ONERROR
                this.reset();
                if (this.timeout) {
                  clearTimeout(this.timeout);
                  this.timeout = null;
                }
                break;
              case 2: // ONCLOSE
                if (this.timeout) {
                  clearTimeout(this.timeout);
                  this.timeout = null;
                }
                for (let ref of this.dialog.openDialogs) {
                  if (ref.id !== 'update' && ref.id !== 'system') ref.close();
                }
                if (e.data.code === 4003) {
                  this._zone.run(() => {
                    this.dialog
                      .open(ErrorDialogComponent, {
                        data: this.words,
                        id: 'system',
                      })
                      .afterClosed()
                      .subscribe(() => {
                        this.router.navigateByUrl('/login');
                      });
                  });
                }
                this.reset();
                break;
              case 3: // TIMEOUT
                break;
            }
          });
        } else {
          this.handleMessage(e.data.msg);
        }
        e = null;
      };
    });
  }

  send(msg: string, force: boolean, callback?, interval?: number) {
    //console.log('send',msg);
    this.socketQueueId++;
    if (this.socketQueueId === 32766)
      this.socketQueueId = 1000;
    if (callback) {
      this.socketQueue['i_' + this.socketQueueId] = callback;
      if (interval) this.socketQueueIntervals['i_' + this.socketQueueId] = true;
    }
    var MCMessage = {
      msg: msg,
      cmd_id: this.socketQueueId,
      token: this.jwt.getToken(),
    };
    var str = JSON.stringify(MCMessage);
    this.worker.postMessage({
      msg: str,
      serverMsg: false,
      interval: interval,
      id: this.socketQueueId,
      force: force,
    });
    msg = null;
    return this.socketQueueId;
  }

  query(query) {
    return new Promise((resolve, reject) => {
      this.send(query, false, function(result, cmd: string, err) {
        resolve({ result: result, cmd: cmd, err: err });
      });
    }).catch(reason => {});
  }

  handleMessage(data: MCResponse) {
    var errFrame = null;
    //console.log('receive',data['cmd']);
    var isErrorFrame = data['msg'].indexOf('$ERRORFRAME$') === 0;
    if (isErrorFrame) {
      data['msg'] = data['msg'].substr(12);
      errFrame = new ErrorFrame(data['msg']);
      console.log(data['cmd'] + ' >> ' + data['msg']);
      if (
        errFrame.errType !== 'NOTE' &&
        errFrame.errType !== 'INFO' &&
        typeof this.socketQueue['i_' + data['cmd_id']] !== 'function'
      ) {
        alert(errFrame.errMsg);
      }
    } else if (typeof data['cmd_id'] !== 'undefined' && data['cmd_id'] === -1) {
      // Server Announcment
      if (data['msg'].indexOf('>>>') === 0) {
        // TP DIALOG MSG
        let strings: string[] = data['msg'].slice(3, -5).split(',');
        this._zone.run(() => {
          this.dialog
            .open(TpDialogComponent, {
              width: '400px',
              data: {
                msg: strings[0],
                action1: strings[1],
                action2: strings[2],
                action3: strings[3],
              },
            })
            .afterClosed()
            .subscribe(i => {
              switch (i) {
                case 1:
                  this.query('?TP_DIALOG_ANSWER(1,0,0)');
                  break;
                case 2:
                  this.query('?TP_DIALOG_ANSWER(0,1,0)');
                  break;
                case 3:
                  this.query('?TP_DIALOG_ANSWER(0,0,1)');
                  break;
              }
            });
        });
      } else if (data['msg'].indexOf('%%%') === 0) {
        // CLIENT UPDATE NOTIFICATION
        this._zone.run(() => {
          this._otherClients = Number(data['msg'].substring(3)) - 1;
        });
      } else {
        // Other Server announcements
        this.notification.onAsyncMessage(data['msg']);
      }
    }
    if (
      typeof data['cmd_id'] !== 'undefined' &&
      typeof this.socketQueue['i_' + data['cmd_id']] === 'function'
    ) {
      var execFunc = this.socketQueue['i_' + data['cmd_id']];
      execFunc(data['msg'], data['cmd'], errFrame);
      execFunc = null;
      if (!this.socketQueueIntervals['i_' + data['cmd_id']]) {
        delete this.socketQueue['i_' + data['cmd_id']]; // to free up memory..
      }
      data = null;
    }
  }

  clearInterval(id: number) {
    this.worker.postMessage({ msg: 2, serverMsg: true, id: id }); // CLEAR INTERVAL REQUEST
  }

  private getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
}
