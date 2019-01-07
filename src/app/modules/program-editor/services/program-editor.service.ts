import { Injectable, EventEmitter, ApplicationRef, NgZone } from '@angular/core';
import {MatSnackBar, MatDialog} from '@angular/material';
import {MCFile, ApiService, UploadResult} from '../../../modules/core/services/api.service';
import {WebsocketService, MCQueryResponse} from '../../../modules/core/services/websocket.service';
import {ProjectManagerService, DataService} from '../../core';
import {Backtrace} from '../../core/models/backtrace.model';
import {Subject} from 'rxjs';
import {TPVariable} from '../../core/models/tp/tp-variable.model';
import {LineParser} from '../../core/models/line-parser.model';
import {Pallet} from '../../core/models/pallet.model';
import {YesNoDialogComponent} from '../../../components/yes-no-dialog/yes-no-dialog.component';
import {ErrorFrame} from '../../core/models/error-frame.model';

export const TASKSTATE_NOTLOADED = -1;
export const TASKSTATE_RUNNING = 1;
export const TASKSTATE_STOPPED = 2;
export const TASKSTATE_ERROR = 4;
export const TASKSTATE_TERMINATED = 5;
export const TASKSTATE_READY = 7;
export const TASKSTATE_KILLSTART = 9;
export const TASKSTATE_KILLED = 10;
export const TASKSTATE_LIB_LOADED = 11;

@Injectable()
export class ProgramEditorService {
  
  files : MCFile[] = [];
  activeFile : string = null; // The currently opened context in the editor
  displayedFile: string = null; // The file that's actually displayed in the editor
  editorText : string = null;
  status : ProgramStatus = null;
  errors : TRNERRLine[] = [];
  editorLine : number = -1;
  isDirty: boolean = false;
  mode: string = null;
  fileRef: any = null; // A reference to the project file which is active
  backtrace: Backtrace = null; // The last backtrace
  
  // EVENTS
  skipLineRequest : EventEmitter<number>=new EventEmitter();
  dragEnd : EventEmitter<any>=new EventEmitter();
  onReplaceRange: EventEmitter<any> = new EventEmitter();
  editorTextChange : EventEmitter<string> = new EventEmitter<string>();
  statusChange : EventEmitter<ProgramStatus>=new EventEmitter<ProgramStatus>();
  errLinesChange : EventEmitter<TRNERRLine[]>=new EventEmitter<TRNERRLine[]>();
  onInsertAndJump : EventEmitter<any> = new EventEmitter();
  onReplaceLine : EventEmitter<any> = new EventEmitter();
  onUndo : EventEmitter<any> = new EventEmitter();
  onRedo : EventEmitter<any> = new EventEmitter();
  onFind : EventEmitter<any> = new EventEmitter();
  onReplace : EventEmitter<any> = new EventEmitter();
  fileChange: Subject<string>=new Subject<string>();
  
  private statusInterval : any = null;
  private oldStatString : string;
  private activeFilePath: string = null;
  private stepMode: boolean = false; // True when the user clicks on STEP button
  
  // LINE PARSING
  parser: LineParser = new LineParser(this.data);
  variablesInLine: TPVariable[] = [];
  lineParams : any = null;
  disableStepOver : boolean = false;
  
  // FLOW REMEMBERING
  lastVar : TPVariable;
  lastVarIndex : number;
  lastPallet : Pallet;
  rangeStart: number;
  rangeEnd: number;
  rangeText: string;
  
  constructor(
    private ref : ApplicationRef,
    private zone: NgZone,
    private dialog : MatDialog,
    private prj: ProjectManagerService,
    private ws: WebsocketService,
    private snack : MatSnackBar,
    private data: DataService,
    private api : ApiService) {
    this.refreshFiles();
    this.ws.isConnected.subscribe(stat=>{
      if (!stat) {
        this.mode = null;
        this.activeFile = null;
        this.displayedFile = null;
        this.editorText = '';
        this.editorTextChange.emit('');
      }
    });
  }

