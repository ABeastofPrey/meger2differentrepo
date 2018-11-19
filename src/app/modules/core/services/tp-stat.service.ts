import { Injectable, NgZone, ApplicationRef, EventEmitter } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {WebsocketService, MCQueryResponse} from './websocket.service';
import {ErrorDialogComponent} from '../../../components/error-dialog/error-dialog.component';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from './api.service';
import {environment} from '../../../../environments/environment';

class TPStatResponse {
  ENABLE : number;
  MOVING : number;
  SETTELED : number;
  ERRMESSAGE : string;
  VRATE : number;
  BIP  : number;
  REFRESH : number;
  DEADMAN: number;
  SWITCH: string;
  CART_REACH: number;
}

const refreshRate = 200;

@Injectable()
export class TpStatService {
  
  modeChanged : EventEmitter<any> = new EventEmitter();
  
  onlineStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _online: boolean = false;
  
  private interval: any = null;
  private tpInterval: any = null;
  
  get jogEnabled() {
    return this.mode !== 'A';
  }
  
  _enabled : boolean;
  _isMoving : boolean;
  _isSetteled : boolean;
  _errorString : string;
  _velocityRate : number;
  _bipRequest  : boolean;
  _isRefresh : boolean;
  _estop:  boolean;
  _deadman: boolean;
  _switch: string;
  _cart_reach: boolean;

  private lastStatString : string = null;
  private lastErrString: string = null;
  
  private _virtualDeadman : boolean = false;
  get deadman() : boolean {return this._deadman; }
  set deadman(active:boolean) {
    let oldStat = this._deadman;
    let dm = active ? 1 : 0;
    this._virtualDeadman = active;
    this._deadman = active;
    this.ws.send('?tp_set_deadman(' + dm + ')',(result,cmd,err)=>{
      if (result !== '0') {
        this._virtualDeadman = oldStat;
        this._deadman = oldStat;
      }
    });
  }
  
  private _virtualModeSelector : string = 'A';
  get mode() : string {return this._switch; }
  set mode(mode:string) {
    let oldStat = this.mode;
    this.ws.query('?tp_set_mode("' + mode + '")').then((ret:MCQueryResponse)=>{
      if (ret.result !== '0') {
        this._virtualModeSelector = oldStat;
        this._switch = this._virtualModeSelector;
        let err = ret.err ? ret.err.errCode : ret.result;
        if (this._switch == null) {
          // CAN'T SET MODE ON INIT - THIS IS CRITICAL...
          let ref = this.dialog.open(ErrorDialogComponent,{
            data: {
              title: 'Critical Error',
              message: "Can't set TP MODE to A..." + environment.appName + " will now logout."
            }
          });
          ref.afterClosed().subscribe(()=>{
            this.ws.reset();
          });
        }
      } else {
        this._virtualModeSelector = mode;
        this._switch = this._virtualModeSelector;
        this.modeChanged.emit(this._switch);
      }
    });
  }
  
  get isMoving() : boolean { return this._isMoving; }
  get errorString() : string { return this._errorString; }
  get velocityRate() : number { return this._velocityRate; }
  get cartReach(): boolean { return this._cart_reach; }
  get enabled() : boolean { return this._enabled; }
  toggleEnabled() {
    let newVal = this.enabled ? 0 : 1;
    this.ws.send('?tp_enable(' + newVal + ')');
  }
  
  updateState(statString : string) {
    if (this.lastStatString === statString || statString.length === 0)
      return;
    this.lastStatString = statString;
    try {
      //this.zone.run(()=>{
        var stat:TPStatResponse = JSON.parse(statString);
        this._enabled     = stat.ENABLE == 1;
        this._isMoving    = stat.MOVING == 1;
        this._isSetteled  = stat.SETTELED == 1;
        this._errorString = stat.ERRMESSAGE;
        this._velocityRate= stat.VRATE;
        this._bipRequest  = stat.BIP == 1; // NOT IMPLEMENTED
        this._isRefresh   = stat.REFRESH == 1;
        this._cart_reach = stat.CART_REACH === 1;

        if (typeof stat.DEADMAN === 'undefined')
          this._deadman = this._virtualDeadman;
        else
          this._deadman = stat.DEADMAN == 1;

        if (typeof stat.SWITCH === 'undefined') {
          this._switch = this._virtualModeSelector;
        } else {
          if (this._switch !== stat.SWITCH)
            this.modeChanged.emit(this._switch);
          this._switch = stat.SWITCH;
        }
        
        if (this.lastErrString !== this.errorString) {
          this.lastErrString = this.errorString;
          if (this.errorString.length > 0) {
            this.zone.run(()=>{
              let ref = this.snack.open(this.errorString,'ACKNOWLEDGE');
              ref.afterDismissed().subscribe(()=>{
                this.ws.send('?TP_CONFIRM_ERROR');
              });
            });
          }
        }
        
        this.ref.tick();
      //});
    } catch (err) {
      console.log("can't update TP STAT:");
      console.log("stat was:" + statString + "...");
      console.log(err);
    }
  }
  
  startTpLibChecker() {
    if (this.tpInterval !== null)
      this.ws.clearInterval(this.tpInterval);
    this.tpInterval = this.ws.send('? UTL_GET_SYS_INIT_DONE',(res,cmd,err)=>{
      const offline = err || res === '0';
      if (offline && this._online) {
        this.onlineStatus.next(false);
        this._online = false;
      } else if (!offline && !this._online) {
        this._online = true;
        this.ws.clearInterval(this.tpInterval);
        this.onlineStatus.next(true);
      }
    }, refreshRate);
  }
  
  resetAll() {
    this.ws.clearInterval(this.interval);
    return this.ws.query('call TP_setKeepAliveBreakable(1)').then(()=>{
      this.onlineStatus.next(false);
      this._online = false;
    });
  }

  constructor(
    private ws: WebsocketService,
    private dialog : MatDialog,
    private ref : ApplicationRef,
    private zone : NgZone,
    private snack: MatSnackBar,
    private api: ApiService
  ) {
    this.ws.isConnected.subscribe(stat=>{
      if (stat) {
        // CHECK FOR TP.LIB
        this.api.get('/cs/api/license/softTP').subscribe(ret=>{
          console.log('softTP License ....... ' + ret);
          if (ret)
            this.startTpLibChecker();
        });
      } else if (this._online) {
        this.onlineStatus.next(false);
        this._online = false;
      }
    });
    this.onlineStatus.subscribe(stat=>{
      const msg = 'TP.LIB is ' + (stat?'ONLINE':'OFFLINE');
      this.zone.run(()=>{
        this.snack.open(msg,null,{duration:1500});
      });
      if (stat) { // TP_VER is OK
        // START KEEPALIVE
        this.interval = this.ws.send('?tp_stat',(res,cmd,err)=>{
          if (err && this._online) {
            this.ws.clearInterval(this.interval);
            this.onlineStatus.next(false);
            this._online = false;
            this.startTpLibChecker();
          } else if (!err) {
            this.updateState(res);
          }
        }, refreshRate);
      }
    });
  }

}
