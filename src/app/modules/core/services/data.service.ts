import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { TPVariable } from '../../core/models/tp/tp-variable.model';
import { TPVariableType } from '../../core/models/tp/tp-variable-type.model';
import { TpStatService } from './tp-stat.service';
import { Pallet } from '../models/pallet.model';
import { Payload } from '../models/payload.model';
import { IoModule } from '../models/io/io-module.model';
import { LoginService } from './login.service';
import { CommonService } from './common.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSlideToggleChange } from '@angular/material';
import { RobotCoordinateType } from '../models/robot-coordinate-type.model';

//declare var Blockly:any;

const DOMAIN_FRAMES = ['BASE', 'TOOL', 'MACHINETABLE', 'WORKPIECE'];

@Injectable()
export class DataService {
  dataLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  teachServiceNeedsReset: Subject<void> = new Subject();

  private words: {};

  private _varRefreshInProgress: boolean;
  get varRefreshInProgress() {
    return this._varRefreshInProgress;
  }

  dataRefreshed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  // System
  private _simulatedSystem: boolean; // if the whole system is simulated
  get simulatedSystem(): boolean {
    return this._simulatedSystem;
  }
  private _simulated: boolean; // if the axes in the system are simulated
  get simulated() {
    return this._simulated;
  }
  toggleSimulated(e: MatSlideToggleChange) {
    const newVal = e.checked ? 1 : 0;
    const cmd = '?tp_set_simulated_axes(' + newVal + ')';
    this._simulated = e.checked;
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0') this._simulated = !this._simulated;
    });
  }

  // Robots
  private _robots: string[] = [];
  private _selectedRobot: string = null;
  private _isRobotType = true;
  private _locationDescriptions: string[];
  private _robotType: string = null;
  private _robotCoordinateType: RobotCoordinateType = null;
  get robots() {
    return this._robots;
  }
  get isRobotType() {
    return this._isRobotType;
  }
  get robotType() {
    return this._robotType;
  }
  get locationDescriptions() {
    return this._locationDescriptions;
  }
  get robotCoordinateType() {
    return this._robotCoordinateType;
  }
  get selectedRobot() {
    return this._selectedRobot;
  }
  set selectedRobot(val: string) {
    const oldRobot = this._selectedRobot;
    this._selectedRobot = val;
    this.ws
      .query('?TP_SET_MOTION_ELEMENT("' + val + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this._selectedRobot = oldRobot;
          return Promise.reject(ret.result);
        }
        this.teachServiceNeedsReset.next();
        //Blockly.selectedRobot = this._selectedRobot;
        const promises = Promise.all([
          this.ws.query('?tp_is_robot_type'),
          this.ws.query('?TP_GET_MOTION_ELEMENT_TYPE'),
          this.ws.query('?TP_GET_ROBOT_COORDINATES_TYPE'),
        ]);
        return promises;
      })
      .then((ret: MCQueryResponse[]) => {
        this._isRobotType = ret[0].result !== '0';
        this._robotType = ret[1].result;
        this._robotCoordinateType = new RobotCoordinateType(ret[2].result);
        this.refreshData();
      })
      .catch(() => {});
  }

  // Frames
  private _frames: string[] = [];
  private _selectedFrame: string = null;
  private _cooNames: string[];
  get frames() {
    return this._frames;
  }
  get cooNames() {
    return this._cooNames;
  }
  get selectedFrame() {
    return this._selectedFrame;
  }
  set selectedFrame(val: string) {
    const oldFrame = this._selectedFrame;
    this._selectedFrame = val;
    this.ws
      .query('?TP_SET_JOGGING_FRAME("' + val + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') this._selectedFrame = oldFrame;
        return this.ws.query('?TP_COO_NAMES');
      })
      .then((ret: MCQueryResponse) => {
        if (ret.err) return;
        this._cooNames = ret.result.split(',');
      });
  }

  // Tools
  private _tools: string[] = [];
  private _selectedTool: string = null;
  get tools() {
    return this._tools;
  }
  get selectedTool() {
    return this._selectedTool;
  }
  set selectedTool(val: string) {
    const oldTool = this._selectedTool;
    this._selectedTool = val;
    this.ws
      .query('?tp_set_frame("tool","' + val + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') this._selectedTool = oldTool;
      });
  }

  // Bases
  private _bases: string[] = [];
  private _selectedBase: string = null;
  get bases() {
    return this._bases;
  }
  get selectedBase() {
    return this._selectedBase;
  }
  set selectedBase(val: string) {
    const oldBase = this._selectedBase;
    this._selectedBase = val;
    this.ws
      .query('?tp_set_frame("base","' + val + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') this._selectedBase = oldBase;
      });
  }

  // Domains
  private _domains: string[] = [];
  private _selectedDomain: string = null;
  private _domainIsFrame = false;
  get domainIsFrame() {
    return this._domainIsFrame;
  }
  get domains() {
    return this._domains;
  }
  get selectedDomain() {
    return this._selectedDomain;
  }
  set selectedDomain(val: string) {
    const oldDomain = this._selectedDomain;
    this._selectedDomain = val;
    this.ws
      .query('?tp_set_application("' + val + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') this._selectedDomain = oldDomain;
        else {
          this.teachServiceNeedsReset.next();
          this.refreshVariables();
          this._domainIsFrame = DOMAIN_FRAMES.includes(val);
        }
      });
  }

  // Machine Table
  private _machineTables: string[] = [];
  private _selectedMachineTable: string = null;
  get machineTables() {
    return this._machineTables;
  }
  get selectedMachineTable() {
    return this._selectedMachineTable;
  }
  set selectedMachineTable(val: string) {
    const old = this._selectedMachineTable;
    this._selectedMachineTable = val;
    this.ws
      .query('?TP_SET_FRAME("MACHINETABLE","' + val + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') this._selectedMachineTable = old;
      });
  }

  // Work Piece
  private _workPieces: string[] = [];
  private _selectedWorkPiece: string = null;
  get workPieces() {
    return this._workPieces;
  }
  get selectedWorkPiece() {
    return this._selectedWorkPiece;
  }
  set selectedWorkPiece(val: string) {
    const old = this._selectedWorkPiece;
    this._selectedWorkPiece = val;
    this.ws
      .query('?TP_SET_FRAME("WORKPIECE","' + val + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') this._selectedWorkPiece = old;
      });
  }

  // Pallets
  private _palletLibVer: string = null;
  get palletLibVer() {
    return this._palletLibVer;
  }
  private _pallets: Pallet[] = [];
  private _selectedPallet: Pallet = null;
  private _palletTypeOptions: string[] = [];
  get pallets() {
    return this._pallets;
  }
  get selectedPallet() {
    return this._selectedPallet;
  }
  set selectedPallet(p: Pallet) {
    this._selectedPallet = p;
  }
  get palletTypeOptions() {
    return this._palletTypeOptions;
  }

  // Grippers
  private _gripperLibVer: string = null;
  get gripperLibVer() {
    return this._gripperLibVer;
  }

  // Payload
  private _payloadLibVer: string = null;
  get payloadLibVer() {
    return this._payloadLibVer;
  }
  private _payloads: Payload[] = [];
  get payloads() {
    return this._payloads;
  }
  private _payloadStart: number[] = null;
  get payloadStart() {
    return this._payloadStart;
  }
  onPayloadStartChange() {
    const cmd =
      '?PAY_SET_START_POSITION("' + this.payloadStart.join(',') + '")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0') {
        this.refreshPayloadStart();
      } else {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }
  private _payloadRelative: number[] = null;
  get payloadRelative() {
    return this._payloadRelative;
  }
  onPayloadRelativeChange() {
    const cmd =
      '?PAY_SET_RELATIVE_TARGET_POSITION("' +
      this.payloadRelative.join(',') +
      '")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0') {
        this.refreshPayloadRelative();
      } else {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }
  private _payloadFreq: number[] = null;
  get payloadFreq() {
    return this._payloadFreq;
  }
  onPayloadFreqChange() {
    const cmd = '?PAY_SET_FREQUENCY("' + this.payloadFreq.join(',') + '")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0') {
        this.refreshPayloadFreq();
      } else {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }
  payloadDuration: number = null;
  onPayloadDurationChange() {
    const cmd = '?PAY_SET_IDENT_TIME_SECONDS(' + this.payloadDuration + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0') this.refreshPayloadDuration();
      else this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  // Lead By Nose
  private _lbnVer: string = null;
  get LeadByNoseLibVer() {
    return this._lbnVer;
  }

  // IOs
  private _iomapVer: string = null;
  get iomapVer() {
    return this._iomapVer;
  }
  private _ioModules: IoModule[];
  get ioModules() {
    return this._ioModules;
  }

  // MCU
  private _mcuVer: string = null;
  private _mcuDevVer: string = null;
  get mcuVer() {
    return this._mcuVer;
  }
  get mcuDevVer() {
    return this._mcuDevVer;
  }

  // CABINET
  private _cabinetVer: string = null;
  get cabinetVer() {
    return this._cabinetVer;
  }

  // Settings
  private _isEmulator = false;
  get isEmulator() {
    return this._isEmulator;
  }
  set isEmulator(isEmulator: boolean) {
    this._isEmulator = isEmulator;
  }
  private _isRealDevice = false;
  tabletMode = 0;
  get isRealDevice() {
    return this._isRealDevice;
  }
  set isRealDevice(isReal: boolean) {
    this._isRealDevice = isReal;
  }
  get controlsAreShowing() {
    return this._isEmulator || this.tabletMode > 0;
  }
  private _jogIncrements: string;
  get jogIncrements() {
    return this._jogIncrements;
  }
  set jogIncrements(val: string) {
    const oldVal = this._jogIncrements;
    this.ws
      .query('?TP_SET_JOG_INCREMENT_SIZE("' + val + '")')
      .then((ret: MCQueryResponse) => {
        this._jogIncrements = ret.result === '0' ? val : oldVal;
      });
  }
  _refreshCycle = 200;
  private _tpVersion: string = null;
  _inactivityTimeout: number = null;
  _softMCTimeout: number = null;
  private _softTPType: string = null;
  private _softTPTypes: string[] = null;
  private _keyboardFormat: {} = null;
  private _JavaVersion: string = null;
  private _MCVersion: string = null;
  get TPVersion() {
    return this._tpVersion;
  }
  get inactivityTimeout() {
    return this._inactivityTimeout;
  }
  get softTPType() {
    return this._softTPType;
  }
  get softTPTypes() {
    return this._softTPTypes;
  }
  get keyboardFormat() {
    return this._keyboardFormat;
  }
  get MCVersion() {
    return this._MCVersion;
  }
  get JavaVersion() {
    return this._JavaVersion;
  }
  get WebServerInfo() {
    return this._JavaVersion.split(' ');
  }

  // Variables
  private _joints: TPVariable[] = [];
  private _pJoints: TPVariable[] = [];
  private _locations: TPVariable[] = [];
  private _longs: TPVariable[] = [];
  private _doubles: TPVariable[] = [];
  private _strings: TPVariable[] = [];
  get joints(): TPVariable[] {
    return this._joints;
  }
  get pJoints(): TPVariable[] {
    return this._pJoints;
  }
  get locations(): TPVariable[] {
    return this._locations;
  }
  get longs(): TPVariable[] {
    return this._longs;
  }
  get doubles(): TPVariable[] {
    return this._doubles;
  }
  get strings(): TPVariable[] {
    return this._strings;
  }
  private addJoint(data: TPVariable): void {
    this._joints.push(data);
  }
  private addPJoint(data: TPVariable): void {
    this._pJoints.push(data);
  }
  private addLocation(data: TPVariable): void {
    this._locations.push(data);
  }
  private addLong(data: TPVariable): void {
    this._longs.push(data);
  }
  private addDouble(data: TPVariable): void {
    this._doubles.push(data);
  }
  private addString(data: TPVariable): void {
    this._strings.push(data);
  }
  private updateJoint(name: string, value: number, arrIndex?: number) {
    this._joints.forEach((jnt, index) => {
      if (jnt.name === name) {
        if (arrIndex) (jnt.value[arrIndex] as TPVariable).value = value;
        else jnt.value = value;
      }
    });
  }

  refreshTools() {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    const queries = [
      this.ws.query('?TP_GET_FRAME_LIST("TOOL")'),
      this.ws.query('?TP_GET_FRAME_NAME("TOOL")'),
    ];
    return Promise.all(queries).then((result: MCQueryResponse[]) => {
      this._tools =
        result[0].result.length > 0 ? result[0].result.split(',') : [];
      if (this._selectedTool !== result[1].result) {
        this._selectedTool = result[1].result;
      }
    });
  }

  refreshPallets(selectedPallet?: string) {
    return this.ws
      .query('?PLT_GET_PALLET_LIST')
      .then((result: MCQueryResponse) => {
        const pallets: string[] =
          result.result.length > 0 ? result.result.split(',') : [];
        const palletObjects = [];
        const queries = [];
        for (const p of pallets) {
          queries.push(this.ws.query('?PLT_GET_PALLET_TYPE("' + p + '")'));
        }
        return Promise.all(queries).then((ret: MCQueryResponse[]) => {
          let i = 0;
          for (const p of pallets) {
            palletObjects.push(new Pallet(p, ret[i].result));
            if (p === selectedPallet) this.selectedPallet = palletObjects[i];
            i++;
          }
          this._pallets = palletObjects;
        });
      });
  }

  refreshPayloads() {
    return this.ws
      .query('?PAY_GET_PAYLOAD_LIST')
      .then((ret: MCQueryResponse) => {
        if (ret.err) return;
        const names = ret.result.split(',');
        const payloads: Payload[] = [];
        for (const name of names) {
          if (name.length > 0) payloads.push(new Payload(name, 6)); // 6 axis
        }
        this._payloads = payloads;
      })
      .then(() => {
        return Promise.all([
          this.refreshPayloadStart(),
          this.refreshPayloadRelative(),
          this.refreshPayloadFreq(),
          this.refreshPayloadDuration(),
        ]);
      });
  }
  private refreshPayloadStart() {
    return this.ws
      .query('?PAY_GET_START_POSITION')
      .then((ret: MCQueryResponse) => {
        this._payloadStart = ret.result
          .substring(1, ret.result.length - 1)
          .split(',')
          .map(s => {
            return Number(s);
          });
      });
  }
  private refreshPayloadRelative() {
    return this.ws
      .query('?PAY_GET_RELATIVE_TARGET_POSITION')
      .then((ret: MCQueryResponse) => {
        this._payloadRelative = ret.result
          .substring(1, ret.result.length - 1)
          .split(',')
          .map(s => {
            return Number(s);
          });
      });
  }
  private refreshPayloadFreq() {
    return this.ws
      .query('?PAY_GET_FREQUENCIES')
      .then((ret: MCQueryResponse) => {
        this._payloadFreq = ret.result
          .substring(1, ret.result.length - 1)
          .split(',')
          .map(s => {
            return Number(s);
          });
      });
  }
  private refreshPayloadDuration() {
    return this.ws
      .query('?PAY_GET_IDENT_TIME_SECONDS')
      .then((ret: MCQueryResponse) => {
        this.payloadDuration = Number(ret.result);
      });
  }

  refreshBases() {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    const queries = [
      this.ws.query('?TP_GET_FRAME_LIST("BASE")'),
      this.ws.query('?TP_GET_FRAME_NAME("BASE")'),
    ];
    return Promise.all(queries).then((result: MCQueryResponse[]) => {
      this._bases =
        result[0].result.length > 0 ? result[0].result.split(',') : [];
      if (this._selectedBase !== result[1].result) {
        this._selectedBase = result[1].result;
      }
    });
  }

  refreshDomains() {
    const queries = [
      this.ws.query('?TP_GET_APPLICATIONS_LIST'),
      this.ws.query('?TP_GET_APPLICATION'),
    ];
    return Promise.all(queries)
      .then((result: MCQueryResponse[]) => {
        const apps =
          result[0].result.length > 0 ? result[0].result.split(';') : [];
        for (let i = 0; i < apps.length; i++) apps[i] = apps[i].split(',')[0];
        this._domains = apps;
        if (this._selectedDomain !== result[1].result) {
          this._selectedDomain = result[1].result;
        }
      })
      .then(() => {
        this.refreshVariables();
      });
  }

  refreshMachineTables() {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    const queries = [
      this.ws.query('?TP_GET_FRAME_LIST("MACHINETABLE")'),
      this.ws.query('?TP_GET_FRAME_NAME("MACHINETABLE")'),
    ];
    return Promise.all(queries).then((result: MCQueryResponse[]) => {
      this._machineTables =
        result[0].result.length > 0 ? result[0].result.split(',') : [];
      if (this._selectedMachineTable !== result[1].result) {
        this._selectedMachineTable = result[1].result;
      }
    });
  }

  refreshWorkPieces() {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    const queries = [
      this.ws.query('?TP_GET_FRAME_LIST("WORKPIECE")'),
      this.ws.query('?TP_GET_FRAME_NAME("WORKPIECE")'),
    ];
    return Promise.all(queries).then((result: MCQueryResponse[]) => {
      this._workPieces =
        result[0].result.length > 0 ? result[0].result.split(',') : [];
      if (this._selectedWorkPiece !== result[1].result) {
        this._selectedWorkPiece = result[1].result;
      }
    });
  }

  private refreshMotionElements() {
    return this.ws
      .query('?tp_get_motion_elements')
      .then((ret: MCQueryResponse) => {
        this._robots = ret.result.length > 0 ? ret.result.split(',') : [];
        if (this.robots.length === 0 || this._selectedRobot !== null) {
          return null;
        }
        return this.ws
          .query('?TP_SET_MOTION_ELEMENT("' + this.robots[0] + '")')
          .then((ret: MCQueryResponse) => {
            if (ret.err || ret.result !== '0') {
              return Promise.resolve(null);
            }
            this._selectedRobot = this.robots[0];
            this.teachServiceNeedsReset.next();
            //Blockly.selectedRobot = this._selectedRobot;
            return Promise.all([
              this.ws.query('?tp_is_robot_type'),
              this.ws.query('?TP_GET_MOTION_ELEMENT_TYPE'),
              this.ws.query('?TP_GET_ROBOT_COORDINATES_TYPE'),
            ]);
          })
          .then((ret: MCQueryResponse[]) => {
            this._isRobotType = ret[0].result !== '0';
            this._robotType = ret[1].result;
            this._robotCoordinateType = new RobotCoordinateType(ret[2].result);
          })
          .catch(() => {});
      });
  }

  private refreshData() {
    return this.refreshMotionElements()
      .then(() => {
        return this.refreshTools();
      })
      .then(() => {
        return this.refreshBases();
      })
      .then(() => {
        const queries = [];
        queries.push(this.ws.query('?TP_GET_COORDINATES_FRAMES_TYPES'));
        queries.push(this.ws.query('?TP_GET_LOCATION_DESCRIPTION'));
        queries.push(this.ws.query('?TP_GET_JOGGING_FRAME'));
        queries.push(this.ws.query('?TP_COO_NAMES'));
        queries.push(this.ws.query('?PLT_VER'));
        queries.push(this.ws.query('?GRP_VER'));
        queries.push(this.ws.query('?LBN_VER'));
        queries.push(this.ws.query('?PAY_VER'));
        queries.push(this.ws.query('?IOMAP_VER'));
        queries.push(this.ws.query('?MCU_VER'));
        queries.push(this.ws.query('?TP_GET_SIMULATED_AXES'));
        queries.push(this.ws.query('?system_version'));
        queries.push(this.ws.query('?TP_IS_SYSTEM_SIMULATED'));
        queries.push(this.ws.query('?MCU_DEV_VER'));

        return Promise.all(queries)
          .then((result: MCQueryResponse[]) => {
            this._frames =
              result[0].result.length > 0 ? result[0].result.split(',') : [];
            this._locationDescriptions =
              result[1].result.length > 0
                ? result[1].result
                    .substr(1)
                    .slice(0, -1)
                    .split(',')
                : [];

            // SET DEFAULT VALUES, ON FIRST INIT
            if (this._selectedFrame === null) {
              if (result[2].result.length > 0) {
                this._selectedFrame = result[2].result;
              }
              else this.selectedFrame = 'JOINT';
            } else if (
              result[2].result.length > 0 &&
              result[2].result !== this._selectedFrame
            ) {
              this._selectedFrame = result[2].result;
            }
            this._cooNames = result[3].result.split(',');

            this._palletLibVer = result[4].err ? null : result[4].result;
            this._gripperLibVer = result[5].err ? null : result[5].result;
            this._lbnVer = result[6].err ? null : result[6].result;
            this._payloadLibVer = result[7].err ? null : result[7].result;
            this._iomapVer = result[8].err ? null : result[8].result;
            this._mcuVer = result[9].err ? null : result[9].result;
            this._simulated = result[10].result === '1';
            this._cabinetVer = result[11].err ? null : result[11].result;
            this._simulatedSystem = result[12].result === '1';
            this._mcuDevVer = result[13].result;

            return this.refreshMachineTables()
              .then(() => {
                return this.refreshWorkPieces();
              })
              .then(() => {
                return this.refreshDomains();
              });
          })
          .then(() => {
            if (this._palletLibVer) {
              return this.refreshPallets().then(() => {
                return this.ws
                  .query('?PLT_GET_PALLET_TYPE_LIST')
                  .then((ret: MCQueryResponse) => {
                    if (ret.result.length === 0) this._palletTypeOptions = [];
                    else this._palletTypeOptions = ret.result.split(',');
                  });
              });
            }
          })
          .catch(() => {});
      })
      .then(() => {
        if (this._payloadLibVer) {
          return this.refreshPayloads();
        }
      })
      .then(() => {
        return this.refreshIos();
      });
  }

  constructor(
    private ws: WebsocketService,
    private cmn: CommonService,
    private stat: TpStatService,
    private login: LoginService,
    private trn: TranslateService,
    private snack: MatSnackBar
  ) {
    this.trn
      .get(['changeOK', 'time_update', 'button.refresh'])
      .subscribe(words => {
        this.words = words;
      });
    this.stat.onlineStatus.subscribe(stat => {
      if (stat) {
        this.init();
      } else {
        this.dataLoaded.next(false);
      }
    });
    this.ws.isConnected.subscribe(stat => {
      if (!stat) { 
        this.dataLoaded.next(false);
      }
      else if (this._JavaVersion === null) {
        this.getMinimumVersions();
 }
    });
  }

  reset() {
    //this._selectedPallet = null;
  }
  
  getMinimumVersions() {
    const promises = [
      this.ws.query('?ver'),
      this.ws.query('java_ver')
    ];
    return Promise.all(promises).then((ret: MCQueryResponse[])=>{
      this._MCVersion = ret[0].result;
      this._JavaVersion = ret[1].result;
    });
  }

  init() {
    // NOTE: CALLING THIS OUTSIDE OF ANGULAR CAUSES TABS TO STOP WORKING...
    const TP_TYPE = this.cmn.isTablet ? 'TP' : 'CS+';
    const promises = [
      this.ws.query('?TP_ENTER("' + TP_TYPE + '")'),
      this.ws.query('?TP_SET_STAT_FORMAT(2)'),
    ];
    this.teachServiceNeedsReset.next();
    this.reset();
    this.ws
      .query('?TP_SET_PERMISSION(' + this.login.permissionCode + ')')
      .then(() => {
        return Promise.all(promises);
      })
      .then(() => {
        return this.ws.query('?tp_get_switch_mode');
      })
      .then((ret: MCQueryResponse) => {
        if (ret.result !== 'A' && !this.cmn.isTablet) {
          this.stat.mode = 'A';
        }
        return this.refreshData();
      })
      .then(() => {
        return this.getSettings();
      })
      .then(() => {
        this.dataLoaded.next(true);
      });
  }

  getSettings() {
    const date = new Date();
    const dateString =
      ('0' + date.getDate()).slice(-2) +
      '/' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '/' +
      date
        .getFullYear()
        .toString()
        .slice(-2);
    const timeString =
      ('0' + date.getHours()).slice(-2) +
      ':' +
      ('0' + date.getMinutes()).slice(-2) +
      ':' +
      ('0' + date.getSeconds()).slice(-2);

    const promises = [
      this.ws.query('?TP_VER'),
      this.ws.query('?tp_get_inactivity_timeout'),
      this.ws.query('?tp_get_mc_timeout'),
      this.ws.query('?tp_get_refresh_rate'),
      this.ws.query('?TP_GET_KEYBOARD_TYPE'),
      this.ws.query('?TP_GET_KEYBOARD_TYPES_LIST'),
      this.ws.query('?TP_GET_KEYBOARD_FORMAT'),
      this.ws.query('?TP_GET_JOG_INCREMENT_SIZE'),
    ];
    return Promise.all(promises)
      .then((results: MCQueryResponse[]) => {
        this._tpVersion = results[0].result;
        this._inactivityTimeout = Number(results[1].result);
        this._softMCTimeout = Number(results[2].result);
        this._refreshCycle = Number(results[3].result);
        this._softTPType = results[4].result;
        this._softTPTypes = results[5].result.split(',');
        this._jogIncrements = results[7].result;
        try {
          this._keyboardFormat = JSON.parse(results[6].result);
        } catch (err) {
          this._keyboardFormat = null;
        }
        if (this.softTPType === 'NONE') {
          return this.ws.query(
            '?TP_SET_KEYBOARD_TYPE("' + this.softTPTypes[0] + '")'
          );
        }
      })
      .then((result: MCQueryResponse) => {
        if (isNaN(this._refreshCycle)) this._refreshCycle = 200;
        if (result && result.result === '0') {
          this._softTPType = this.softTPTypes[0];
          return this.ws.query('?TP_GET_KEYBOARD_FORMAT');
        }
      })
      .then((result: MCQueryResponse) => {
        if (result && !result.err) {
          try {
            this._keyboardFormat = JSON.parse(result.result);
          } catch (err) {
            this._keyboardFormat = null;
          }
        }
      });
  }

  refreshIos() {
    this.ws.query('?iomap_get_init_info').then((ret: MCQueryResponse) => {
      const modules: IoModule[] = [];
      const parts = ret.result.split(';');
      for (const p of parts) {
        if (p.length > 0) {
          modules.push(new IoModule(p));
        }
      }
      this._ioModules = modules;
    });
  }

  refreshVariables() {
    this._varRefreshInProgress = true;
    const promises = [
      this.ws.query('?TP_GET_JOINTS("ALL")'),
      this.ws.query('?TP_get_locations("all")'),
      this.ws.query('?TP_GET_LONGS("")'),
      this.ws.query('?TP_GET_DOUBLES("")'),
      this.ws.query('?TP_GET_STRINGS("")'),
      this.ws.query('?tp_get_project_joints("ALL")'),
    ];
    return Promise.all(promises).then((result: MCQueryResponse[]) => {
      // ADD JOINTS
      this._joints.length = 0;
      let data = result[0].result.split(',').sort();
      data.forEach((name: string) => {
        if (name.length > 0) {
          this.addJoint(new TPVariable(TPVariableType.JOINT, name));
        }
      });

      // ADD LOCATIONS
      this._locations.length = 0;
      data = result[1].result.split(',').sort();
      data.forEach((name: string) => {
        if (name.length > 0) {
          this.addLocation(new TPVariable(TPVariableType.LOCATION, name));
        }
      });

      // ADD LONGS
      this._longs.length = 0;
      data = result[2].result.split(',').sort();
      data.forEach((name: string) => {
        if (name.length > 0) {
          this.addLong(new TPVariable(TPVariableType.LONG, name));
        }
      });

      // ADD DOUBLES
      this._doubles.length = 0;
      data = result[3].result.split(',').sort();
      data.forEach((name: string) => {
        if (name.length > 0) {
          this.addDouble(new TPVariable(TPVariableType.DOUBLE, name));
        }
      });

      // ADD STRINGS
      this._strings.length = 0;
      data = result[4].result.split(',').sort();
      data.forEach((name: string) => {
        if (name.length > 0) {
          this.addString(new TPVariable(TPVariableType.STRING, name));
        }
      });

      // ADD Project joits
      this._pJoints.length = 0;
      data = result[5].result.split(',');
      data.forEach((name: string) => {
        if (name.length > 0) {
          this.addPJoint(new TPVariable(TPVariableType.JOINT, name));
        }
      });

      this._varRefreshInProgress = false;
      this.dataRefreshed.next(true);
    });
  }
  
  setDebugMode(on: boolean) {
    if (on) {
      this.dataLoaded.next(false);
    }
  }
}