  setFile(f : string, path:string, ref: any, bt?:Backtrace) { // OPEN A FILE
    this.fileRef = ref;
    if (f === this.activeFile && bt) {
      this.backtrace = null;
      this.fileChange.next(this.activeFile);
      return;
    }
    this.backtrace = bt;
    this.close();
    this.activeFile = bt ? bt.taskName : f;
    this.displayedFile = f;
    const finalPath = path || '';
    this.activeFilePath = path ? path : null;
    this.api.getPathFile(finalPath+f).then(ret=>{
      this.editorText = ret;
      this.editorTextChange.emit(ret);
      this.refreshStatus(true);
      this.isDirty = false;
      this.fileChange.next(this.activeFile);
      this.dragEnd.emit();
    });
  }
  
  skipToLine(n:number) { // CALLED WHEN USER WANTS TO SKIP TO A SPECIFIC LINE
    this.skipLineRequest.emit(n);
  }
  
  replaceRange(cmd: string) { this.onReplaceRange.emit(cmd); }
  replaceLine(index:number ,cmd: string) {
    this.onReplaceLine.emit({index:index,cmd:cmd});
  }
  
  onAceEditorCursorChange(rowIndex:number, row:string) {
    this.rangeStart = NaN;
    this.rangeEnd = NaN;
    this.rangeText = null;
    let lineType = this.parser.getLineType(row);
    if (
      lineType === this.parser.LineType.MOVE ||
      lineType === this.parser.LineType.CIRCLE
    ) {
      this.variablesInLine = this.parser.getVariablesFromLine(row);
      this.lineParams = this.parser.getLineParameters(row, lineType, rowIndex);
    } else {
      this.variablesInLine = [];
      this.lineParams = null;
    }
    if (lineType === this.parser.LineType.PROGRAM)
      this.disableStepOver = true;
    else
      this.disableStepOver = false;
  }
  
  onAceEditorRangeChange(start: number, end: number, text: string) {
    this.variablesInLine = [];
    this.lineParams = null;
    this.rangeStart = start;
    this.rangeEnd = end;
    this.rangeText = text;
  }
  
  refreshFiles() {
    return this.api.getFiles('PRG,UPG,LIB,ULB,DAT,DEF,LOG,TXT').then((ret:MCFile[])=>{
      this.files = ret;
    });
  }
  
  onDragEnd() {
    this.dragEnd.emit();
  }
  
  close() {
    this.refreshStatus(false);
    this.activeFile = null;
    this.displayedFile = null;
    this.editorText = null;
    this.editorTextChange.emit(null);
    this.status = null;
    this.errors = [];
    this.editorLine = -1;
    this.isDirty = false;
  }
  
  save() : Promise<any> {
    if (this.activeFile === null)
      return Promise.resolve();
    const path = this.activeFilePath || '';
    return this.api.uploadToPath(
      new File([new Blob([this.editorText])],this.activeFile),true,path)
    .then((ret:UploadResult)=>{
      if (ret.success) {
        this.snack.open('Saved.','',{duration:1500});
        this.isDirty = false;
      } else
        this.snack.open('Error ' + ret.err,'',{duration:2000});
    });
  }
  
  load() {
    if (this.activeFile === null)
      return;
    const path = this.activeFilePath || '';
    this.api.uploadToPath(
      new File([new Blob([this.editorText])],this.activeFile),true,path)
    .then((ret:UploadResult)=>{
      if (ret.success) {
        if (this.fileRef) {
          const prj = this.prj.currProject.value.name;
          const file = this.activeFile.substring(0,this.activeFile.indexOf('.'));
          this.ws.query('?tp_load_app("' + prj + '","' + file + '")').then((ret: MCQueryResponse)=>{
            if (ret.result !== '0')
              this.getTRNERR(null);
            else
              this.errors = [];
          });
          return;
        }
        this.ws.query('Load$ "/FFS0/SSMC/' + path + this.activeFile + '"')
        .then((ret:MCQueryResponse)=>{
          if (ret.err)
            this.getTRNERR(ret.err.errMsg);
          else
            this.errors = [];
        });
      } else
        this.snack.open('Error ' + ret.err,'',{duration:2000});
    });
  }
  
