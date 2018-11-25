import { Injectable, NgZone } from '@angular/core';
import { ReplaySubject ,  Observable , BehaviorSubject} from 'rxjs'
import {MatDialog} from '@angular/material';
import {NotificationService} from './notification.service';
import {environment} from '../../../../environments/environment';
import {JwtService} from './jwt.service';

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
  private timeout;
  private worker = new Worker('assets/scripts/conn.js');
  
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
  }
  
  constructor(
    public dialog: MatDialog,
    private _zone: NgZone,
    private notification : NotificationService,
    private jwt: JwtService
  ) {
    this._zone.runOutsideAngular(()=>{
      this.worker.onmessage = (e)=>{
        if (e.data.serverMsg) {
          this._zone.run(()=>{
            switch (e.data.msg) {
              case 0: // ONOPEN
                console.log('ON OPEN');
                //this.initLanguage().then(()=>{
                  this._isConnected.next(true);
                //});
                clearTimeout(this.timeout);
                this.timeout = null;
                break;
              case 1: // ONERROR
                this._isConnected.next(false);
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
                this.dialog.closeAll();
                this._isConnected.next(false);
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
  
  send(msg: string, callback?, interval? : number) {
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
    this.worker.postMessage({msg:str,serverMsg:false,interval:interval,id: this.socketQueueId});
    msg = null;
    return this.socketQueueId;
  }
  
  query(query){
    return new Promise((resolve,reject)=>{
      this.send(query,function(result,cmd,err){
        resolve({result:result,cmd:cmd,err:err});
      });
    }).catch(reason=>{
     
    });
 }
 
 queryWorker(query: string, interval? : number){
    return new Promise((resolve)=>{
      this.send(query,function(result,cmd,err){
        resolve({result:result,cmd:cmd,err:err});
      },interval);
    }
  );
 }

  handleMessage(msg: string) {
    var errFrame = null;
    var data: MCResponse = JSON.parse(msg);
    var isErrorFrame = (data['msg'].indexOf("$ERRORFRAME$") === 0);
    if (isErrorFrame) {
      data['msg'] = data['msg'].substr(12);
      errFrame = new ErrorFrame(data['msg']);
      if (!environment.production)
        console.log(data['cmd'] + " >> " + data['msg']);
      if (errFrame.errType !== "NOTE" &&
          errFrame.errType !== "INFO" &&
          typeof(this.socketQueue['i_'+data['cmd_id']]) !== 'function') {
        /*let dialogRef = this.dialog.open(ErrorDialogComponent, {
          width: '250px',
          data: {err: errFrame.errMsg}
        });*/
        alert(errFrame.errMsg);
      }
    } else if (typeof(data['cmd_id']) !== 'undefined' &&
                data['cmd_id'] === -1) { // Server Announcment
      if (data['msg'].indexOf(">>>") === 0) { 
        // TP DIALOG MSG
      } else { // Other Server announcements
        this.notification.onAsyncMessage(data['msg']);
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

export class ErrorFrame {
  
  errType : string;
  errCode : string;
  errMsg: string;
  errTask : string;
  errLine : string;
  errModule : string;
  
  constructor(private errString: string) {
    var i = errString.indexOf(":");
    this.errType = errString.substr(0,i).trim().toUpperCase();
    errString = errString.substr(i+1); 
    i = errString.indexOf(",");
    this.errCode = errString.substr(0,i).trim();
    i = errString.indexOf("\"");
    errString = errString.substr(i+1);
    i = errString.indexOf("\"");
    this.errMsg = errString.substr(0,i);
    errString = errString.substr(i+2);
    var parts = errString.split(",");
    i = parts[0].indexOf("\"");
    this.errTask = parts[0].substr(parts[0].indexOf(":")+1).trim();
    this.errLine = parts[2].substr(parts[2].indexOf(":")+1).trim();
    this.errModule = parts[3].substr(parts[3].indexOf(":")+1).trim();
  }
}
