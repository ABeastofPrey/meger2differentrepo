import { Injectable, EventEmitter, ApplicationRef } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {MCFile, ApiService, UploadResult} from '../../../modules/core/services/api.service';
import {ProgramStatus, TRNERRLine, TRNERR} from '../../program-editor/services/program-editor.service';
import {WebsocketService, MCQueryResponse} from '../../../modules/core/services/websocket.service';
import {NewFileDialogComponent} from '../../../components/new-file-dialog/new-file-dialog.component';
import {YesNoDialogComponent} from '../../../components/yes-no-dialog/yes-no-dialog.component';
import {ErrorFrame} from '../../core/models/error-frame.model';

@Injectable()
export class BlocklyService {
  
  files : MCFile[] = [];
  activeFile : MCFile = null;
  onFileChange : EventEmitter<string> = new EventEmitter<string>();
  status : ProgramStatus = null;
  statusChange : EventEmitter<ProgramStatus>=new EventEmitter<ProgramStatus>();
  errLinesChange : EventEmitter<TRNERRLine[]>=new EventEmitter<TRNERRLine[]>();
  errors : string = null;
  
  get generatedText() {
    return this._generatedText;
  }
  set generatedText(val:string) {
    this._generatedText = val;
  }
  
  get BlkContent() {
    return this._BlkContent;
  }
  set BlkContent(val:string) {
    this._BlkContent = val;
  }
  
  private _BlkContent : string = null;
  private _generatedText : string = null;
  private statusInterval : any = null;
  private oldStatString : string;
  private _forceClose : boolean = false;

  constructor(
    private dialog : MatDialog,
    private ws: WebsocketService,
    private snack : MatSnackBar,
    private api : ApiService,
    private ref : ApplicationRef
  ){
    this.refreshFiles();
  }
  
  refreshFiles() {
    return this.api.getFiles('BLK').then((ret:MCFile[])=>{
      this.files = ret;
    });
  }
  
  setFile(f : MCFile) { // OPEN A FILE
    this.close().then(()=>{
      this.activeFile = f;
      this.api.getFile(f.fileName).then(ret=>{
        this.onFileChange.emit(ret);
        this.refreshStatus(true);
      });
    });
  }
  
  close(forceClose? : boolean) {
    if (forceClose)
      this._forceClose = true;
    this.refreshStatus(false);
    return this.unload().then(()=>{
      this.generatedText = null;
      this.BlkContent = null;
      this.activeFile = null;
      this.onFileChange.emit(null);
      this.status = null;
      this.errors = null;
    });
  }
  
  save() {
    if (this.activeFile === null)
      return;
    this.api.upload(
      new File([new Blob([this.BlkContent])],this.activeFile.fileName),true)
    .then((ret:UploadResult)=>{
      if (ret.success) {
        this.snack.open('Saved.','',{duration:1500});
      } else {
        this.snack.open('Error ' + ret.err,'',{duration:2000});
      }
    });
  }
  
  load() { // SAVES AND LOAD
    if (this.activeFile === null)
      return;
    this.api.upload(
      new File([new Blob([this.BlkContent])],this.activeFile.fileName),true)
    .then((ret:UploadResult)=>{
      if (ret.success) {
        this.api.upload(
          new File([new Blob([this.generatedText])],'BLOCKLY.PRG'),true)
        .then((ret:UploadResult)=>{
          if (ret.success) {
            this.ws.query('Load Blockly.PRG')
            .then((ret:MCQueryResponse)=>{
              if (ret.err && ret.err.errCode !== '6001')
                this.getTRNERR(ret.err.errMsg);
              else
                this.errors = null;
            });
          }
        }); 
      } else
        this.snack.open('Error ' + ret.err,'',{duration:2000});
    });
  }
  
  run() {
    if (this.activeFile === null)
      return;
    this.ws.query('KillTask Blockly.PRG').then(()=>{
      this.ws.query('StartTask Blockly.PRG');
    });
  }
  
  kill() {
    if (this.activeFile === null)
      return;
    this.ws.query('KillTask Blockly.PRG');
  }
  
  idle() {
    if (this.activeFile === null)
      return;
    this.ws.query('IdleTask Blockly.PRG');
  }
  
  unload() {
    return this.ws.query('KillTask Blockly.PRG').then(ret=>{
      this.ws.query('Unload Blockly.PRG').then(ret=>{
      });
    });
  }
  
  stepOver() {
    if (this.activeFile === null)
      return;
    this.ws.query('StepOver Blockly.PRG');
  }
  
  stepInto() {
    if (this.activeFile === null)
      return;
    this.ws.query('StepIn Blockly.PRG');
  }
  
  stepOut() {
    if (this.activeFile === null)
      return;
    this.ws.query('StepOut Blockly.PRG');
  }
  
  download() {
    if (this.activeFile === null)
      return;
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(this.generatedText)
    );
    element.setAttribute('download', this.activeFile.fileNameOnly+'.PRG');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  newFile() {
    let ref = this.dialog.open(NewFileDialogComponent,{
      data: {
        ext: 'BLK'
      }
    });
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
    if (!on) {
      this.ws.clearInterval(this.statusInterval);
      this.oldStatString = null;
      return;
    }
    if (this.activeFile === null)
      return;
    let cmd = '?BLOCKLY.PRG.status';
    this.statusInterval = this.ws.send(cmd,(ret:string,command:string,err:ErrorFrame)=>{
      if (this._forceClose) {
        this._forceClose = false;
        return this.refreshStatus(false);
      }
      this.oldStatString = ret;
      this.status = new ProgramStatus(err ? null : ret);
      this.statusChange.emit(this.status);
      this.ref.tick();
    },200);
  }
  
  getTRNERR(defaultErrorMessage:string) {
    this.api.getTRNERR().then(result=>{
      let trnerr = new TRNERR(result);
      let errmsg = "Errors found in the following lines:\n";
      let lines = trnerr.errorLines;
      for (let i in lines) {
        errmsg += lines[i].number + ": " + lines[i].error + "\n";
      }
      if (defaultErrorMessage && lines.length === 0)
        errmsg += defaultErrorMessage;
      this.errLinesChange.emit(trnerr.errorLines);
      this.errors = errmsg;
    });
  }

}
