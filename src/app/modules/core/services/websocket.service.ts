import { Injectable, NgZone } from '@angular/core';
import { ReplaySubject, Observable, BehaviorSubject, Observer } from 'rxjs';
import { MatDialog } from '@angular/material';
import { NotificationService } from './notification.service';
import { JwtService } from './jwt.service';
import { ErrorFrame } from '../models/error-frame.model';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './lang.service';
import { TpDialogComponent } from '../../../components/tp-dialog/tp-dialog.component';
import { time } from 'console';

interface MCResponse {
  msg: string;
  cmd: string;
  cmd_id: number;
}

export interface MCQueryResponse {
  result: string;
  cmd: string;
  err: ErrorFrame[];
}

export class MCErrorDetails {
  public cmd: string;
  public desc: string;
  public errs: ErrorFrame[];
  constructor (_cmd: string, _desc: string, _errs: ErrorFrame[]) {
    this.cmd = _cmd, this.desc = _desc, this.errs = [..._errs];
  }
}

export function errorString(err: ErrorFrame[]) {
  return err ? err.map(e=>e.msg).join('') : null;
}

@Injectable()
export class WebsocketService {
  private socketQueueId = 0;
  private socketQueue: Function[] = [];
  private socketQueueIntervals: boolean[] = [];
  private _isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _isTimeout: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private timeout: number;
  private worker = new Worker('assets/scripts/conn.js');
  private _port: string = null;
  private _otherClients = 0;

  private words: {};

  get port() {
    return this._port;
  }
  updateFirmwareMode = false;

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
    this.timeout = window.setTimeout(() => {
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
    document.body.classList.remove('busy');
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
              default:
                console.error('UNKNOWN MSG CODE:',e.data.msg);
                break;
              case 0: // ONOPEN - Websocket connected, Testing connection...
                Promise.all([
                  this.query('java_port'),
                  this.query('java_es'),
                  this.query('setep type = 1 priority = 16'),
                  // this.query('common shared GUI_ERR as error ""')
                ]).then(ret => {
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
                for (const ref of this.dialog.openDialogs) {
                  if (ref.id !== 'update' && ref.id !== 'system') ref.close();
                }
                if (e.data.code === 4003) {
                  this._zone.run(async () => {
                    const words = await this.trn.get('websocket.err_es_busy').toPromise();
                    this.dialog.open(ErrorDialogComponent, {
                        data: words || {title: 'Connection Failed', message: 'All available entry stations are busy.'},
                        id: 'system',
                      }).afterClosed().subscribe(() => {
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
    if (this.socketQueueId === 32766) {
      this.socketQueueId = 1000;
    }
    if (callback) {
      this.socketQueue['i_' + this.socketQueueId] = callback;
      if (interval) this.socketQueueIntervals['i_' + this.socketQueueId] = true;
    }
    const mcMessage = {
      msg,
      cmd_id: this.socketQueueId,
      token: this.jwt.getToken(),
    };
    const str = JSON.stringify(mcMessage);
    this.worker.postMessage({
      msg: str,
      serverMsg: false,
      interval,
      id: this.socketQueueId,
      force,
    });
    msg = null;
    return this.socketQueueId;
  }

  query(query) : Promise<MCQueryResponse> {
    return new Promise<MCQueryResponse>((resolve, reject) => {
      // let timeout = setTimeout(()=>{
      //   if (this.connected) {
      //     document.body.classList.add('busy');
      //     timeout = null;
      //     console.log('busy',query);
      //   }
      // },1500);
      this.send(query, false, (result, cmd: string, err) => {
        // if (timeout == null) {
        //   document.body.classList.remove('busy');
        // }
        // clearTimeout(timeout);
        resolve({ result, cmd, err });
      });
    }).catch(reason => {
      return Promise.reject(reason);
    });
  }

  simpleQuery(api: string): Observable<string | ErrorFrame> {
    return Observable.create(observer => {
      this.send(api, false, (result: string, cmd: string, err: ErrorFrame[]) => {
        if (!!err && err.length !== 0) {
          const errDetails = new MCErrorDetails(cmd, result, err);
          console.log(`%c----Get error when call api "${api}", see the details below:----`, 'color: red;font-weight: bold;');
          console.dir(errDetails);
          console.log(`%c---------------------------------End---------------------------------`, 'color: red;font-weight: bold;');
          observer.error(err[0]);
        } else {
          observer.next(result);
          observer.complete();
        }
      });
    });
  };

  observableQuery(api: string): Observable<MCQueryResponse | ErrorFrame[]> {
    return Observable.create(observer => {
      this.send(api, false, (result: string, cmd: string, err: ErrorFrame[]) => {
        if (!!err) {
          observer.error(err);
        } else {
          observer.next({ result, cmd });
          observer.complete();
        }
      });
    });
  }

  handleMessage(data: MCResponse) {
    let errFrames: ErrorFrame[] | null = null;
    data['msg'] = data['msg'].replace(/[\r]+/g, '');
    const isErrorFrame = data['msg'].indexOf('$ERRORFRAME$') === 0;
    if (isErrorFrame) {
      errFrames = [];
      const messages = data['msg'].split('$ERRORFRAME$');
      for (let i=1; i<messages.length; i++) {
        const err = new ErrorFrame(messages[i]);
        errFrames.push(err);
        console.log(data['cmd'] + ' >> ' + err.msg);
      }
      data['msg'] = errorString(errFrames);
    } else if (typeof data['cmd_id'] !== 'undefined' && data['cmd_id'] === -1) {
      // Server Announcment - msg is array of bytes
      if (data['msg'].indexOf('>>>') === 0) {
        // TP DIALOG MSG
        const strings: string[] = data['msg'].slice(3, -5).split(',');
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
                default:
                  break;
              }
            });
        });
      } else if (data['msg'].startsWith('%%%')) {
        // CLIENT UPDATE NOTIFICATION
        this._zone.run(() => {
          this._otherClients = Number(data['msg'].substring(3)) - 1;
        });
      } else if (data['msg'].startsWith('***')) {
        // WEBSERVER LOG
          try {
            const msg = JSON.parse(data['msg'].substring(3));
            this.notification.onWebserverMessage(msg);
          } catch (err) {
            
          }
      } else if (data['msg'].startsWith('#libAsyncMessge#')) {
        const message = data['msg'].substring(16);
        this.notification.onLibAsyncMessage(message);
      } else {
        // Other Server announcements
        //this._zone.run(() => {
          this.notification.onAsyncMessage(data['msg']);
        //});
      }
    }
    if (
      typeof data['cmd_id'] !== 'undefined' &&
      typeof this.socketQueue['i_' + data['cmd_id']] === 'function'
    ) {
      let execFunc = this.socketQueue['i_' + data['cmd_id']];
      execFunc(data['msg'], data['cmd'], errFrames);
      execFunc = null;
      if (!this.socketQueueIntervals['i_' + data['cmd_id']]) {
        delete this.socketQueue['i_' + data['cmd_id']]; // to free up memory..
      }
      data = null;
    }
  }

  clearInterval(id: number) {
    this.worker.postMessage({ msg: 2, serverMsg: true, id }); // CLEAR INTERVAL REQUEST
  }
  
}
