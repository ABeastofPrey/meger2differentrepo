import { Router } from '@angular/router';
import { TourService } from 'ngx-tour-md-menu';
import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MCFile,
  ApiService,
  UploadResult,
} from '../../../modules/core/services/api.service';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../../modules/core/services/websocket.service';
import { Backtrace } from '../../core/models/backtrace.model';
import { Subject, BehaviorSubject } from 'rxjs';
import { TPVariable } from '../../core/models/tp/tp-variable.model';
import { LineParser } from '../../core/models/line-parser.model';
import { Pallet } from '../../core/models/pallet.model';
import { YesNoDialogComponent } from '../../../components/yes-no-dialog/yes-no-dialog.component';
import { ErrorFrame } from '../../core/models/error-frame.model';
import { TranslateService } from '@ngx-translate/core';
import { App } from '../../core/models/project/mc-project.model';
import { UtilsService } from '../../core/services/utils.service';
import { TpStatService } from '../../core/services/tp-stat.service';
import { ProjectManagerService } from '../../core/services/project-manager.service';
import { DataService } from '../../core/services/data.service';
import { FwTranslatorService } from '../../core/services/fw-translator.service';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';

export const TASKSTATE_NOTLOADED = -1;
export const TASKSTATE_RUNNING = 1;
export const TASKSTATE_STOPPED = 2;
export const TASKSTATE_ERROR = 4;
export const TASKSTATE_TERMINATED = 5;
export const TASKSTATE_READY = 7;
export const TASKSTATE_KILLSTART = 9;
export const TASKSTATE_KILLED = 10;
export const TASKSTATE_INTERRUPTED = 11;
export const TASKSTATE_LIB_LOADED = 99;

const endsWithBKG = (x: string) => x && x.endsWith('BKG');

@Injectable({
  providedIn: 'root'
})
export class ProgramEditorService {

  files: MCFile[] = [];
  activeFile: string = null; // The currently opened context in the editor
  activeFilePath: string = null;
  displayedFile: string = null; // The file that's actually displayed in the editor
  editorText: string = null;
  status: ProgramStatus = null;
  errors: TRNERRLine[] = [];
  editorLine = -1;
  isDirty = false;
  fileRef: App = null; // A reference to the project file which is active
  backtrace: Backtrace = null; // The last backtrace
  isLib = false; // True if the active file is a library
  busy = false; // TRUE WHEN THE SERVICE IS BUSY (I.E: LOADING APP)

  private _mode: string = null;

  get mode() {
    return this._mode;
  }

  set mode(m: string) {
    this._mode = m;
  }

  // TABS
  tabs: FileTab[] = [];
  selectedTabIndex = 0;

  // LINE REMEMBER (FOR PRJ MODE)
  lineHistory: Array<number> = [];

  // EVENTS
  skipLineRequest: EventEmitter<number> = new EventEmitter();
  dragEnd: EventEmitter<void> = new EventEmitter();
  onReplaceRange: EventEmitter<string> = new EventEmitter();
  editorTextChange: EventEmitter<string> = new EventEmitter<string>();
  statusChange: BehaviorSubject<ProgramStatus> = new BehaviorSubject(null);
  errLinesChange: EventEmitter<TRNERRLine[]> = new EventEmitter<TRNERRLine[]>();
  onInsertAndJump: EventEmitter<{ cmd: string, lines: number }> = new EventEmitter();
  onReplaceLine: EventEmitter<{ index: number, cmd: string }> = new EventEmitter();
  onUndo: EventEmitter<void> = new EventEmitter();
  onRedo: EventEmitter<void> = new EventEmitter();
  onFind: EventEmitter<void> = new EventEmitter();
  onReplace: EventEmitter<void> = new EventEmitter();
  fileChange: Subject<string> = new Subject<string>();

  private statusInterval: number = null;
  private oldStatString: string;
  private _modeToggle = 'prj';
  private stepMode = false; // True when user clicks on STEP button

  wizardMode = false;

  // LINE PARSING
  parser: LineParser = new LineParser(this.data);
  variablesInLine: TPVariable[] = [];
  lineParams: any = null;
  disableStepOver = false;
  private lastRow = -1;

