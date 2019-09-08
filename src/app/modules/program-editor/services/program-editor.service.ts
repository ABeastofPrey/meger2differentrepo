import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import {
  MCFile,
  ApiService,
  UploadResult,
} from '../../../modules/core/services/api.service';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../../modules/core/services/websocket.service';
import { ProjectManagerService, DataService, TpStatService } from '../../core';
import { Backtrace } from '../../core/models/backtrace.model';
import { Subject } from 'rxjs';
import { TPVariable } from '../../core/models/tp/tp-variable.model';
import { LineParser } from '../../core/models/line-parser.model';
import { Pallet } from '../../core/models/pallet.model';
import { YesNoDialogComponent } from '../../../components/yes-no-dialog/yes-no-dialog.component';
import { ErrorFrame } from '../../core/models/error-frame.model';
import { TranslateService } from '@ngx-translate/core';

export const TASKSTATE_NOTLOADED = -1;
export const TASKSTATE_RUNNING = 1;
export const TASKSTATE_STOPPED = 2;
export const TASKSTATE_ERROR = 4;
export const TASKSTATE_TERMINATED = 5;
export const TASKSTATE_READY = 7;
export const TASKSTATE_KILLSTART = 9;
export const TASKSTATE_KILLED = 10;
export const TASKSTATE_LIB_LOADED = 11;

const endsWithBKG = (x: string) => x.endsWith('BKG');

@Injectable()
export class ProgramEditorService {
  files: MCFile[] = [];
  activeFile: string = null; // The currently opened context in the editor
  displayedFile: string = null; // The file that's actually displayed in the editor
  editorText: string = null;
  status: ProgramStatus = null;
  errors: TRNERRLine[] = [];
  editorLine: number = -1;
  isDirty: boolean = false;
  mode: string = null;
  fileRef: any = null; // A reference to the project file which is active
  backtrace: Backtrace = null; // The last backtrace
  isLib: boolean = false; // True if the active file is a library
  busy: boolean = false; // TRUE WHEN THE SERVICE IS BUSY (I.E: LOADING APP)

  // TABS
  tabs: FileTab[] = [];
  selectedTabIndex: number = 0;

  // EVENTS
  skipLineRequest: EventEmitter<number> = new EventEmitter();
  dragEnd: EventEmitter<any> = new EventEmitter();
  onReplaceRange: EventEmitter<any> = new EventEmitter();
  editorTextChange: EventEmitter<string> = new EventEmitter<string>();
  statusChange: EventEmitter<ProgramStatus> = new EventEmitter<ProgramStatus>();
  errLinesChange: EventEmitter<TRNERRLine[]> = new EventEmitter<TRNERRLine[]>();
  onInsertAndJump: EventEmitter<any> = new EventEmitter();
  onReplaceLine: EventEmitter<any> = new EventEmitter();
  onUndo: EventEmitter<any> = new EventEmitter();
  onRedo: EventEmitter<any> = new EventEmitter();
  onFind: EventEmitter<any> = new EventEmitter();
  onReplace: EventEmitter<any> = new EventEmitter();
  fileChange: Subject<string> = new Subject<string>();

  private statusInterval: any = null;
  private oldStatString: string;
  private activeFilePath: string = null;
  private _modeToggle: string = 'prj';
  private stepMode: boolean = false; // True when user clicks on STEP button

  // LINE PARSING
  parser: LineParser = new LineParser(this.data);
  variablesInLine: TPVariable[] = [];
  lineParams: any = null;
  disableStepOver: boolean = false;
  private lastRow: number = -1;

  // FLOW REMEMBERING
  lastVar: TPVariable;
  lastVarIndex: number;
  lastPallet: Pallet;
  rangeStart: number;
  rangeEnd: number;
  rangeText: string;

  // i18
  private words: any;

  constructor(
    private stat: TpStatService,
    private zone: NgZone,
    private dialog: MatDialog,
    private prj: ProjectManagerService,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private data: DataService,
    private trn: TranslateService,
    private api: ApiService
  ) {
    this.refreshFiles();
    this.ws.isConnected.subscribe(stat => {
      if (!stat) {
        this.mode = null;
        this.activeFile = null;
        this.displayedFile = null;
        this.editorText = '';
        this.editorTextChange.emit('');
        this._modeToggle = 'prj';
        this.errors = [];
        this.status = null;
        this.statusChange.emit(null);
        this.backtrace = null;
      }
    });
    const words = [
      'projects',
      'button.teach',
      'button.cancel',
      'dismiss',
      'error.err',
      'success',
    ];
    this.trn.get(words).subscribe(words => {
      this.words = words;
    });
  }
  
