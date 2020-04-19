import {
  Injectable,
  NgZone,
  EventEmitter,
} from '@angular/core';
import {
  MatDialog,
  MatSnackBar,
} from '@angular/material';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './common.service';

class TPStatResponse {
  ENABLE: number;
  MOVING: number;
  WACK: number;
  ERRMESSAGE: string;
  VRATE: number;
  DEADMAN: number;
  SWITCH: string;
  ESTOP: number;
}

const refreshRate = 200;

@Injectable()
export class TpStatService {
  modeChanged: BehaviorSubject<string> = new BehaviorSubject(null);
  estopChange: Subject<boolean> = new Subject();
  wackChange: Subject<boolean> = new Subject();
  onProjectLoaded: EventEmitter<boolean> = new EventEmitter();
  onlineStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  get jogEnabled() {
    return this.mode !== 'A';
  }
  get errorHistory() {
    return this._tpStatErrorHistory;
  }

  private _online = false;
  private interval = NaN;
  private tpInterval = NaN;
  private _systemErrorCode = 0;
  private lastStatString: string = null;
  private lastErrString: string = null;
  private _virtualDeadman = false;
  private _virtualModeSelector = 'A';
  private _tpStatErrorHistory: TpStatError[] = [];
  private words: {};

  _enabled: boolean;
  _isMoving: boolean;
  _errorString: string;
  _velocityRate: number;
  _estop: boolean;
  _deadman: boolean;
  _switch: string;
  _wack: boolean;

  get systemErrorCode() {
    return this._systemErrorCode;
  }
  
  get estop(): boolean {
    return this._estop;
  }

  get deadman(): boolean {
    return this._deadman;
  }
  set deadman(active: boolean) {
    console.log('set deadman to ' + active);
    const oldStat = this._deadman;
    const dm = active ? 1 : 0;
    this._virtualDeadman = active;
    this._deadman = active;
    this.ws.send('?tp_set_deadman(' + dm + ')', true, (result, cmd, err) => {
      if (result !== '0') {
        this._virtualDeadman = oldStat;
        this._deadman = oldStat;
      }
    });
  }

  get mode(): string {
    return this._switch;
  }
  // SET MODE SYNC 
  async setMode(mode: string, pass?: string): Promise<boolean> {
    console.log(this.mode + ' --> ' + mode);
    const oldStat = this.mode;
    if (oldStat === mode) return true;
    pass = pass || '';
    const ret = await this.ws.query(`?tp_set_switch_mode("${mode}","${pass}")`);
    if (ret.result !== '0') {
      this._virtualModeSelector = oldStat;
      this._switch = this._virtualModeSelector;
      if (this._switch == null) {
        // CAN'T SET MODE ON INIT - THIS IS CRITICAL...
        this._systemErrorCode = -998;
      }
      this._switch = oldStat;
      return false;
    } else {
      this._virtualModeSelector = mode;
      this._switch = this._virtualModeSelector;
      this.modeChanged.next(this._switch);
      return true;
    }
  }

  set mode(mode: string) {
    if (!environment.production) console.log(this.mode + ' --> ' + mode);
    const oldStat = this.mode;
    if (oldStat === mode) return;
    this.ws
      .query('?tp_set_switch_mode("' + mode + '")')
      .then((ret: MCQueryResponse) => {
        //if (!environment.production) console.log(ret);
        if (ret.result !== '0') {
          console.log(ret);
          console.log('oldStat:' + oldStat);
          this._virtualModeSelector = oldStat;
          this._switch = this._virtualModeSelector;
          if (this._switch == null) {
            // CAN'T SET MODE ON INIT - THIS IS CRITICAL...
            this.trn
              .get(['stat.err_critical.title', 'stat.err_critical.message'], {
                appName: environment.appName,
              })
              .subscribe(words => {
                const ref = this.dialog.open(ErrorDialogComponent, {
                  data: {
                    title: words['stat.err_critical.title'],
                    message: words['stat.err_critical.message'],
                  },
                });
                ref.afterClosed().subscribe(() => {
                  this.ws.reset();
                });
              });
          }
          this._switch = oldStat;
        } else {
          this._virtualModeSelector = mode;
          this._switch = this._virtualModeSelector;
          this.modeChanged.next(this._switch);
        }
      });
  }

