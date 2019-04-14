import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {MCQueryResponse, WebsocketService} from './websocket.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class LeadByNoseServiceService {

  private _frames: string[];
  private _frame : string;
  private _motionTypes : string[];
  private _motionType : string;
  private _vrate : number = 0;
  private _joint : number = null;
  private _lbnStatus : boolean = false;
  private keepAlive : number = null;
  
  private word_errTimeout: string;
  
  get status() {return this._lbnStatus;}
  set status(val) {
    this._lbnStatus = val;
    if (val)
      this.enable();
    else
      this.disable();
  }
  
  get joint() { return this._joint;}
  get vrate() { return this._vrate; }
  set vrate(val : number) {
    let oldRate = this._vrate;
    this._vrate = val;
    let cmd = '?LBN_SET_VRATE(' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._vrate = oldRate;
    });
  }
  get frames() { return this._frames; }
  get motionTypes() { return this._motionTypes; }
  get frame() { return this._frame; }
  get motionType() { return this._motionType; }
  
  set frame(val : string) {
    let oldFrame = this.frame;
    this._frame = val;
    var cmd = '?LBN_SET_FRAME("' + val + '")';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0') {
        this._frame = oldFrame;
        return Promise.reject('');
      }
      return this.ws.query('?LBN_GET_MOTION_TYPES');
    }).then((ret: MCQueryResponse)=>{
      this._motionTypes = ret.result.split(",");
      this._motionType = null;
    }).catch(e=>{
      console.log('error setting LBN frame');
    });
  }
  
  set motionType(val : string) {
    let oldType = this._motionType;
    this._motionType = val;
    var cmd = '?LBN_SET_MOTION_TYPE("' + val + '")';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0') {
        this._motionType = oldType;
        return;
      }
      if (val === 'SINGLE_JOINT')
        this.joint = 1;
      else
        this._joint = null;
    });
  }
  
  set joint(val:number) {
    let oldJoint = this._joint;
    this._joint = val;
    this.ws.query("?tp_set_lead_by_nose_joint_number(" + val + ")")
    .then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._joint = oldJoint;
    });
  }

  constructor(
    private ws : WebsocketService,
    private snackbar : MatSnackBar,
    private trn: TranslateService
  ) {
      this.ws.isConnected.subscribe(stat=>{
        if (!stat) {
          this.reset();
        }
      });
      this.trn.get('lbn.err_timeout').subscribe(ret=>{
        this.word_errTimeout = ret;
      });
    }
  
  init() {
    this.ws.query('?LBN_GET_FRAMES_LIST').then((ret: MCQueryResponse)=>{
      if (ret.err)
        return;
      this._frames = ret.result.split(',');
      return this.ws.query('?LBN_GET_VRATE');
    }).then((ret: MCQueryResponse)=>{
      if (ret)
        this._vrate = Number(ret.result);
    });
  }
  
  enable() {
    this.ws.query('?LBN_EXECUTE(1)').then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0') {
        this._lbnStatus = false;
        //this.mgr.mode == this.mgr.ScreenMode.TP;
        return;
      }
      this.keepAlive = this.ws.send('?LBN_GET_STATUS',true,(result:string)=>{
        if (result === '0') {
          this._lbnStatus = false;
          this.ws.clearInterval(this.keepAlive);
          this.ws.send('?LBN_EXECUTE(0)',true);
          //this.mgr.mode == this.mgr.ScreenMode.TP;
        }
      },200);
      /*this.mgr.setLoadingText(this.lang.get('lbn_init'));
      this.mgr.mode = this.mgr.ScreenMode.BUSY;*/
      let counter = 0;
      let initInterval = setInterval(()=>{
        let cmd = '?LBN_GET_FORCE_SENSOR_INIT_DONE';
        this.ws.query(cmd).then((result:MCQueryResponse)=>{
          counter++;
          if (result.result === '1') {
            //this.mgr.mode = this.mgr.ScreenMode.TP;
            clearInterval(initInterval);
            return;
          }
          if (counter === 10) {
            clearInterval(initInterval);
            this.snackbar.open(this.word_errTimeout,'',{duration:2000});
            //this.mgr.mode = this.mgr.ScreenMode.TP;
            this.ws.clearInterval(this.keepAlive);
            this.ws.send('?LBN_EXECUTE(0)',true);
            this._lbnStatus = false;
          }
        });
      },1000);
    });
  }
  
  disable() {
    this.ws.query('?LBN_EXECUTE(0)').then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        return;
      this._lbnStatus = false;
    });
  }
  
  reset() {
    if (this.keepAlive)
      this.ws.clearInterval(this.keepAlive);
    this._frames = [];
    this._frame = null;
    this._motionTypes = [];
    this._motionType = null;
    this._vrate = 0;
    this._joint = null;
    this._lbnStatus = false;
    this.keepAlive = null;
  }
}