  // FLOW REMEMBERING
  lastVar: TPVariable;
  lastVarIndex: number;
  lastPallet: Pallet;
  rangeStart: number;
  rangeEnd: number;
  rangeText: string;

  // i18
  private words: {};

  constructor(
    private stat: TpStatService,
    private zone: NgZone,
    private dialog: MatDialog,
    private prj: ProjectManagerService,
    private ws: WebsocketService,
    private snackbarService: SysLogSnackBarService,
    private data: DataService,
    private trn: TranslateService,
    private api: ApiService,
    private tour: TourService,
    private fw: FwTranslatorService,
    private router: Router
  ) {
    this.tour.stepShow$.subscribe(step=>{
      if ((
          step === this.tour.steps[3] ||
          step === this.tour.steps[4] ||
          step === this.tour.steps[5] ||
          step === this.tour.steps[6]
          ) &&
          this.status && this.status.statusCode !== TASKSTATE_NOTLOADED
      ) {
        this.kill();
      }
    });
    this.api.ready.subscribe(stat=>{
      if (stat) {
        this.refreshFiles();
      }
    });
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
        this.statusChange.next(null);
        this.backtrace = null;
        this.busy = false;
        this.lineHistory = [];
        this.tabs = [];
        this.selectedTabIndex = 0;
      }
    });
    const words = [
      'projects',
      'button.teach',
      'button.cancel',
      'dismiss',
      'error.err',
      'error.not_enough_space',
      'success',
      'button.save',
      'button.discard',
      'projectTree.dirty'
    ];
    this.trn.get(words).subscribe(words => {
      this.words = words;
    });
    this.stat.onlineStatus.subscribe(stat=>{
      if (!stat && this.activeFile && (this.activeFile.endsWith('UPG') || this.activeFile.endsWith('ULB'))) {
        this.close();
      }
    });
  }

  showFwconfigEditor() {
    this.mode = 'fwconfig';
    this.router.navigateByUrl('/projects/' + this.mode);
  }

  get isSelectedBKG(): boolean {
    return endsWithBKG(this.activeFile) ? true : false;
  }

  get modeToggle() {
    return this._modeToggle;
  }
  set modeToggle(val: string) {
    if (this._modeToggle === val) return;
    this.backtrace = null;
    this._modeToggle = val;
    this.close();
    this.fileRef = null;
    if (val === 'mc') {
      this.mode = 'editor';
      this.router.navigateByUrl('/projects');
      // open selected tab
      const tab = this.tabs[this.selectedTabIndex];
      if (!tab) return;
      this.setFile(tab.file,tab.path,null,tab.line, this.backtrace);
    } else {
      this.router.navigateByUrl('/projects');
    }
  }
  refreshModeToggle() {
    const old = this._modeToggle;
    this._modeToggle = null;
    setTimeout(()=>{
      this._modeToggle = old;
    });
  }

  async setModeToggle(val: string) {
    if (this._modeToggle === val) return;
    this.backtrace = null;
    this._modeToggle = val;
    this.close();
    if (val === 'mc') {
      // go to editor mode
      this.mode = 'editor';
      await this.router.navigateByUrl('/projects');
      // open selected tab
      const tab = this.tabs[this.selectedTabIndex];
      if (!tab) return;
      await this.setFile(tab.file,tab.path,null,tab.line);
    } else {
      await this.router.navigateByUrl('/projects');
    }
  }
  
  setDebugMode(on: boolean) {
    if (on) {
      this.close();
    }
  }

  closeTab(i: number, force?: boolean) {
    if (!force && this.isDirty && this.activeFile) {
      this.trn.get('projectTree.dirty_msg', { name: this.activeFile }).subscribe(word => {
        this.dialog.open(YesNoDialogComponent, {
          data: {
            title: this.words['projectTree.dirty'],
            msg: word,
            yes: this.words['button.save'],
            no: this.words['button.discard'],
          },
          width: '500px',
        }).afterClosed().subscribe(ret => {
          if (ret) {
            this.save().then(() => {
              this.closeTab(i);
            });
          } else {
            this.isDirty = false;
            this.closeTab(i);
          }
        });
      });
      return;
    }
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
    this.selectedTabIndex = i;
    if (this.isDirty && this.activeFile) {
      this.trn.get('projectTree.dirty_msg', { name: this.activeFile }).subscribe(word => {
        this.dialog.open(YesNoDialogComponent, {
          data: {
            title: this.words['projectTree.dirty'],
            msg: word,
            yes: this.words['button.save'],
            no: this.words['button.discard'],
          },
          width: '500px',
        }).afterClosed().subscribe(ret => {
          if (ret) {
            this.save().then(() => {
              this.onTabChange(i);
            });
          } else {
            this.isDirty = false;
            this.onTabChange(i);
          }
        });
      });
      return;
    }
    const tab = this.tabs[i];
    if (tab) {
      this.setFile(tab.file, tab.path, null, tab.line, this.backtrace);
    }
  }

  setFile(f: string, path: string, ref: App, line: number, bt?: Backtrace) {
    // OPEN A FILE
    this.fileRef = ref;
    this.backtrace = bt;
    if (f === this.activeFile && path === this.activeFilePath) return;
    const tab = this.tabs[this.selectedTabIndex];
    if (this._modeToggle === 'mc' && tab && tab.file === f && tab.path === this.activeFilePath && f === this.activeFile) return;
    this.busy = true;
    if (line === -1 && this._modeToggle === 'prj') {
      const l = this.lineHistory[f];
      if (!isNaN(l)) {
        line = l;
      }
    }
    this.close(bt);
    this.activeFile = f;
    this.isLib = f.endsWith('.LIB') || f.endsWith('.ULB');
    this.displayedFile = f;
    const finalPath = path || '';
    this.activeFilePath = path ? path : null;
    if (this.modeToggle === 'mc') {
      // ADD TO TABS, IF DOESN'T ALREADY THERE
      let i;
      let tabExists = false;
      for (i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].file === f && this.tabs[i].path === finalPath) {
          tabExists = true;
          break;
        }
      }
      if (!tabExists) {
        this.tabs.push({
          file: f,
          path: finalPath,
          line: line || -1
        });
        this.selectedTabIndex = this.tabs.length - 1;
      } else {
        this.selectedTabIndex = i;
      }
    }
    if (f === 'FWCONFIG') {
      return this.api.getFile(f).then(ret => {
        this.editorText = ret;
        this.editorTextChange.emit(ret);
        this.refreshStatus(false);
        const status = {
          statusCode: -2,
          name: 'SYSTEM',
          sourceLine: -1,
          programLine: -1,
        };
        this.statusChange.next(status);
        this.status = status;
        this.isDirty = false;
        this.fileChange.next(this.activeFile);
        this.dragEnd.emit();
        this.busy = false;
      });
    }
    return this.api.getPathFile(finalPath + f).then((ret: string) => {
      this.editorText = ret;
      this.editorTextChange.emit(ret);
      this.refreshStatus(true);
      this.isDirty = false;
      this.fileChange.next(this.activeFile);
      this.dragEnd.emit();
      this.skipLineRequest.next(line);
      this.busy = false;
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
    this.onReplaceLine.emit({ index, cmd });
  }

  onAceEditorCursorChange(rowIndex: number, row: string) {
    if (rowIndex === this.lastRow) return;
    this.lastRow = rowIndex;
    this.rangeStart = NaN;
    this.rangeEnd = NaN;
    this.rangeText = null;
    const lineType = this.parser.getLineType(row);
    if (
      lineType === this.parser.LineType.MOVE ||
      lineType === this.parser.LineType.CIRCLE || 
      lineType === this.parser.LineType.JUMP
    ) {
      this.variablesInLine = this.parser.getVariablesFromLine(row);
      this.lineParams = this.parser.getLineParameters(row, lineType, rowIndex);
    } else {
      this.variablesInLine = [];
      this.lineParams = null;
    }
    if (lineType === this.parser.LineType.PROGRAM) this.disableStepOver = true;
    else this.disableStepOver = false;
    if (this._modeToggle === 'mc' && this.tabs[this.selectedTabIndex]) {
      this.tabs[this.selectedTabIndex].line = rowIndex + 1;
    } else if (this._modeToggle === 'prj') {
      this.lineHistory[this.activeFile] = rowIndex + 1;
    }
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
    this.activeFilePath = null;
    this.displayedFile = null;
    this.editorText = null;
    // this.editorTextChange.emit('');
    this.status = null;
    this.statusChange.next(null);
    if (!bt) this.errors = [];
    this.editorLine = -1;
    this.isDirty = false;
    this.backtrace = bt;
    //this.fileRef = null;
  }

  save() {
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
          this.isDirty = false;
          this.snackbarService.openTipSnackBar('projects.saved');
        } else {
          const words = [
            'files.err_upload',
            'files.err_ext',
            'files.err_permission',
          ];
          this.trn.get(words, { name: this.activeFile }).subscribe(words => {
            switch (ret.err) {
              default:
                break;
              case -2:
                //   this.snack.open(
                //     words['files.err_upload'],
                //     this.words['dismiss']
                //   ); 
                  this.snackbarService.openTipSnackBar("files.err_upload");              
                break;
              case -3:
                //   this.snack.open(words['files.err_ext'], this.words['dismiss']);   
                  this.snackbarService.openTipSnackBar("files.err_ext");                  
                break;
              case -4:
                //   this.snack.open(
                //     words['files.err_permission'],
                //     this.words['dismiss']
                //   );
                  this.snackbarService.openTipSnackBar("files.err_permission");             
                break;
              case -99:
                // this.snack.open(this.words['err.not_enough_space'],this.words['dismiss']);
                this.snackbarService.openTipSnackBar('err.not_enough_space');   
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
    this.api.uploadToPath(new File([new Blob([this.editorText])], this.activeFile), true, path).then((ret: UploadResult) => {
      if (ret.success) {
        this.isDirty = false;
        this.snackbarService.openTipSnackBar('projects.saved');
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
        const isUserTask = this.activeFile.endsWith('UPG');
        const priorityStr = isUserTask ? ' priority=15' : '';
        if (endsWithBKG(this.activeFile)) {
          const pathCmd = `/FFS0/SSMC/${path}${this.activeFile}`
          const cmd = `BKG_load("${pathCmd}")`
          this.ws.query(cmd).then((ret: MCQueryResponse) => {
            const err = ret.err ? ret.err.find(e=>e.errType === 'ERROR') : null;
            if (err) {
              this.getTRNERR(err.errMsg);
            } else {
              this.errors = [];
            }
            this.busy = false;
          });
        } else {
          const cmd = `Load$ "/FFS0/SSMC/${path}${this.activeFile}"` + priorityStr;
          this.ws.query(cmd).then((ret: MCQueryResponse) => {
            if (ret.result !== '0') {
              this.getTRNERR(null);
            } else {
              this.errors = [];
            }
            this.busy = false;
          });
        }
      } else {
        const words = [
          'files.err_upload',
          'files.err_ext',
          'files.err_permission',
        ];
        this.trn.get(words, { name: this.activeFile }).subscribe(words => {
          switch (ret.err) {
            default:
              break;
            case -2:
              this.snackbarService.openTipSnackBar("files.err_upload");
              break;
            case -3:
              this.snackbarService.openTipSnackBar("files.err_ext");           
              break;
            case -4:
              this.snackbarService.openTipSnackBar("files.err_permission"); 
              break;
            case -99:
              this.snackbarService.openTipSnackBar('err.not_enough_space'); 
              break;
          }
          this.busy = false;
        });
      }
    }).catch(err=>{
      this.busy = false;
      console.warn(err);
    });
  }

  run() {
    if (this.activeFile === null) return;
    if (this.fileRef) {
      const prj = this.prj.currProject.value;
      const prjName = prj ? prj.name : null;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      this.ws.query('?tp_run_app("' + prjName + '","' + file + '")');
      return;
    }
    if (endsWithBKG(this.activeFile)) {
      const prj = this.prj.currProject.value;
      const prjName = prj ? prj.name : null;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      const cmd = `BKG_runProgram("${prjName}", "${file}", ".BKG")`;
      this.ws.query(cmd);
    } else {
      this.ws.query('KillTask ' + this.activeFile).then(() => {
        const cmd = 'StartTask ' + this.activeFile;
        this.ws.query(cmd);
      });
    }
  }

  jump() {
    if (this.fileRef) {
      const app = this.fileRef.name;
      const cmd = `?tp_jump_to_line("${app}", ${this.editorLine})`;
      this.ws.query(cmd); 
    } else {
      const prgName = this.activeFile;
      this.ws.query('ContinueTask ' + prgName + ' programline = ' + this.editorLine);
    }
  }

  kill() {
    if (this.activeFile === null) return;
    this.busy = true;
    if (this.fileRef) {
      const prj = this.prj.currProject.value.name;
      const file = this.activeFile.substring(0, this.activeFile.indexOf('.'));
      this.ws.query('?tp_reset_app("' + prj + '","' + file + '")').then(ret => {
        this.busy = false;
      });
      return;
    }
    if (endsWithBKG(this.activeFile)) {
      this.ws.query(`BKG_ktas("${this.activeFile}")`).then(() => {
        this.ws.query(`BKG_unload("${this.activeFile}")`).then((ret: MCQueryResponse) => {
          if (ret.result.length > 0) {
            this.snackbarService.openTipSnackBar(ret.result); 
          }
          this.busy = false;
        });
      });
    } else {
      this.ws.query('KillTask ' + this.activeFile).then(ret => {
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

    if (endsWithBKG(this.activeFile)) {
        this.ws.query(`BKG_idletask("${this.activeFile}")`).then(() => {
            this.busy = false;
        });
    }else {
        this.ws.query('IdleTask ' + this.activeFile).then(() => {
            this.busy = false;
        });
    }
  }

  unload(force?: boolean) {
    const f = this.activeFile;
    if (!f) return;
    this.busy = true;
    return this.ws.query('KillTask ' + f).then(() => {
      return this.ws.query('Unload ' + f).then((ret: MCQueryResponse) => {
        if (!force && ret.result.length > 0) {
         
            // this.snack.open(ret.result, '', { duration: 2000 });
            this.snackbarService.openTipSnackBar(ret.result); 
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
      this.ws
        .query('?tp_step_over_app("' + prj + '","' + file + '")')
        .then(() => {
          this.busy = false;
        });
      return;
    }
    
    if (endsWithBKG(this.activeFile)) {
        this.ws.query(`BKG_stepover("${this.activeFile}")`).then((ret: MCQueryResponse) => {
            this.busy = false;
        });
    } else {
    this.ws.query('StepOver ' + this.activeFile).then(() => {
        this.busy = false;
        });
    }
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
    if (endsWithBKG(this.activeFile)) {
        this.ws.query(`BKG_stepin("${this.activeFile}")`).then((ret: MCQueryResponse) => {
            this.busy = false;
        });
    } else {
        this.ws.query('StepIn ' + this.activeFile).then(() => {
            this.busy = false;
        });
    }
    
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
    if (endsWithBKG(this.activeFile)) {
        this.ws.query(`BKG_stepout("${this.activeFile}")`).then((ret: MCQueryResponse) => {
            this.busy = false;
        });
    } else {
        this.ws.query('StepOut ' + this.activeFile).then(() => {
            this.busy = false;
        });
    }
  }

  download() {
    if (this.activeFile === null) return;
    const element = document.createElement('a');
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

  refreshStatus(on: boolean) {
    this.ws.clearInterval(this.statusInterval);
    if (
      !on || this.activeFile === null ||
      (this.status && this.status.statusCode === -2)
    ) {
      return;
    }
    this.status = null;
    const file = this.activeFile;
    if (!this.isLib && !file.endsWith('.UPG') && !file.endsWith('.PRG') && !file.endsWith('.BKG')) {
      const tmpStatus = new ProgramStatus(null);
      tmpStatus.statusCode = TASKSTATE_NOTLOADED;
      this.status = tmpStatus;
      this.statusChange.next(this.status);
      return;
    }
    let cmd: string;
    if (this.stat.onlineStatus.value) {
      // TP.LIB ONLINE
      cmd = 'cyc4,' + file;
    } else {
      cmd = '?' + file + '.status';
    }
    this.oldStatString = null;
    this.statusInterval = this.ws.send(
      cmd,
      false,
      (ret: string, command: string, err: ErrorFrame[]) => {
        if (ret.length === 0) {
          console.log(cmd + ' RETURNED BLANK RESULT');
          this.refreshStatus(false);
          return;
        }
        const original = ret;
        const i = ret.indexOf('uuid');
        if (i>0) {
          ret = ret.substring(0,i).trim();
        }
        if (ret !== this.oldStatString) {
          this.oldStatString = ret;
          this.zone.run(() => {
            if (this.isLib) {
              const tmpStatus = new ProgramStatus(err ? null : original);
              tmpStatus.programLine = null;
              tmpStatus.sourceLine = null;
              tmpStatus.statusCode = tmpStatus.statusCode === TASKSTATE_READY ? TASKSTATE_LIB_LOADED : TASKSTATE_NOTLOADED;
              this.status = tmpStatus;
              this.statusChange.next(this.status);
            } else {
              const newStatus = new ProgramStatus(err ? null : original);
              this.status = newStatus;
              if (this.status.statusCode === TASKSTATE_NOTLOADED) {
                this.backtrace = null;
                this.errors = [];
                this.statusChange.next(this.status);
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
                    this.statusChange.next(this.status);
                  }
                  this.stepMode = false;
                });
              } else if (
                this.status.statusCode === TASKSTATE_ERROR ||
                this.status.statusCode === TASKSTATE_STOPPED
              ) {
                this.getBackTrace().then((bt: Backtrace) => {
                  if (bt === null || this.status === null) return;
                  if (bt.files[0].name === file) {
                    this.backtrace = null;
                    this.status.programLine = bt.files[0].line;
                    this.statusChange.next(this.status);
                  } else if (this.status.statusCode !== TASKSTATE_ERROR) {
                    this.backtrace = bt;
                    this.statusChange.next(this.status);
                    //this.setFile(bt.files[0].name, null, null, bt);
                  }
                  if (this.status.statusCode === TASKSTATE_ERROR) {
                    this.ws
                      .query('?' + file + '.error')
                      .then((ret: MCQueryResponse) => {
                        const err = new ErrorFrame(ret.result);
                        if (this.trn.currentLang !== 'en') {
                          err.errMsg = this.fw.getTranslation(Number(err.errCode),err.errMsg);
                        }
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
                        this.statusChange.next(this.status);
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
                this.statusChange.next(this.status);
              }
            }
          });
        }
      },
      200
    );
  }

  insertAndJump(cmd: string, lines: number) {
    this.onInsertAndJump.emit({ cmd, lines });
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
            const cmdTeach = '?tp_teach("' + fullName + '","' + v.typeStr + '")';
            this.ws.query(cmdTeach).then(ret => {
              if (ret.result === '0') {
                this.getVariable(fullName).then(result=>{
                //   this.snack.open(this.words['success'] + ' ( ' + result + ' )', this.words['dismiss']);
                  this.snackbarService.openTipSnackBar("success"); 
                });
              } else {
                const err = this.words['error.err'] + ' ' + ret.result;
               
                //   this.snack.open(err, '', { duration: 2000 });
                  this.snackbarService.openTipSnackBar(err);
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
      const trnerr = new TRNERR(result);
      this.errors = trnerr.errorLines;
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
    const parts = status.split(' ');
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
    const lines = trnerr.split('\n');
    for (const i in lines) {
      if (lines[i].length > 0) {
        const err = new TRNERRLine(lines[i]);
        if (this._errorLines.some(e=>{
          return e.number === err.number;
        })) {
          continue;
        }
        this._errorLines.push(err);
      }
    }
    this._errorLines.sort((e1,e2)=>{
      return e1.number > e2.number ? 1 : -1;
    });
  }
}

export class TRNERRLine {

  number: number;
  file: string;
  error: string;
  type?: string;

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
  line: number;
}