  get isMoving(): boolean {
    return this._isMoving;
  }
  get errorString(): string {
    return this._errorString;
  }
  get velocityRate(): number {
    return this._velocityRate;
  }
  get wack(): boolean {
    return this._wack;
  }
  get enabled(): boolean {
    return this._enabled;
  }
  toggleEnabled() {
    const newVal = this.enabled ? 0 : 1;
    this.ws.send('?tp_enable(' + newVal + ')', true);
  }

  updateState(statString: string) {
    if (this.lastStatString === statString) return;
    this.zone.run(()=>{
      this.lastStatString = statString;
      if (statString.length === 0) {
        console.log('ERROR: CYCLIC FUNCTION 0 (TP_STAT) RETURNS A BLANK RESULT');
        this._systemErrorCode = -999;
        this.ws.clearInterval(this.interval);
        this.onlineStatus.next(false);
        this._online = false;
        return;
      }
      try {
        const stat: TPStatResponse = JSON.parse(statString);
        this._enabled = stat.ENABLE === 1;
        this._isMoving = stat.MOVING === 1;
        this._errorString = stat.ERRMESSAGE;
        this._velocityRate = stat.VRATE;
        if (this._estop !== ((stat.ESTOP) === 1)) {
          this._estop = stat.ESTOP === 1;
          this.estopChange.next(this._estop);
        }
        if (this._wack !== (stat.WACK === 1)) {
          this._wack = stat.WACK === 1;
          this.wackChange.next(this._wack);
        }
        if (typeof stat.DEADMAN === 'undefined') {
          this._deadman = this._virtualDeadman;
        }
        else this._deadman = stat.DEADMAN === 1;

        if (typeof stat.SWITCH === 'undefined' || !this.cmn.isTablet) {
          if (this._switch !== this._virtualModeSelector) {
            this._switch = this._virtualModeSelector;
            this.modeChanged.next(this._switch);
          }
        } else {
          if (this._switch !== stat.SWITCH) this.modeChanged.next(this._switch);
          this._switch = stat.SWITCH;
        }

        if (this.lastErrString !== this.errorString) {
          this.lastErrString = this.errorString;
          const err = this.errorString.trim();
          if (err.length > 0) {
            this._tpStatErrorHistory.unshift({
              time: new Date().getTime(),
              err,
            });
            // this.zone.run(() => {
            //   setTimeout(() => {
            //     if (environment.platform.name !== environment.platforms.Kuka.name) {
            //       this.snack
            //       .open(err, this.words['acknowledge'])
            //       .afterDismissed()
            //       .subscribe(() => {
            //         if (!this.onlineStatus.value) return;
            //         this.ws.send('?TP_CONFIRM_ERROR', true);
            //       });
            //     }
            //   }, 0);
            // });
          }
        }
      } catch (err) {
        console.log("can't update TP STAT:");
        console.log('stat was:' + statString + '...');
        console.log(err);
      }
    });
  }

  safetyAck() {
    this.ws.query('?sc_acknowledge');
  }