  getStatusString(stat: number) : string {
    const str = stat.toString();
    if (this.words)
      return this.words['projects']['status'][str] || this.words['projects']['status']['999'];
    return '';
  }

  get isSelectedBKG(): boolean {
    return endsWithBKG(this.activeFile) ? true : false;
  }

  get modeToggle() {
    return this._modeToggle;
  }
  set modeToggle(val: string) {
    this._modeToggle = val;
    this.close();
    if (val === 'mc') this.mode = 'editor';
    else this.tabs = [];
  }

  closeTab(i: number) {
    this.tabs.splice(i, 1);
    if (this.tabs[i]) {
      this.onTabChange(i);
    } else if (this.tabs[i - 1]) {
      this.onTabChange(i - 1);
    } else {
      this.close();
    }
  }

  onTabChange(i: number) {
    const tab = this.tabs[i];
    if (tab) this.setFile(tab.file, tab.path, null, -1);
  }

  setFile(f: string, path: string, ref: any, line: number, bt?: Backtrace) {
    // OPEN A FILE
    this.fileRef = ref;
    if (f === this.activeFile) return;
    this.backtrace = bt;
    this.close(bt);
    this.activeFile = f;
    this.isLib = f.endsWith('.LIB') || f.endsWith('.ULB');
    this.displayedFile = f;
    const finalPath = path || '';
    this.activeFilePath = path ? path : null;
    if (this.modeToggle === 'mc') {
      // ADD TO TABS, IF DOESN'T ALREADY THERE
      let i;
      let tabExists: boolean = false;
      for (i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].file === f) {
          tabExists = true;
          break;
        }
      }
      if (!tabExists) {
        this.tabs.push({
          file: f,
          path: finalPath,
        });
        this.selectedTabIndex = this.tabs.length - 1;
      } else {
        this.selectedTabIndex = i;
      }
    }
    if (f === 'FWCONFIG') {
      this.api.getFile(f).then(ret => {
        this.editorText = ret;
        this.editorTextChange.emit(ret);
        this.refreshStatus(false);
        const status = {
          statusCode: -2,
          name: 'SYSTEM',
          sourceLine: -1,
          programLine: -1,
        };
        this.statusChange.emit(status);
        this.status = status;
        this.isDirty = false;
        this.fileChange.next(this.activeFile);
        this.dragEnd.emit();
      });
      return;
    }
    this.api.getPathFile(finalPath + f).then((ret: string) => {
      this.editorText = ret;
      this.editorTextChange.emit(ret);
      this.refreshStatus(true);
      this.isDirty = false;
      this.fileChange.next(this.activeFile);
      this.dragEnd.emit();
      if (line > 0) {
        this.skipLineRequest.next(line);
      }
    });
  }

  skipToLine(n: number) {
    // CALLED WHEN USER WANTS TO SKIP TO A SPECIFIC LINE
    this.skipLineRequest.emit(n);
  }

  replaceRange(cmd: string) {
    this.onReplaceRange.emit(cmd);
  }
  replaceLine(index: number, cmd: string) {
    this.onReplaceLine.emit({ index: index, cmd: cmd });
  }

  onAceEditorCursorChange(rowIndex: number, row: string) {
    if (rowIndex === this.lastRow) return;
    this.lastRow = rowIndex;
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
    if (lineType === this.parser.LineType.PROGRAM) this.disableStepOver = true;
    else this.disableStepOver = false;
  }

  onAceEditorRangeChange(start: number, end: number, text: string) {
    this.variablesInLine = [];
    this.lineParams = null;
    this.rangeStart = start;
    this.rangeEnd = end;
    this.rangeText = text;
  }

  refreshFiles() {
    return this.api
      .getFiles('PRG,UPG,LIB,ULB,DAT,DEF,LOG,TXT')
      .then((ret: MCFile[]) => {
        this.files = ret;
      });
  }

  onDragEnd() {
    this.dragEnd.emit();
  }

  close(bt?: Backtrace) {
    this.refreshStatus(false);
    this.activeFile = null;
    this.displayedFile = null;
    this.editorText = null;
    this.editorTextChange.emit('');
    this.status = null;
    if (!bt) this.errors = [];
    this.editorLine = -1;
    this.isDirty = false;
  }

  save(): Promise<any> {
    if (this.activeFile === null) return Promise.resolve();
    const path = this.activeFilePath || '';
    return this.api
      .uploadToPath(
        new File([new Blob([this.editorText])], this.activeFile),
        true,
        path
      )
      .then((ret: UploadResult) => {
        if (ret.success) {
          this.snack.open(this.words['projects']['saved'], '', {
            duration: 1500,
          });
          this.isDirty = false;
        } else {
          const words = [
            'files.err_upload',
            'files.err_ext',
            'files.err_permission',
          ];
          this.trn.get(words, { name: this.activeFile }).subscribe(words => {
            switch (ret.err) {
              case -2:
                this.snack.open(
                  words['files.err_upload'],
                  this.words['dismiss']
                );
                break;
              case -3:
                this.snack.open(words['files.err_ext'], this.words['dismiss']);
                break;
              case -4:
                this.snack.open(
                  words['files.err_permission'],
                  this.words['dismiss']
                );
                break;
            }
          });
        }
      }).catch(err => {
        console.warn(err);
      });
  }

  load() {
    if (this.activeFile === null) return;
    this.busy = true;
    const path = this.activeFilePath || '';
    this.api
      .uploadToPath(
        new File([new Blob([this.editorText])], this.activeFile),
        true,
        path
      )
      .then((ret: UploadResult) => {
        if (ret.success) {
          if (this.fileRef) {
            const prj = this.prj.currProject.value.name;
            const file = this.activeFile.substring(
              0,
              this.activeFile.indexOf('.')
            );
            const cmd = '?tp_load_app("' + prj + '","' + file + '")';
            this.ws
              .query(cmd)
              .then((ret: MCQueryResponse) => {
                if (ret.result !== '0') this.getTRNERR(null);
                else this.errors = [];
                this.busy = false;
              });
            return;
          }
          this.ws
            .query('Load$ "/FFS0/SSMC/' + path + this.activeFile + '"')
            .then((ret: MCQueryResponse) => {
              if (ret.err) this.getTRNERR(ret.err.errMsg);
              else this.errors = [];
              this.busy = false;
            });
        } else {
          const words = [
            'files.err_upload',
            'files.err_ext',
            'files.err_permission',
          ];
          this.trn.get(words, { name: this.activeFile }).subscribe(words => {
            switch (ret.err) {
              case -2:
                this.snack.open(
                  words['files.err_upload'],
                  this.words['dismiss']
                );
                break;
              case -3:
                this.snack.open(words['files.err_ext'], this.words['dismiss']);
                break;
              case -4:
                this.snack.open(
                  words['files.err_permission'],
                  this.words['dismiss']
                );
                break;
            }
            this.busy = false;
          });
        }
      });
  }

  run() {
    if (this.activeFile === null) return;
    const prj = this.prj.currProject.value.name;
    const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
    if (this.fileRef) {
      this.ws.query('?tp_run_app("' + prj + '","' + file + '")');
      return;
    }
    if (endsWithBKG(this.activeFile)) {
      const cmd = `BKG_runProgram("${prj}", "${file}", ".BKG")`;
      this.ws.query(cmd);
    } else {
      this.ws.query('KillTask ' + this.activeFile).then(() => {
        const cmd = 'StartTask ' + this.activeFile;
        this.ws.query(cmd);
      });
    }
  }

  jump() {
    let prgName = this.activeFile;
    this.ws.query(
      'ContinueTask ' + prgName + ' programline = ' + this.editorLine
    );
  }

  kill() {
    if (this.activeFile === null) return;
    this.busy = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      this.ws.query('?tp_reset_app("' + prj + '","' + file + '")').then(() => {
        this.busy = false;
      });
      return;
    }
    if (endsWithBKG(this.activeFile)) {
      this.ws.query('KillTask ' + this.activeFile).then(() => {
        this.ws.query('Unload ' + this.activeFile).then((ret: MCQueryResponse) => {
          if (ret.result.length > 0) {
            this.snack.open(ret.result, '', { duration: 2000 });
          }
          this.busy = false;
        });
      });
    } else {
      this.ws.query('KillTask ' + this.activeFile).then(() => {
        this.busy = false;
      });
    }
  }

  idle() {
    if (this.activeFile === null) return;
    this.busy = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      this.ws.query('?tp_pause_app("' + prj + '","' + file + '")').then(() => {
        this.busy = false;
      });
      return;
    }
    this.ws.query('IdleTask ' + this.activeFile).then(() => {
      this.busy = false;
    });
  }

  unload() {
    if (this.activeFile === null) return;
    this.busy = true;
    this.ws.query('KillTask ' + this.activeFile).then(() => {
      this.ws.query('Unload ' + this.activeFile).then((ret: MCQueryResponse) => {
        if (ret.result.length > 0) {
          this.snack.open(ret.result, '', { duration: 2000 });
        }
        this.busy = false;
      });
    });
  }

  stepOver() {
    if (this.activeFile === null) return;
    this.busy = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      console.log('step');
      this.ws
        .query('?tp_step_over_app("' + prj + '","' + file + '")')
        .then(() => {
          console.log('step done');
          this.busy = false;
        });
      return;
    }
    this.ws.query('StepOver ' + this.activeFile).then(() => {
      this.busy = false;
    });
  }

  stepInto() {
    if (this.activeFile === null) return;
    this.busy = true;
    this.stepMode = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      this.ws
        .query('?tp_step_in_app("' + prj + '","' + file + '")')
        .then(() => {
          this.busy = false;
        });
      return;
    }
    this.ws.query('StepIn ' + this.activeFile).then(() => {
      this.busy = false;
    });
  }

  stepOut() {
    if (this.activeFile === null) return;
    this.busy = true;
    this.stepMode = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      this.ws
        .query('?tp_step_out_app("' + prj + '","' + file + '")')
        .then(() => {
          this.busy = false;
        });
      return;
    }
    this.ws.query('StepOut ' + this.activeFile).then(() => {
      this.busy = false;
    });
  }

  download() {
    if (this.activeFile === null) return;
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(this.editorText)
    );
    console.log(this.activeFile);
    element.setAttribute('download', this.activeFile);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  refreshStatus(on: boolean) {
    this.ws.clearInterval(this.statusInterval);
    if (
      !on ||
      this.activeFile === null ||
      (this.status && this.status.statusCode === -2)
    ) {
      return;
    }
    const file = this.activeFile;
    if (!this.isLib && !file.endsWith('.UPG') && !file.endsWith('.PRG') && !file.endsWith('.BKG')) {
      let tmpStatus = new ProgramStatus(null);
      tmpStatus.statusCode = TASKSTATE_NOTLOADED;
      this.status = tmpStatus;
      this.statusChange.emit(this.status);
      return;
    }
    let cmd: string;
    if (this.isLib) {
      cmd = '?' + file + '.dummyVariable';
    } else if (this.stat.onlineStatus.value) {
      // TP.LIB ONLINE
      cmd = 'cyc4,' + file;
    } else {
      cmd = '?' + file + '.status';
    }
    this.oldStatString = null;
    this.statusInterval = this.ws.send(
      cmd,
      false,
      (ret: string, command: string, err: ErrorFrame) => {
        if (ret.length === 0) {
          this.refreshStatus(false);
          return;
        }
        if (ret !== this.oldStatString) {
          this.oldStatString = ret;
          this.zone.run(() => {
            if (this.isLib) {
              let tmpStatus = new ProgramStatus(null);
              tmpStatus.statusCode =
                err.errCode === '8020'
                  ? TASKSTATE_LIB_LOADED
                  : TASKSTATE_NOTLOADED;
              this.status = tmpStatus;
              this.statusChange.emit(this.status);
            } else {
              this.status = new ProgramStatus(err ? null : ret);
              if (this.status.statusCode === TASKSTATE_NOTLOADED) {
                this.backtrace = null;
                this.errors = [];
                this.statusChange.emit(this.status);
                return;
              }
              if (this.stepMode && this.status.statusCode !== TASKSTATE_ERROR) {
                this.getBackTrace().then((bt: Backtrace) => {
                  if (bt.taskState !== TASKSTATE_ERROR) this.backtrace = bt;
                  /*if (bt.files[0].name !== this.displayedFile) {
                        this.setFile(bt.files[0].name, null, null, bt);
                      }*/
                  if (this.backtrace && this.status) {
                    this.status.programLine = this.status.sourceLine;
                    this.statusChange.emit(this.status);
                  }
                  this.stepMode = false;
                });
              } else if (
                this.status.statusCode === TASKSTATE_ERROR ||
                this.status.statusCode === TASKSTATE_STOPPED
              ) {
                this.getBackTrace().then((bt: Backtrace) => {
                  if (bt === null) return;
                  if (bt.files[0].name === file) {
                    this.backtrace = null;
                    this.status.programLine = bt.files[0].line;
                    this.statusChange.emit(this.status);
                  } else if (this.status.statusCode !== TASKSTATE_ERROR) {
                    this.backtrace = bt;
                    this.statusChange.emit(this.status);
                    //this.setFile(bt.files[0].name, null, null, bt);
                  }
                  if (this.status.statusCode === TASKSTATE_ERROR) {
                    this.ws
                      .query('?' + file + '.error')
                      .then((ret: MCQueryResponse) => {
                        const err = new ErrorFrame(ret.result);
                        this.errors = [
                          {
                            number:
                              bt.files[0].name === file
                                ? this.status.programLine
                                : -1,
                            file: bt.files[0].name,
                            error: err.errMsg,
                          },
                        ];
                        this.backtrace = bt;
                        this.statusChange.emit(this.status);
                        this.errLinesChange.emit([
                          {
                            number: this.status.programLine,
                            file: '',
                            error: '',
                          },
                        ]);
                      });
                  }
                });
              } else {
                this.backtrace = null;
                this.errors = [];
                this.statusChange.emit(this.status);
              }
            }
          });
        }
      },
      200
    );
  }

  insertAndJump(cmd: string, lines: number) {
    this.onInsertAndJump.emit({ cmd: cmd, lines: lines });
  }

  getBackTrace() {
    return this.ws
      .query('BackTrace ' + this.activeFile)
      .then((ret: MCQueryResponse) => {
        if (ret.err) return null;
        return new Backtrace(ret.result);
      });
  }

  getCurrentLineType() {
    if (this.lineParams === null) return null;
    return this.lineParams['lineType'];
  }

  teachVariable(v: TPVariable) {
    let fullName = v.name;
    if (v.isArr) fullName += '[' + v.selectedIndex + ']';
    this.trn.get('teach_var', { name: fullName }).subscribe(word => {
      this.dialog
        .open(YesNoDialogComponent, {
          data: {
            title: word,
            msg: '',
            yes: this.words['button.teach'],
            no: this.words['button.cancel'],
          },
        })
        .afterClosed()
        .subscribe(ret => {
          if (ret) {
            var cmd_teach = '?tp_teach("' + fullName + '","' + v.typeStr + '")';
            this.ws.query(cmd_teach).then((ret: MCQueryResponse) => {
              if (ret.result === '0') {
                this.getVariable(fullName).then(result=>{
                  this.snack.open(this.words['success'] + ' ( ' + result + ' )', this.words['dismiss']);
                });
              } else {
                const err = this.words['error.err'] + ' ' + ret.result;
                this.snack.open(err, '', { duration: 2000 });
              }
            });
          }
        });
    });
  }
  
  private getVariable(v: string): Promise<string> {
    const cmd = `?tp_get_value_namespace("${v}")`;
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err) return null;
      return ret.result;
    });
  }

  getTRNERR(defaultErrorMessage: string) {
    this.api.getTRNERR().then(result => {
      let trnerr = new TRNERR(result);
      this.errors = trnerr.errorLines;
      console.log(trnerr.errorLines);
      this.errLinesChange.emit(trnerr.errorLines);
    });
  }
}

