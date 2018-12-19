import { Injectable, ApplicationRef } from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {BehaviorSubject} from 'rxjs';
import {WebsocketService, MCQueryResponse} from './websocket.service';
import {TeachService} from './teach.service';
import {TPVariable} from '../../core/models/tp/tp-variable.model';
import {TPVariableType} from '../../core/models/tp/tp-variable-type.model';
import {TpType} from '../../core/models/tp/tp-type.model';
import {TpStatService} from './tp-stat.service';
import {Pallet} from '../models/pallet.model';
import {Payload} from '../models/payload.model';
import {IoModule} from '../models/io/io-module.model';

declare var Blockly:any;

const DOMAIN_FRAMES = ['BASE','TOOL','MACHINETABLE','WORKPIECE'];

@Injectable()
export class DataService {
  
  public dataLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  private _varRefreshInProgress : boolean;
  get varRefreshInProgress() { return this._varRefreshInProgress; }
  
  public dataRefreshed : BehaviorSubject <boolean> = new BehaviorSubject <boolean>(false);
  
  // Robots
  private _robots: string[] = [];
  private _selectedRobot: string = null;
  private _isRobotType : boolean = true;
  private _locationDescriptions : string[];
  private _robotType: string = null;
  get robots() { return this._robots; }
  get isRobotType() { return this._isRobotType;}
  get robotType() { return this._robotType; }
  get locationDescriptions() {return this._locationDescriptions;}
  get selectedRobot() { return this._selectedRobot; }
  set selectedRobot(val: string) {
    let oldRobot = this._selectedRobot;
    this._selectedRobot = val;
    this.ws.query('?TP_SET_MOTION_ELEMENT("' + val + '")')
    .then((ret:MCQueryResponse)=>{
      if (ret.err || ret.result !== "0") {
        this._selectedRobot = oldRobot;
        return Promise.reject(ret.result);
      }
      this.teach.reset();
      Blockly.selectedRobot = this._selectedRobot;
      const promises : any = Promise.all([
        this.ws.query("?tp_is_robot_type"),
        this.ws.query("?TP_GET_MOTION_ELEMENT_TYPE")
      ]);
      return promises;
    }).then((ret:MCQueryResponse[])=>{
      this._isRobotType = ret[0].result !== '0';
      this._robotType = ret[1].result;
      this.refreshData();
    }).catch(()=>{});
  }
  
