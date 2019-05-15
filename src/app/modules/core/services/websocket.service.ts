import { Injectable, NgZone } from '@angular/core';
import { ReplaySubject ,  Observable , BehaviorSubject} from 'rxjs'
import {MatDialog} from '@angular/material';
import {NotificationService} from './notification.service';
import {environment} from '../../../../environments/environment';
import {JwtService} from './jwt.service';
import {ErrorFrame} from '../models/error-frame.model';
import {ErrorDialogComponent} from '../../../components/error-dialog/error-dialog.component';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LangService} from './lang.service';

interface MCResponse {
  msg:  string;
  cmd:  string;
  cmd_id: number;
}

export interface MCQueryResponse {
  result: string;
  cmd:  string;
  err: ErrorFrame;
}

@Injectable()
export class WebsocketService {

  private socketQueueId : number = 0;
  private socketQueue : Function[] = [];
  private socketQueueIntervals : boolean[] = [];
  private _isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _isTimeout: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private timeout: any;
  private worker = new Worker('assets/scripts/conn.js');
  private _port: string = null;
  private _otherClients: number = 0;
  
  private words: any;
  
  get port() { return this._port; }
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
    this.worker.postMessage({msg:0,serverMsg:true}); // CONNECT REQUEST
    this.timeout = setTimeout(()=>{
      if (!this._isConnected.value) {
        this._isTimeout.next(true);
        this.timeout = null;
      }
    }, 5000);
  }
  
  reset() {
    this.worker.postMessage({msg:1,serverMsg:true}); // RESET REQUEST
    this.socketQueueId = 0;
    this.socketQueue = [];
    this._isTimeout.next(false);
    this._isConnected.next(false);
  }
  
  constructor(
    public dialog: MatDialog,
    private _zone: NgZone,
    private notification : NotificationService,
    private jwt: JwtService,
    private router: Router,
    private lang: LangService,
    private trn: TranslateService
  ) {
    this.lang.init();
    this.trn.get('websocket.err_es_busy').subscribe(words=>{
      this.words = words;
    });
    this._zone.runOutsideAngular(()=>{
      this.worker.onmessage = (e)=>{
        if (e.data.serverMsg) {
          this._zone.run(()=>{
            switch (e.data.msg) {
              case 0: // ONOPEN - Websocket connected, Testing connection...
                Promise.all(
                  [this.query('java_port'),this.query('java_es')]
                ).then((ret:any[])=>{
                  this._port = ret[0].result;
                  this._otherClients = Number(ret[1].result) - 1;
                  this._isConnected.next(true);
                  clearTimeout(this.timeout);
                  this.timeout = null;
                },err=>{
                  console.log('error!');
                });
                break;
              case 1: // ONERROR
                this.reset();
                if (this.timeout) {
                  clearTimeout(this.timeout);
                  this.timeout = null;              }
                break;
              case 2: // ONCLOSE
                if (this.timeout) {
                  clearTimeout(this.timeout);
                  this.timeout = null;
                }
                for (let ref of this.dialog.openDialogs) {
                  if (ref.id !== 'update' && ref.id !== 'system')
                    ref.close();
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
  
  send(msg: string, force: boolean, callback?, interval? : number) {
    //console.log('send',msg);
    this.socketQueueId++;
    if (callback) {
      this.socketQueue['i_'+this.socketQueueId] = callback;
      if (interval)
        this.socketQueueIntervals['i_' + this.socketQueueId] = true;
    }
    var MCMessage = {
      msg: msg,
      cmd_id: this.socketQueueId,
      token: this.jwt.getToken()
    };
    var str = JSON.stringify(MCMessage);
    this.worker.postMessage({
      msg:str,
      serverMsg:false,
      interval:interval,
      id: this.socketQueueId,
      force:force
    });
    msg = null;
    return this.socketQueueId;
  }
  
  query(query){
    return new Promise((resolve,reject)=>{
      //let start = new Date().getTime();
      /*let timeout = setTimeout(()=>{
        console.log('TIMEOUT REACHED FOR ' + query);
        this.reset();
      },10000);*/
      this.send(query,false,function(result,cmd: string,err){
        //clearTimeout(timeout);
        resolve({result:result,cmd:cmd,err:err});
      });
    }).catch(reason=>{
     
    });
 }

  handleMessage(data: MCResponse) {
    var errFrame = null;
    //console.log('receive',data['cmd']);
    var isErrorFrame = (data['msg'].indexOf("$ERRORFRAME$") === 0);
    if (isErrorFrame) {
      data['msg'] = data['msg'].substr(12);
      errFrame = new ErrorFrame(data['msg']);
      if (!environment.production)
        console.log(data['cmd'] + " >> " + data['msg']);
      if (errFrame.errType !== "NOTE" &&
          errFrame.errType !== "INFO" &&
          typeof(this.socketQueue['i_'+data['cmd_id']]) !== 'function') {
        alert(errFrame.errMsg);
      }
    } else if (typeof(data['cmd_id']) !== 'undefined' &&
                data['cmd_id'] === -1) { // Server Announcment
      if (data['msg'].indexOf(">>>") === 0) { 
        // TP DIALOG MSG
      } else if (data['msg'].indexOf('%%%') === 0) {
        // CLIENT UPDATE NOTIFICATION
        this._zone.run(()=>{
          this._otherClients = Number(data['msg'].substring(3)) - 1;
        });
      } else { // Other Server announcements
        this.notification.onAsyncMessage(data['msg']);
        if (data['msg'] === 'No avilable ports') {
          this.reset();
          this._zone.run(()=>{
            this.dialog.open(ErrorDialogComponent, {
              width: '250px',
              data: this.words,
              id: 'system'
            }).afterClosed().subscribe(()=>{
              this.router.navigateByUrl('/login');
            });
          });
        }
      }
    }
    if (typeof(data['cmd_id']) !== 'undefined' &&
        typeof(this.socketQueue['i_'+data['cmd_id']]) === 'function'){
      var execFunc = this.socketQueue['i_'+data['cmd_id']];
      execFunc(data['msg'],data['cmd'],errFrame);
      execFunc = null;
      if (!this.socketQueueIntervals['i_' + data['cmd_id']]) {
        delete this.socketQueue['i_'+data['cmd_id']]; // to free up memory..
      }
      data = null;
    }
  }
  
  clearInterval(id : number) {
    this.worker.postMessage({msg:2,serverMsg:true, id: id}); // CLEAR INTERVAL REQUEST
  }
  
  private getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
}