export class ProgramStatus {
  
  statusCode: number = null;
  sourceLine: number = null;
  programLine: number = null;

  constructor(status: string) {
    if (status === null || status === 'No such task') {
      this.statusCode = TASKSTATE_NOTLOADED;
      return;
    }
    let index = status.indexOf(':');
    this.statusCode = Number(status.substring(6, index).trim()) % 256;
    index = status.indexOf('Source');
    status = status.substr(index + 7);
    let parts = status.split(' ');
    this.sourceLine = Number(parts[0]);
    this.programLine = Number(parts[3]);
  }
}

export class TRNERR {
  private _errorLines: TRNERRLine[] = [];

  get errorLines() {
    return this._errorLines;
  }

  constructor(trnerr: string) {
    let lines = trnerr.split('\n');
    for (let i in lines) {
      if (lines[i].length > 0) this._errorLines.push(new TRNERRLine(lines[i]));
    }
  }
}

export class TRNERRLine {
  number: number;
  file: string;
  error: string;

  constructor(line: string) {
    let index = line.indexOf(':');
    this.number = Number(line.substring(0, index));
    line = line.substring(index + 2);
    index = line.indexOf(':');
    this.file = line.substring(0, index);
    line = line.substring(index + 2);
    this.error = line;
  }
}

interface FileTab {
  file: string;
  path: string;
}