  run() {
    if (this.activeFile === null)
      return;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0,this.activeFile.indexOf('.'));
      this.ws.query('?tp_run_app("' + prj + '","' + file + '")');
      return;
    }
    this.ws.query('KillTask ' + this.activeFile).then(()=>{
      this.ws.query('StartTask ' + this.activeFile);
    });
  }
  
  jump() {
    let prgName = this.activeFile;
    this.ws.query('ContinueTask '+prgName+' programline = ' + this.editorLine);
  }
  
  kill() {
    if (this.activeFile === null)
      return;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0,this.activeFile.indexOf('.'));
      this.ws.query('?tp_reset_app("' + prj + '","' + file + '")');
      return;
    }
    this.ws.query('KillTask ' + this.activeFile);
  }
  
  idle() {
    if (this.activeFile === null)
      return;
    this.ws.query('IdleTask ' + this.activeFile);
  }
  
  unload() {
    if (this.activeFile === null)
      return;
    this.ws.query('KillTask ' + this.activeFile).then(()=>{
      this.ws.query('Unload ' + this.activeFile);
    });
  }
  
  stepOver() {
    if (this.activeFile === null)
      return;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0,this.activeFile.indexOf('.'));
      this.ws.query('?tp_step_over_app("' + prj + '","' + file + '")');
      return;
    }
    this.ws.query('StepOver ' + this.activeFile);
  }
  
  stepInto() {
    if (this.activeFile === null)
      return;
    this.stepMode = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0,this.activeFile.indexOf('.'));
      this.ws.query('?tp_step_in_app("' + prj + '","' + file + '")');
      return;
    }
    this.ws.query('StepIn ' + this.activeFile);
  }
  
  stepOut() {
    if (this.activeFile === null)
      return;
    this.stepMode = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0,this.activeFile.indexOf('.'));
      this.ws.query('?tp_step_out_app("' + prj + '","' + file + '")');
      return;
    }
    this.ws.query('StepOut ' + this.activeFile);
  }
  
  download() {
    if (this.activeFile === null)
      return;
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(this.editorText)
    );
    element.setAttribute('download', this.activeFile);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  refreshStatus(on : boolean) {
    this.ws.clearInterval(this.statusInterval);
    if (!on || this.activeFile === null) {
      return;
    }
    const file = this.activeFile;
    const isLib = file.endsWith('.LIB') || file.endsWith('.ULB');
    if (!isLib && !file.endsWith('.UPG') && !file.endsWith('.PRG')) {
      let tmpStatus = new ProgramStatus(null);
      tmpStatus.statusCode = TASKSTATE_NOTLOADED;
      tmpStatus.name = 'Not Loadable';
      this.status = tmpStatus;
      this.statusChange.emit(this.status);
      return;
    }
    const cmd = '?'+file+(!isLib?'.status':'.dummyVariable');
    this.oldStatString = null;
    this.statusInterval = this.ws.send(cmd,(ret:string,command:string,err:ErrorFrame)=>{
      if (ret !== this.oldStatString) {
        this.oldStatString = ret;
        this.zone.run(()=>{
          if (isLib) {
            let tmpStatus = new ProgramStatus(null);
            tmpStatus.statusCode = err.errCode === '8020' ? TASKSTATE_LIB_LOADED : TASKSTATE_NOTLOADED;
            tmpStatus.name = err.errCode === '8020' ? 'Loaded' : 'Not Loaded';
            this.status = tmpStatus;
            this.statusChange.emit(this.status);
          } else {
            this.status = new ProgramStatus(err ? null : ret);
            if (this.stepMode || this.backtrace) {
              this.getBackTrace().then((bt:Backtrace)=>{
                this.backtrace = bt;
                if (bt.files[0].name !== this.displayedFile) {
                  this.setFile(bt.files[0].name, null, null, bt);
                }
                if (this.backtrace && this.status) {
                  this.status.programLine = this.status.sourceLine;
                  this.statusChange.emit(this.status);
                }
                this.stepMode = false;
              });
            } else if (this.status.statusCode === TASKSTATE_ERROR || this.status.statusCode === TASKSTATE_STOPPED) {
              this.getBackTrace().then((bt:Backtrace)=>{
                if (bt.files[0].name === file) {
                  this.backtrace = null;
                  this.status.programLine = bt.files[0].line;
                  this.statusChange.emit(this.status);
                } else {
                  this.setFile(bt.files[0].name, null, null, bt);
                }
              });
            } else {
              this.statusChange.emit(this.status);
 
            }
          }
        });
      }
    },200);
  }
  
  insertAndJump(cmd:string, lines:number) {
    this.onInsertAndJump.emit({cmd:cmd,lines:lines});
  }
  
  getBackTrace() {
    return this.ws.query('BackTrace ' + this.activeFile).then((ret: MCQueryResponse)=>{
      return new Backtrace(ret.result);
    });
  }
  
  getCurrentLineType() {
    if (this.lineParams === null)
      return null;
    return this.lineParams['lineType'];
  }
  
  teachVariable(v: TPVariable) {
    let fullName = v.name;
    if (v.isArr)
      fullName += '[' + v.selectedIndex + ']';
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Teach' + ' ' + fullName + '?',
        msg: '',
        yes: 'TEACH',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        var cmd_teach = '?tp_teach("' + fullName + '","' + v.typeStr + '")';
        this.ws.query(cmd_teach).then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.snack.open('Success','',{duration:2000});
          } else {
            this.snack.open('Error ' + ret.result,'',{duration:2000});
          }
        });
      }
    });
  }
  
  teachVariableByName(fullName: string) {
    // search for TP Variable
    let index = fullName.indexOf('[');
    const searchName = index > -1 ? fullName.substring(0,index) : fullName;
    let varType: string = null;
    for (let v of this.data.joints.concat(this.data.locations)) {
      if (v.name === searchName) {
        varType = v.typeStr;
        break;
      }
    }
    if (varType === null) {
      return this.snack.open('Error','',{duration:2000});
    }
    const cmd_teach = '?tp_teach("' + fullName + '","' + varType + '")';
    this.ws.query(cmd_teach).then((ret:MCQueryResponse)=>{
      if (ret.result === '0') {
        this.snack.open(fullName + ': ' + 'Success!','',{duration:2000});
      } else {
        this.snack.open('Error','',{duration:2000});
      }
    });
  }
  
  getTRNERR(defaultErrorMessage:string) {
    this.api.getTRNERR().then(result=>{
      let trnerr = new TRNERR(result);
      this.errors = trnerr.errorLines;
      this.errLinesChange.emit(trnerr.errorLines);
    });
  }
}