  startTpLibChecker() {
    if (this.tpInterval !== null) this.ws.clearInterval(this.tpInterval);
    this.tpInterval = this.ws.send(
      '?system_state',
      false,
      (res, cmd, err) => {
        const offline = err || res !== '1000';
        if (offline && this._online) {
          // WAS ONLINE BEFORE
          this.onlineStatus.next(false);
          this._online = false;
          this._systemErrorCode = Number(res);
        } else if (!offline && !this._online) {
          // BECAME ONLINE NOW
          this._online = true;
          this.ws.clearInterval(this.tpInterval);
          this.onlineStatus.next(true);
          this._systemErrorCode = Number(res);
        } else if (err === null) {
          // was offline and still is offline
          const result = Number(res);
          if (!isNaN(result) && result < 0 && this._systemErrorCode >= 0) {
            this._systemErrorCode = result;
            this.zone.run(() => {
              this.trn
                .get(['stat.err_init.title', 'stat.err_init.msg'], {
                  result,
                })
                .subscribe(words => {
                  this.dialog.open(ErrorDialogComponent, {
                    data: {
                      title: words['stat.err_init.title'],
                      message: words['stat.err_init.msg'],
                    },
                  });
                });
            });
          } else if (!isNaN(result) && result >= 0) {
            this._systemErrorCode = result;
          }
        }
      },
      refreshRate
    );
  }
  
  resetStat() {
    console.log('reset stat');
    this._enabled = false;
    this._isMoving = false;
    this._wack = false;
    this._errorString = null;
    this._velocityRate = null;
    this._estop = false;
    this._deadman = false;
    this._switch = null;
    this.modeChanged.next(null);
  }

  resetAll() {
    this.ws.clearInterval(this.interval);
    return this.ws
      .query('?tp_exit')
      .then(() => {
        return this.ws.query('?TP_setKeepAliveBreakable(1)');
      }).then((ret: MCQueryResponse) => {
        console.log(ret);
        if (ret.result === '0' || !this.onlineStatus.value) {
          this.onlineStatus.next(false);
          this._online = false;
          this.resetStat();
        } else {
          return Promise.reject(null);
        }
      });
  }
  
  setDebugMode(on: boolean) {
    if (on) {
      // STOP TP_STAT
      this.ws.clearInterval(this.interval);
      this._online = false;
      this.onlineStatus.next(false);
    } else {
      // START TP_STAT
      this.startKeepAlive();
    }
  }

  constructor(
    private ws: WebsocketService,
    private dialog: MatDialog,
    private zone: NgZone,
    private snack: MatSnackBar,
    private api: ApiService,
    private trn: TranslateService,
    private cmn: CommonService
  ) {
    this.trn
      .get([
        'acknowledge', 'offline', 'online',
        'stat.err_critical.title', 'stat.err_critical.message'],{
        appName: environment.appName,
      }).subscribe(words => {
        this.words = words;
        this.init();
      });
  }

  private init() {
    this.ws.isConnected.subscribe(stat => {
      if (stat) {
        // CHECK FOR TP.LIB
        this.api.get('/cs/api/license/softTP').subscribe(ret => {
          console.log('softTP License ....... ' + ret);
          if (ret) this.startTpLibChecker();
        });
      } else if (this._online) {
        this.onlineStatus.next(false);
        this._online = false;
        this._tpStatErrorHistory = [];
        this.resetStat();
      }
    });
    this.onlineStatus.subscribe(stat => {
      if (stat) {
        // TP_VER is OK
        const cmd = '?tp_set_language("' + this.trn.currentLang + '")';
        this.ws.query(cmd).then((ret: MCQueryResponse) => {
          if (ret.err || ret.result !== '0') {
            console.log('LANG ERR', ret.result);
          }
        });
      }
    });
    this.onProjectLoaded.subscribe(loaded => {
      this.ws.clearInterval(this.interval);
      if (loaded) this.startKeepAlive();
    });
  }

  private startKeepAlive() {
    // START KEEPALIVE
    this.ws.clearInterval(this.interval);
    this.interval = this.ws.send(
      'cyc0',
      true,
      (res: string, cmd, err) => {
        if (err && this._online) {
          this.ws.clearInterval(this.interval);
          this.onlineStatus.next(false);
          this._online = false;
          this.startTpLibChecker();
        } else if (!err) {
          this.updateState(res);
        }
      },
      refreshRate
    );
  }
}

interface TpStatError {
  time: number;
  err: string;
}