  // Frames
  private _frames: string[] = [];
  private _selectedFrame: string = null;
  private _cooNames : string[];
  get frames() {return this._frames; }
  get cooNames() {return this._cooNames;}
  get selectedFrame() { return this._selectedFrame; }
  set selectedFrame(val: string) {
    let oldFrame = this._selectedFrame;
    this._selectedFrame = val;
    this.ws.query('?TP_SET_JOGGING_FRAME("' + val + '")').then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._selectedFrame = oldFrame;
      return this.ws.query('?TP_COO_NAMES');
    }).then((ret: MCQueryResponse)=>{
      if (ret.err)
        return;
      this._cooNames = ret.result.split(',');
    });
  }
  
  // Tools
  private _tools: string[] = [];
  private _selectedTool: string = null;
  get tools() {return this._tools; }
  get selectedTool() { return this._selectedTool; }
  set selectedTool(val: string) {
    let oldTool = this._selectedTool;
    this._selectedTool = val;
    this.ws.query('?tp_set_tool("' + val + '")').then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._selectedTool = oldTool;
    });
  }
  
  // Bases
  private _bases: string[] = [];
  private _selectedBase: string = null;
  get bases() {return this._bases; }
  get selectedBase() { return this._selectedBase; }
  set selectedBase(val: string) { 
    let oldBase = this._selectedBase;
    this._selectedBase = val;
    this.ws.query('?tp_set_base("' + val + '")').then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._selectedBase = oldBase;
    });
  }
  
  // Domains
  private _domains: string[] = [];
  private _selectedDomain: string = null;
  private _domainIsFrame : boolean = false;
  get domainIsFrame() { return this._domainIsFrame; }
  get domains() {return this._domains; }
  get selectedDomain() { return this._selectedDomain; }
  set selectedDomain(val: string) {
    let oldDomain = this._selectedDomain;
    this._selectedDomain = val;
    this.ws.query('?tp_set_application("' + val + '")').then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._selectedDomain = oldDomain;
      else {
        this.teach.reset();
        this.refreshVariables();
        this._domainIsFrame = DOMAIN_FRAMES.includes(val);
      }
    });
  }
  
  // Machine Table
  private _machineTables: string[] = [];
  private _selectedMachineTable: string = null;
  get machineTables() {return this._machineTables; }
  get selectedMachineTable() {return this._selectedMachineTable; }
  set selectedMachineTable(val: string) { 
    let old = this._selectedMachineTable;
    this._selectedMachineTable = val;
    this.ws.query('?TP_SET_FRAME("MACHINETABLE","' + val + '")')
    .then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._selectedMachineTable = old;
    });
  }
  
  // Work Piece
  private _workPieces: string[] = [];
  private _selectedWorkPiece: string = null;
  get workPieces() {return this._workPieces; }
  get selectedWorkPiece() {return this._selectedWorkPiece; }
  set selectedWorkPiece(val: string) { 
    let old = this._selectedWorkPiece;
    this._selectedWorkPiece = val;
    this.ws.query('?TP_SET_FRAME("WORKPIECE","' + val + '")')
    .then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        this._selectedWorkPiece = old;
    });
  }
  
  // Pallets
  private _palletLibVer : string = null;
  get palletLibVer() {return this._palletLibVer; } 
  private _pallets: Pallet[] = [];
  private _selectedPallet: Pallet = null;
  private _palletTypeOptions : string[] = [];
  get pallets() {return this._pallets; }
  get selectedPallet() {return this._selectedPallet; }
  set selectedPallet(p: Pallet) { 
    this._selectedPallet = p;
  }
  get palletTypeOptions() {return this._palletTypeOptions;}
  
  // Grippers
  private _gripperLibVer : string = null;
  get gripperLibVer() {return this._gripperLibVer; }
  
  // Payload
  private _payloadLibVer : string = null;
  get payloadLibVer() {return this._payloadLibVer; } 
  private _payloads: Payload[] = [];
  get payloads() {return this._payloads; }
  
  // Lead By Nose
  private _lbnVer : string = null;
  get LeadByNoseLibVer() {return this._lbnVer; }
  
  // IOs
  private _ioModules: IoModule[];
  get ioModules() {return this._ioModules;}
  
  // Settings
  private _isEmulator = false;
  get isEmulator() { return this._isEmulator; }
  set isEmulator(isEmulator: boolean) {this._isEmulator = isEmulator; }
  private _isRealDevice = false;
  tabletMode : number = 0;
  get isRealDevice() {return this._isRealDevice; }
  set isRealDevice(isReal: boolean) {this._isRealDevice = isReal; }
  get controlsAreShowing() {
    return this._isEmulator || this.tabletMode > 0;
  }
  private _tpType : TpType = null;
  get tpType() { return this._tpType; }
  set tpType(val:TpType) {
    let oldVal = this._tpType;
    this._tpType = val;
    this.ws.query('?TP_SET_TP_TYPE("' + val.name + '")').then((ret: MCQueryResponse)=>{
      if (ret.result !== '0' || ret.err) {
        this._tpType = oldVal;
      } else {
        if (this._tpType.name === 'EMULATOR') {
          this.isEmulator = true;
          this.isRealDevice = false;
          this.tabletMode = 0;
        } else { // REAL TP
          this.isRealDevice = true;
          this.isEmulator = false;
          this.tabletMode = this._tpType.name === 'TABLET_WITHOUT_SWITCH'?1 : 0;
        }
      }
      //console.log(this._tpType.name);
      this.ref.tick();
    });
  }
  private _tpTypes : TpType[];
  get tpTypes() { return this._tpTypes; }
  set tpTypes(val: TpType[]) { this._tpTypes = val; }
  
  _refreshCycle : number = 200;
  private _tpVersion : string = null;
  _inactivityTimeout : number = null;
  _softMCTimeout : number = null;
  private _softTPType : string = null;
  private _softTPTypes : string[] = null;
  private _keyboardFormat : any = null;
  private _JavaVersion : string = null;
  private _MCVersion : string = null;
  get TPVersion(){ return this._tpVersion;}
  get inactivityTimeout(){ return this._inactivityTimeout;}
  get softTPType(){ return this._softTPType;}
  get softTPTypes(){ return this._softTPTypes;}
  get keyboardFormat(){ return this._keyboardFormat;}
  get MCVersion() {return this._MCVersion;}
  get JavaVersion() {return this._JavaVersion;}
  
  // Variables
  private _joints: TPVariable[] = [];
  private _locations: TPVariable[] = [];
  private _longs: TPVariable[] = [];
  private _doubles: TPVariable[] = [];
  private _strings: TPVariable[] = [];
  get joints() : TPVariable[] {return this._joints; }
  get locations() : TPVariable[] {return this._locations; }
  get longs() : TPVariable[] {return this._longs; }
  get doubles() : TPVariable[] {return this._doubles; }
  get strings() : TPVariable[] {return this._strings; }
  private addJoint(data : TPVariable) : void { this._joints.push(data); }
  private addLocation(data : TPVariable) : void {this._locations.push(data);}
  private addLong(data : TPVariable) : void { this._longs.push(data);}
  private addDouble(data : TPVariable) : void { this._doubles.push(data);}
  private addString(data : TPVariable) : void { this._strings.push(data);}
  private updateJoint(name : string, value: number, arrIndex? : number) {
    this._joints.forEach((jnt,index)=>{
      if (jnt.name === name) {
        if (arrIndex)
          (<TPVariable>jnt.value[arrIndex]).value = value;
        else
          jnt.value = value;
      }
    });
  }
  
  refreshTools() : Promise<any> {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    var queries:Promise<any>[] = [
      this.ws.query('?TP_GET_FRAME_LIST("TOOL")'),
      this.ws.query('?TP_GET_FRAME_NAME("TOOL")')
    ];
    return Promise.all(queries).then((result: MCQueryResponse[])=>{
      this._tools = result[0].result.length>0 ? result[0].result.split(','):[];
      if (this._selectedTool !== result[1].result)
        this._selectedTool = result[1].result;
    });
  }
  
  refreshPallets(selectedPallet? : string) : Promise<any> {
    return this.ws.query('?PLT_GET_PALLET_LIST').then((result: MCQueryResponse)=>{
      let pallets : string[] = result.result.length>0 ? result.result.split(','):[];
      var palletObjects = [];
      var queries : Promise<any>[] = [];
      for (let p of pallets) {
        queries.push(this.ws.query('?PLT_GET_PALLET_TYPE("' + p + '")'));
      }
      return Promise.all(queries).then((ret:MCQueryResponse[])=>{
        let i = 0;
        for (let p of pallets) {
          palletObjects.push(new Pallet(p, ret[i].result));
          if (p === selectedPallet)
            this.selectedPallet = palletObjects[i];
          i++;
        }
        this._pallets = palletObjects;
      });
    });
  }
  
  refreshPayloads() {
    return this.ws.query('?PAY_GET_PAYLOAD_LIST').then((ret: MCQueryResponse)=>{
      if (ret.err)
        return;
      const names = ret.result.split(',');
      let payloads : Payload[] = [];
      for (let name of names) {
        if (name.length > 0)
          payloads.push(new Payload(name,6)); // 6 axis
      }
      this._payloads = payloads;
    });
  }
  
  refreshBases() : Promise<any> {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    var queries:Promise<any>[] = [
      this.ws.query('?TP_GET_FRAME_LIST("BASE")'),
      this.ws.query('?TP_GET_FRAME_NAME("BASE")')
    ];
    return Promise.all(queries).then((result: MCQueryResponse[])=>{
      this._bases = result[0].result.length>0 ? result[0].result.split(','):[];
      if (this._selectedBase !== result[1].result)
        this._selectedBase = result[1].result;
    });
  }
  
  refreshDomains() : Promise<any> {
    var queries:Promise<any>[] = [
      this.ws.query('?TP_GET_APPLICATIONS_LIST'),
      this.ws.query('?TP_GET_APPLICATION')
    ];
    return Promise.all(queries).then((result: MCQueryResponse[])=>{
      let apps = result[0].result.length>0 ? result[0].result.split(';'):[];
      for (let i=0; i<apps.length; i++)
        apps[i] = apps[i].slice(0,-2);
      this._domains = apps;
      if (this._selectedDomain !== result[1].result)
        this._selectedDomain = result[1].result;
    }).then(()=>{this.refreshVariables();});
  }
  
  refreshMachineTables() : Promise<any> {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    var queries:Promise<any>[] = [
      this.ws.query('?TP_GET_FRAME_LIST("MACHINETABLE")'),
      this.ws.query('?TP_GET_FRAME_NAME("MACHINETABLE")')
    ];
    return Promise.all(queries).then((result: MCQueryResponse[])=>{
      this._machineTables = result[0].result.length>0 ? result[0].result.split(','):[];
      if (this._selectedMachineTable !== result[1].result)
        this._selectedMachineTable = result[1].result;
    });
  }
  
  refreshWorkPieces() : Promise<any> {
    if (!this.isRobotType) {
      return Promise.resolve();
    }
    var queries:Promise<any>[] = [
      this.ws.query('?TP_GET_FRAME_LIST("WORKPIECE")'),
      this.ws.query('?TP_GET_FRAME_NAME("WORKPIECE")')
    ];
    return Promise.all(queries).then((result: MCQueryResponse[])=>{
      this._workPieces = result[0].result.length>0 ? result[0].result.split(','):[];
      if (this._selectedWorkPiece !== result[1].result)
        this._selectedWorkPiece = result[1].result;
    });
  }
  
  private refreshMotionElements() : Promise<any> {
    return this.ws.query('?tp_get_motion_elements').then((ret: MCQueryResponse)=>{
      this._robots=ret.result.length > 0 ? ret.result.split(','):[];
      if (this.robots.length === 0 || this._selectedRobot !== null)
        return null;
      return this.ws.query('?TP_SET_MOTION_ELEMENT("' + this.robots[0] + '")')
      .then((ret:MCQueryResponse)=>{
        if (ret.err || ret.result !== "0") {
          return null;
        }
        this._selectedRobot = this.robots[0];
        this.teach.reset();
        Blockly.selectedRobot = this._selectedRobot;
        const promises : any = Promise.all([
          this.ws.query("?tp_is_robot_type"),
          this.ws.query("?TP_GET_MOTION_ELEMENT_TYPE")
        ]);
        return promises;
      }).then((ret:MCQueryResponse[])=>{
        this._isRobotType = ret[0].result !== '0';
        this._robotType = ret[1].result;
      }).catch(()=>{});
    });
  }
  
  private refreshData() : Promise<any> {
    return this.refreshMotionElements()
    .then(()=>{return this.refreshTools();})
    .then(()=>{return this.refreshBases();})
    .then(()=>{
      var queries:Promise<any>[] = [];
      queries.push(this.ws.query('?TP_GET_COORDINATES_FRAMES_TYPES'));
      queries.push(this.ws.query('?TP_GET_LOCATION_DESCRIPTION'));
      queries.push(this.ws.query('?TP_GET_JOGGING_FRAME'));
      queries.push(this.ws.query('?TP_COO_NAMES'));
      queries.push(this.ws.query('?PLT_VER'));
      queries.push(this.ws.query('?GRP_VER'));
      queries.push(this.ws.query('?LBN_VER'));
      queries.push(this.ws.query('?PAY_VER'));
      
      return Promise.all(queries).then((result: MCQueryResponse[])=>{
        
        this._frames=result[0].result.length > 0 ? result[0].result.split(','):[];
        this._locationDescriptions = result[1].result.length > 0 ?
          result[1].result.substr(1).slice(0,-1).split(",") : [];

        // SET DEFAULT VALUES, ON FIRST INIT
        if (this._selectedFrame === null) {
          if (result[2].result.length > 0)
            this._selectedFrame = result[2].result;
          else
            this.selectedFrame = 'JOINT';
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
        
        return this.refreshMachineTables()
          .then(()=>{return this.refreshWorkPieces();})
          .then(()=>{return this.refreshDomains();});
      }).then(()=>{
        if (this._palletLibVer) {
          return this.refreshPallets().then(()=>{
            return this.ws.query('?PLT_GET_PALLET_TYPE_LIST')
            .then((ret: MCQueryResponse)=>{
              if (ret.result.length === 0)
                this._palletTypeOptions = [];
              else
                this._palletTypeOptions = ret.result.split(',');
            });
          });
        }
      }).catch(()=>{});
    }).then(()=>{
      if (this._payloadLibVer) {
        return this.refreshPayloads();
      }
    }).then(()=>{
      return this.refreshIos();
    });
  }

  constructor(
    private ws : WebsocketService,
    private teach : TeachService,
    private snack : MatSnackBar,
    private ref : ApplicationRef,
    private stat: TpStatService
  ) {
    this.stat.onlineStatus.subscribe(stat=>{
      if (stat) {
        // TODO: REMOVE THIS TIMEOUT AND REPLACE WITH IS_INIT_DONE FUNCTION
        //setTimeout(()=>{
          this.init();
        //},10000);
      }
    });
  }
  
  reset() {
    //this._selectedPallet = null;
  }
  
  init() {
    // NOTE: CALLING THIS OUTSIDE OF ANGULAR CAUSES TABS TO STOP WORKING...
    
    const promises = [
      this.ws.query('?TP_ENTER("CS+")'),
      this.ws.query("?TP_SET_STAT_FORMAT(2)"),
      //this.ws.query("?TP_JOGSCREEN")
    ];
    
    this.teach.reset();
    this.reset();
    this.ws.query('?tp_set_user_type("ADMINISTRATOR","ADMINISTRATOR")')
    .then(()=>{return Promise.all(promises);})
    .then(()=>{return this.ws.query('?tp_get_switch_mode');})
    .then((ret:MCQueryResponse)=>{
      if (ret.result !== 'A')
        this.stat.mode = 'A';
      //this.stat.deadman = false;
      this.tpType = {
        name: 'EMULATOR',
        friendlyName: null
      };
      return this.refreshData();
    }).then(()=>{return this.getSettings();})
    .then(()=>{this.dataLoaded.next(true);});
  }
  
  getSettings() {
    var promises = [
      this.ws.query("?TP_VER"),
      this.ws.query("?tp_get_inactivity_timeout"),
      this.ws.query("?tp_get_mc_timeout"),
      this.ws.query("?tp_get_refresh_rate"),
      this.ws.query("?TP_GET_KEYBOARD_TYPE"),
      this.ws.query("?TP_GET_KEYBOARD_TYPES_LIST"),
      this.ws.query("?TP_GET_KEYBOARD_FORMAT"),
      this.ws.query('?ver'),
      this.ws.query('java_ver')
    ];
    return Promise.all(promises).then((results: MCQueryResponse[])=>{
      this._tpVersion = results[0].result;
      this._inactivityTimeout = parseInt(results[1].result);
      this._softMCTimeout = parseInt(results[2].result);
      this._refreshCycle = parseInt(results[3].result);
      this._softTPType = results[4].result;
      this._softTPTypes = results[5].result.split(",");
      this._MCVersion = results[7].result;
      this._JavaVersion = results[8].result;
      try {
        this._keyboardFormat = JSON.parse(results[6].result);
      } catch (err) {
        this._keyboardFormat = null;
      }
      if (this.softTPType === "NONE") {
        return this.ws.query(
          '?TP_SET_KEYBOARD_TYPE("' + 
          this.softTPTypes[0] +
          '")'
        );
      }
      
    }).then((result: MCQueryResponse)=>{
      if (isNaN(this._refreshCycle))
        this._refreshCycle = 200;
      if (result && result.result === "0") {
        this._softTPType = this.softTPTypes[0];
        return this.ws.query("?TP_GET_KEYBOARD_FORMAT");
      }
      }).then((result: MCQueryResponse)=>{
      if (result && !result.err) {
        try {
          this._keyboardFormat = JSON.parse(result.result);
        } catch (err) {
          this._keyboardFormat = null;
        }
      }
    });
  }
  
  onSettingsKeyboardClose() {
    this.ws.send('?tp_set_inactivity_timeout(' + this._inactivityTimeout + ')',null);
    this.ws.send('?tp_set_mc_timeout(' + this._softMCTimeout + ')',null);
    this.ws.send('?tp_set_refresh_rate(' + this._refreshCycle + ')',null);
    this.snack.open('SETTINGS CHANGED','',{duration: 2000});
  }
  
  refreshIos() {
    this.ws.query('?iomap_get_init_info').then((ret:MCQueryResponse)=>{
      let modules : IoModule[] = [];
      const parts = ret.result.split(';');
      for (let p of parts) {
        if (p.length > 0) {
          modules.push(new IoModule(p));
        }
      }
      this._ioModules = modules;
    });
  }
  
  refreshVariables() {
    this._varRefreshInProgress = true;
    var promises = [
      this.ws.query('?TP_GET_JOINTS("ALL")'),
      this.ws.query('?TP_get_locations("all")'),
      this.ws.query('?TP_GET_LONGS("")'),
      this.ws.query('?TP_GET_DOUBLES("")'),
      this.ws.query('?TP_GET_STRINGS("")')
    ];
    return Promise.all(promises).then((result: MCQueryResponse[])=>{
      // ADD JOINTS
      this._joints.length = 0;
      var data = result[0].result.split(',');
      data.forEach((name:string)=>{
        if (name.length > 0)
          this.addJoint(new TPVariable(TPVariableType.JOINT,name));
      });
      
      // ADD LOCATIONS
      this._locations.length = 0;
      var data = result[1].result.split(',');
      data.forEach((name:string)=>{
        if (name.length > 0)
          this.addLocation(new TPVariable(TPVariableType.LOCATION,name));
      });
      
      // ADD LONGS
      this._longs.length = 0;
      var data = result[2].result.split(',');
      data.forEach((name:string)=>{
        if (name.length > 0)
          this.addLong(new TPVariable(TPVariableType.LONG,name));
      });
      
      // ADD DOUBLES
      this._doubles.length = 0;
      var data = result[3].result.split(',');
      data.forEach((name:string)=>{
        if (name.length > 0)
          this.addDouble(new TPVariable(TPVariableType.DOUBLE,name));
      });
      
      // ADD STRINGS
      this._strings.length = 0;
      var data = result[4].result.split(',');
      data.forEach((name:string)=>{
        if (name.length > 0)
          this.addString(new TPVariable(TPVariableType.STRING,name));
      });
      
      this._varRefreshInProgress = false;
      this.dataRefreshed.next(true);
    });
  }
}