export function getStatusString(stat:number) : string {
  switch (stat) {
    case TASKSTATE_RUNNING:
      return 'Running';
    case TASKSTATE_STOPPED:
      return 'Stopped';
    case TASKSTATE_ERROR:
      return 'Error';
    case TASKSTATE_READY:
      return 'Ready';
    case TASKSTATE_KILLED:
      return 'Killed';
    default:
      return 'UNKNOWN STATE (' + stat + ')';
  }
}

export class ProgramStatus {
  statusCode : number = null;
  sourceLine : number = null;
  programLine : number = null;
  name : string = null;
  
  constructor(status : string) {
    if (status === null) {
      this.name = 'Not Loaded';
      this.statusCode = TASKSTATE_NOTLOADED;
      return;
    }
    let index = status.indexOf(":");
    this.statusCode = Number(status.substring(6,index).trim()) % 256;
    index = status.indexOf("Source");
    status = status.substr(index+7);
    let parts = status.split(" ");
    this.sourceLine = Number(parts[0])-1;
    this.programLine = Number(parts[3])-1;
    this.name = getStatusString(this.statusCode);
  }
  
}

export class TRNERR {
  
  private _errorLines : TRNERRLine[] = [];
  
  get errorLines() {
    return this._errorLines;
  }
  
  constructor(trnerr:string) {
    let lines = trnerr.split('\n');
    for (let i in lines) {
      if (lines[i].length > 0)
        this._errorLines.push(new TRNERRLine(lines[i]));
    }
  }
  
}

export class TRNERRLine {
  
  number : number;
  file : string;
  error : string;
  
  constructor(line:string) {
    let index = line.indexOf(":");
    this.number = Number(line.substring(0,index));
    line = line.substring(index+2);
    index = line.indexOf(":");
    this.file = line.substring(0,index);
    line = line.substring(index+2);
    this.error = line;
  }
  
}