import { Injectable, EventEmitter, ApplicationRef } from '@angular/core';
import {MatSnackBar, MatDialog} from '@angular/material';
import {MCFile, ApiService, UploadResult} from '../../../modules/core/services/api.service';
import {WebsocketService, MCQueryResponse, ErrorFrame} from '../../../modules/core/services/websocket.service';
import {NewFileDialogComponent} from '../../../components/new-file-dialog/new-file-dialog.component';
import {YesNoDialogComponent} from '../../../components/yes-no-dialog/yes-no-dialog.component';

export const TASKSTATE_NOTLOADED = -1;
export const TASKSTATE_RUNNING = 1;
export const TASKSTATE_STOPPED = 2;
export const TASKSTATE_ERROR = 4;
export const TASKSTATE_TERMINATED = 5;
export const TASKSTATE_READY = 7;
export const TASKSTATE_KILLSTART = 9;
export const TASKSTATE_KILLED = 10;

@Injectable()
export class ProgramEditorService {
  
  files : MCFile[] = [];
  activeFile : MCFile = null;
  editorText : string = null;
  editorTextChange : EventEmitter<string> = new EventEmitter<string>();
  status : ProgramStatus = null;
  statusChange : EventEmitter<ProgramStatus>=new EventEmitter<ProgramStatus>();
  errLinesChange : EventEmitter<TRNERRLine[]>=new EventEmitter<TRNERRLine[]>();
  errors : TRNERRLine[] = [];
  editorLine : number = -1;
  skipLineRequest : EventEmitter<number>=new EventEmitter();
  dragEnd : EventEmitter<any>=new EventEmitter();
  
  private statusInterval : any = null;
  private oldStatString : string;
  
  constructor(
    private ref : ApplicationRef,
    private dialog : MatDialog,
    private ws: WebsocketService,
    private snack : MatSnackBar,
    private api : ApiService) {
    this.refreshFiles();
  }

  setFile(f : MCFile) { // OPEN A FILE
    this.close();
    this.activeFile = f;
    this.api.getFile(f.fileName).then(ret=>{
      this.editorText = ret;
      this.editorTextChange.emit(ret);
      this.refreshStatus(true);
    });
  }
  
  skipToLine(n:number) { // CALLED WHEN USER WANTS TO SKIP TO A SPECIFIC LINE
    this.skipLineRequest.emit(n);
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
    this.editorText = null;
    this.editorTextChange.emit(null);
    this.status = null;
    this.errors = [];
    this.editorLine = -1;
  }
  
  save() {
    if (this.activeFile === null)
      return;
    this.api.upload(
      new File([new Blob([this.editorText])],this.activeFile.fileName),true)
    .then((ret:UploadResult)=>{
      if (ret.success)
        this.snack.open('Saved.','',{duration:1500});
      else
        this.snack.open('Error ' + ret.err,'',{duration:2000});
    });
  }
  
  load() { // SAVES AND LOAD
    if (this.activeFile === null)
      return;
    this.api.upload(
      new File([new Blob([this.editorText])],this.activeFile.fileName),true)
    .then((ret:UploadResult)=>{
      if (ret.success) {
        this.ws.query('Load ' + this.activeFile.fileName)
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
    this.ws.query('KillTask ' + this.activeFile.fileName).then(()=>{
      this.ws.query('StartTask ' + this.activeFile.fileName);
    });
  }
  
  jump() {
    let prgName = this.activeFile.fileName;
    this.ws.query('ContinueTask '+prgName+' programline = ' + this.editorLine);
  }
  
  kill() {
    if (this.activeFile === null)
      return;
    this.ws.query('KillTask ' + this.activeFile.fileName);
  }
  
  idle() {
    if (this.activeFile === null)
      return;
    this.ws.query('IdleTask ' + this.activeFile.fileName);
  }
  
  unload() {
    if (this.activeFile === null)
      return;
    this.ws.query('KillTask ' + this.activeFile.fileName).then(()=>{
      this.ws.query('Unload ' + this.activeFile.fileName);
    });
  }
  
  stepOver() {
    if (this.activeFile === null)
      return;
    this.ws.query('StepOver ' + this.activeFile.fileName);
  }
  
  stepInto() {
    if (this.activeFile === null)
      return;
    this.ws.query('StepIn ' + this.activeFile.fileName);
  }
  
  stepOut() {
    if (this.activeFile === null)
      return;
    this.ws.query('StepOut ' + this.activeFile.fileName);
  }
  
  download() {
    if (this.activeFile === null)
      return;
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(this.editorText)
    );
    element.setAttribute('download', this.activeFile.fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  newFile() {
    let ref = this.dialog.open(NewFileDialogComponent);
    ref.afterClosed().subscribe((fileName:string)=>{
      if (fileName) {
        this.api.upload(new File([new Blob([''])], fileName), false)
        .then((ret: UploadResult)=>{
          if (ret.success) {
            this.refreshFiles().then(()=>{
              for (let f of this.files) {
                if (f.fileName === fileName)
                  return this.setFile(f);
              }
            });
          } else if (ret.err === -1) {
            let ref = this.dialog.open(YesNoDialogComponent,{
              data: {
                yes: 'OVERWRITE',
                no: 'CANCEL',
                title: 'File Already Exists',
                msg: 'Would you like to OVERWRITE the existing file?'
              }
            });
            ref.afterClosed().subscribe(ret=>{
              if (ret) {
                this.api.upload(new File([new Blob([''])], fileName), true)
                .then((ret: UploadResult)=>{
                  if (ret.success) {
                    this.refreshFiles().then(()=>{
                      for (let f of this.files) {
                        if (f.fileName === fileName)
                          return this.setFile(f);
                      }
                    });
                  } else
                    this.snack.open('Error uploading file','DISMISS',{duration: 3000});
                });
              }
            });
          } else {
            this.snack.open('Error uploading file','DISMISS',{duration: 3000});
          }
        });
      }
    });
  }
  
  
  refreshStatus(on : boolean) {
    if (!on)
      return this.ws.clearInterval(this.statusInterval);
    if (this.activeFile === null)
      return;
    let cmd = '?'+this.activeFile.fileName+'.status';
    this.oldStatString = null;
    this.statusInterval = this.ws.send(cmd,(ret:string,command:string,err:ErrorFrame)=>{
      if (ret !== this.oldStatString) {
        this.oldStatString = ret;
        this.status = new ProgramStatus(err ? null : ret);
        this.statusChange.emit(this.status);
        this.ref.tick();
      }
    },200);
  }
  
  getTRNERR(defaultErrorMessage:string) {
    this.api.getTRNERR().then(result=>{
      let trnerr = new TRNERR(result);
      this.errors = trnerr.errorLines;
      this.errLinesChange.emit(trnerr.errorLines);
    });
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
    this.statusCode = Number(status.substring(6,index).trim());
    index = status.indexOf("Source");
    status = status.substr(index+7);
    let parts = status.split(" ");
    this.sourceLine = Number(parts[0])-1;
    this.programLine = Number(parts[3])-1;
    switch (this.statusCode) {
      case TASKSTATE_RUNNING:
        this.name = 'Running';
        break;
      case TASKSTATE_STOPPED:
        this.name = 'Stopped';
        break;
      case TASKSTATE_ERROR:
        this.name = 'Error';
        break;
      case TASKSTATE_READY:
        this.name = 'Ready';
        break;
      case TASKSTATE_KILLED:
        this.name = 'Killed';
        break;
      default:
        this.name = 'UNKNOWN STATE (' + this.statusCode + ')';
        break;
    }
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