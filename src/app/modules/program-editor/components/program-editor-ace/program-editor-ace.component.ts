import { TASKSTATE_READY } from './../../services/program-editor.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ProgramEditorService,
  ProgramStatus,
  TASKSTATE_NOTLOADED,
  TASKSTATE_RUNNING,
  TASKSTATE_KILLED,
} from '../../services/program-editor.service';
import { ApiService } from '../../../../modules/core/services/api.service';
import { GroupManagerService } from '../../../../modules/core/services/group-manager.service';
import { Subject } from 'rxjs';
import {
  DataService,
  TaskService,
  MCFile,
  ProjectManagerService,
  WebsocketService,
  MCQueryResponse,
  KeywordService,
  LoginService,
} from '../../../core';
import { MatSnackBar, MatInput } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../core/services/common.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { environment } from '../../../../../environments/environment';
import { UtilsService } from '../../../core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';
declare var ace;

const isBKGFile = (fileName: string): boolean => fileName.split('.').pop().toUpperCase() === 'BKG';

@Component({
  selector: 'program-editor-ace',
  templateUrl: './program-editor-ace.component.html',
  styleUrls: ['./program-editor-ace.component.css'],
})
export class ProgramEditorAceComponent implements OnInit {
  @ViewChild('ace', { static: false }) editorDiv: ElementRef;
  // tslint:disable-next-line: no-any
  private editor: any;
  private Range = ace.require('ace/range').Range;
  // tslint:disable-next-line: no-any
  private currRange: any;
  // tslint:disable-next-line: no-any
  private currHoverRange: any;
  private currFuncRow = -1;
  // tslint:disable-next-line: no-any
  private markers: any[] = [];
  private commands: Command[];
  private words: {};
  private notifier: Subject<boolean> = new Subject();

  // HANDLE MOUSE HOVER TOOLTIPS
  private tooltipTimeout: number;
  lastWord: string;
  tooltipValue: string;
  tooltipVisible = false;
  tooltipX: number;
  tooltipY: number;

  env = environment;

  private TokenIterator = ace.require('ace/token_iterator').TokenIterator;

  constructor(
    public service: ProgramEditorService,
    private api: ApiService,
    private groups: GroupManagerService,
    private zone: NgZone,
    private data: DataService,
    private task: TaskService,
    private prj: ProjectManagerService,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private trn: TranslateService,
    private keywords: KeywordService,
    public login: LoginService,
    public cmn: CommonService,
    private utils: UtilsService,
    private cd: ChangeDetectorRef
  ) {
    this.trn.get(['projects.ace', 'dismiss']).subscribe(words => {
      this.words = words;
    });
  }

  ngOnInit() {
    this.task.start();
    this.service.refreshStatus(true);
    this.service.editorTextChange
      .pipe(takeUntil(this.notifier))
      .subscribe(text => {
        if (text === null) return;
        this.removeAllMarkers();
        if (this.editor) {
          this.editor.setValue(text || '', -1);
          if (this.service.activeFile === null) {
            this.editor.setReadOnly(true);
            this.cd.detectChanges();
          } else {
            this.editor.getSession().setUndoManager(new ace.UndoManager());
          }
          setTimeout(() => {
            if (this.editor) {
              this.editor.resize();
            }
          }, 1000);
        }
      });
    this.service.statusChange
      .pipe(takeUntil(this.notifier))
      .subscribe((stat: ProgramStatus) => {
        if (!this.editor) return;
        if (this.service.errors.length === 0 || this.service.backtrace === null) {
          this.removeAllMarkers();
        }
        this.editor.setReadOnly(
          stat === null ||
            (stat.statusCode > -1 && !this.service.activeFile.endsWith('LIB')) ||
            this.login.isOperator ||
            this.login.isViewer ||
            this.cmn.isTablet
        );
        this.cd.detectChanges();
        if (
          stat &&
          stat.programLine > 0 &&
          stat.statusCode !== TASKSTATE_KILLED
        ) {
          this.highlightLine(stat.programLine);
          if (stat.statusCode !== TASKSTATE_RUNNING) {
            this.editor.scrollToLine(stat.programLine, true, true, null);
          }
        }
        if (stat && stat.statusCode === TASKSTATE_NOTLOADED) {
          this.setBreakpoints('');
        } else if (stat && stat.statusCode === TASKSTATE_READY) {
          if (this.service.modeToggle === 'mc') return;
          const fileName = this.service.activeFile;
          const app = fileName.substring(0, fileName.indexOf('.'));
          const prjAndApp =
            '"' + this.prj.currProject.value.name + '","' + app + '"';
          const api = isBKGFile(this.service.activeFile) ? `?BKG_getAppBreakpointsList(${prjAndApp})` : `?TP_GET_APP_BREAKPOINTS_LIST(${prjAndApp})`;
          this.ws
            .query(api)
            .then((ret: MCQueryResponse) => {
              this.setBreakpoints(ret.result);
            });
        }
      });
    this.service.errLinesChange
      .pipe(takeUntil(this.notifier))
      .subscribe(lines => {
        this.highlightErrors(lines);
      });
    this.service.onInsertAndJump
      .pipe(takeUntil(this.notifier))
      .subscribe(ret => {
        if (ret) this.insertAndJump(ret.cmd, ret.lines);
      });
    this.service.onReplaceRange
      .pipe(takeUntil(this.notifier))
      .subscribe(ret => {
        if (ret) this.replaceRange(ret);
      });
    this.service.onReplaceLine.pipe(takeUntil(this.notifier)).subscribe(ret => {
      if (ret) this.replaceLine(ret.index, ret.cmd);
    });
    this.service.skipLineRequest
      .pipe(takeUntil(this.notifier))
      .subscribe((line: number) => {
        if (line) {
          this.editor.scrollToLine(line, true, true, null);
          this.editor.focus();
          const lineText = this.editor.session.getLine(line-1);
          const col = lineText.length;
          this.editor.gotoLine(line, col, false);
          if (this.service.errors.length > 0 && this.service.backtrace) {
            this.highlightErrors([{ number: line }]);
          }
        }
      });
    this.service.fileChange
      .pipe(takeUntil(this.notifier))
      .subscribe(fileName => {

        // set no break points of background task, perhaps we should add this feature in the future.
        if (fileName.endsWith('G') || this.service.modeToggle === 'prj') {
          this.setBreakpoints('');
          return;
        }
        if (fileName.endsWith('B') || this.service.modeToggle === 'mc') {
          return this.setBreakpoints('');
        }
        if (this.prj.currProject.value && this.service.modeToggle === 'prj') {
          const app = fileName.substring(0, fileName.indexOf('.'));
          const prjAndApp =
            '"' + this.prj.currProject.value.name + '","' + app + '"';
          const api = isBKGFile(this.service.activeFile) ? `?BKG_getAppBreakpointsList(${prjAndApp})` : `?TP_GET_APP_BREAKPOINTS_LIST(${prjAndApp})`;
          this.ws
            .query(api)
            .then((ret: MCQueryResponse) => {
              this.setBreakpoints(ret.result);
            });
        }
        this.editor.getSession().setUndoManager(new ace.UndoManager());
      });
    this.service.dragEnd.pipe(takeUntil(this.notifier)).subscribe(() => {
      if (this.editor) this.editor.resize();
    });
    this.service.onUndo.pipe(takeUntil(this.notifier)).subscribe(() => {
      if (this.editor) this.editor.undo();
    });
    this.service.onRedo.pipe(takeUntil(this.notifier)).subscribe(() => {
      if (this.editor) this.editor.redo();
    });
    this.service.onFind.pipe(takeUntil(this.notifier)).subscribe(() => {
      if (this.editor) this.editor.execCommand('find');
    });
    this.service.onReplace.pipe(takeUntil(this.notifier)).subscribe(() => {
      if (this.editor) this.editor.execCommand('replace');
    });
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.initEditor();
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
    this.task.stop();
    this.service.refreshStatus(false);
  }

  get isEditorDisabled(): boolean {
    if (this.service.busy) return true;
    return (
      (this.editor && this.editor.getReadOnly() && !this.cmn.isTablet) ||
      (this.cmn.isTablet &&
        this.service.status &&
        this.service.status.statusCode >= 0 &&
        !this.service.isLib)
    );
  }

  private replaceLine(index: number, newLine: string, replaceTabs?: boolean) {
    const editor = this.editor;
    const line: string = editor.session.getLine(index);
    const tabs = replaceTabs ? '' : new Array(this.numberOfTabs(line) + 1).join('\t');
    const txtLines = newLine.split('\n');
    for (let i = 0; i < txtLines.length; i++) txtLines[i] = tabs + txtLines[i];
    newLine = txtLines.join('\n');
    editor.session.replace(
      new this.Range(index, 0, index, Number.MAX_VALUE),
      newLine
    );
  }

  private replaceRange(txt: string) {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    const line: string = editor.session.getLine(row);
    // get current indentation
    const tabs = new Array(this.numberOfTabs(line) + 1).join('\t');
    const txtLines = txt.split('\n');
    for (let i = 1; i < txtLines.length; i++) txtLines[i] = tabs + txtLines[i];
    txt = txtLines.join('\n');
    this.editor.session.replace(this.editor.selection.getRange(), txt);
  }

  private numberOfTabs(text: string) {
    let count = 0;
    let index = 0;
    let spaceIndex = 0;
    if (text === null || text.length === 0) return 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 32) spaceIndex++;
      else break;
      if (spaceIndex % 2 === 0) count++;
    }
    while (text.charAt(index++) === '\t') {
      count++;
    }
    return count;
  }

  private insertLineBreak() {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    const line: string = editor.session.getLine(row);
    const column = line.length; // end of line
    editor.gotoLine(row + 1, column);
    editor.insert('\n');
    editor.focus();
  }

  deleteLine() {
    this.editor.removeLines();
  }

  private insertAndJump(txt: string, lines: number) {
    const editor = this.editor;
    let position = editor.getCursorPosition();
    let row = position.row; // current row
    const line: string = editor.session.getLine(row);
    let column = line.length; // end of line
    editor.gotoLine(row + 1, column);
    // get current indentation
    const tabs = new Array(this.numberOfTabs(line) + 1).join('\t');
    const txtLines = txt.split('\n');
    for (let i = 1; i < txtLines.length; i++) txtLines[i] = tabs + txtLines[i];
    txt = txtLines.join('\n');
    if (line.trim().length > 0) {
      txt = '\n' + tabs + txt;
    } else {
      lines--;
    }
    editor.insert(txt + '\n' + tabs);
    if (lines <= 0) return editor.focus();
    position = editor.getCursorPosition();
    row += lines;
    column = editor.session.getLine(row).length; // end of line
    editor.gotoLine(row + 1, column);
    editor.focus();
  }

  private initEditor() {
    this.editor = ace.edit(this.editorDiv.nativeElement);
    this.editor.setOptions({
      fontSize: this.cmn.isTablet ? '18px' : '13px',
      showPrintMargin: false,
      theme: 'ace/theme/' + (this.utils.isDarkMode ? 'cs-dark' : 'cs'),
      mode: 'ace/mode/mcbasic',
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      readOnly: this.cmn.isTablet,
      tabSize: this.cmn.isTablet ? 2 : 4,
      fontFamily: 'cs-monospace',
      enableLinking: true,
      fixedWidthGutter: true
    });
    this.keywords.initDone.subscribe(done => {
      if (!done) return;
      this.editor.completers = [this.keywords.getNewWordCompleter(false)];
    });
    this.editor.$blockScrolling = Infinity;
    if (this.service.editorText) {
      this.editor.setValue(this.service.editorText, -1);
      this.editor.getSession().setUndoManager(new ace.UndoManager());
    } else {
      this.editor.setReadOnly(true);
      this.cd.detectChanges();
    }
    this.editor.getSession().on("changeAnnotation", e=>{
      if (this.service.status === null || 
          (!this.service.isLib && this.service.status.statusCode !== TASKSTATE_NOTLOADED)) {
        return;
      }
      const syntaxErrors = [];
      const syntaxWarnings = [];
      this.service.errors = [];
      const errors = [];
      for (const a of this.editor.getSession().getAnnotations()) {
        const row = a.row + 1;
        if (a.type === 'error' && !syntaxErrors.includes(row)) {
          errors.unshift({
            error: a.text,
            file: '',
            number: row,
            type: a.type
          });
          syntaxErrors.push({number: row, col: a.col });
        } else if (a.type === 'warning' && !syntaxWarnings.includes(row)) {
          syntaxWarnings.push({number: row, col: a.col });
          errors.push({
            error: a.text,
            file: '',
            number: row,
            type: a.type
          });
        }
      }
      this.zone.run(()=>{
        this.service.errors = errors;
        this.highlightSyntaxErrors(syntaxErrors);
        if (syntaxErrors.length === 0) {
          this.highlightSyntaxWarnings(syntaxWarnings);
        }
      });
    });
    this.editor.getSession().on('change', e => {
      if (e.action === 'remove') {
        this.service.rangeText = null;
      }
      this.service.isDirty = true;
      const breakpointsArray = Object.keys(this.editor.session.getBreakpoints());
      let breakpoint;
      let prevBreakpoint = -1;
      if (e.action !== 'remove' && e.lines[0] && (e.lines[0] === '.' || e.lines[0] === ' ') || e.lines[0] === '=') {
        setTimeout(() => {
          this.editor.commands.byName.startAutocomplete.exec(this.editor);
        }, 50);
      }
      if (breakpointsArray.length > 0) {
        if (e.lines.length > 1) {
          const lines = e.lines.length - 1;
          const start = e.start.row;
          const end = e.end.row;
          if (e.action === 'insert') {
            for (let i = 0; i < breakpointsArray.length; i++) {
              breakpoint = Number(breakpointsArray[i]);
              if (i > 0) prevBreakpoint = Number(breakpointsArray[i - 1]);
              else prevBreakpoint = -1;
              if (breakpoint > start) {
                if (prevBreakpoint === -1 || prevBreakpoint !== breakpoint - 1) {
                  this.editor.session.clearBreakpoint(breakpoint);
                }
                this.editor.session.setBreakpoint(breakpoint + lines);
              }
            }
          } else if (e.action === 'remove') {
            for (let i = 0; i < breakpointsArray.length; i++) {
              breakpoint = Number(breakpointsArray[i]);
              if (breakpoint > start && breakpoint < end) {
                this.editor.session.clearBreakpoint(breakpoint);
              }
              if (breakpoint >= end) {
                this.editor.session.clearBreakpoint(breakpoint);
                this.editor.session.setBreakpoint(breakpoint - lines);
              }
            }
          }
        }
      }
      if (e.action === 'remove') {
        const line = this.editor.getSelectionRange().start.row;
        this.service.editorLine = line + 1;
      }
      this.service.editorText = this.editor.getValue();
    });
    this.editor
      .getSession()
      .getSelection()
      .on('changeCursor', e => {
        const range = this.editor.session.getSelection().getRange();
        const rowIndex: number = this.editor.session
          .getSelection()
          .getSelectionAnchor().row;
        const row: string = this.editor.session.getLine(rowIndex);
        this.zone.run(() => {
          if (this.editor.getSelectedText().length === 0) {
            this.service.onAceEditorCursorChange(rowIndex, row);
          }
          else {
            this.service.onAceEditorRangeChange(
              range.start.row,
              range.end.row,
              this.editor.getSelectedText()
            );
          }
        });
        const line = this.editor.getSelectionRange().start.row;
        this.service.editorLine = line + 1;
      });
    this.editor.on(
      'guttermousedown',
      (this.editor.$breakpointListener = e => {
        const isFoldWidget = e.domEvent.target.classList.contains('ace_fold-widget');
        const isAnnotation = e.domEvent.target.classList.contains('ace_error');
        if (isFoldWidget || isAnnotation || this.service.modeToggle !== 'prj') return;
        if (this.service.activeFile.endsWith('B')) {
          this.zone.run(() => {
            //   this.snack.open(
            //     this.words['projects.ace']['bp_lib'],
            //     this.words['dismiss']
            //   );
            this.snackbarService.openTipSnackBar("projects.ace.bp_lib");
          });
          return;
        }
        if (
          this.service.status === null ||
          this.service.status.statusCode === TASKSTATE_NOTLOADED
        ) {
          // PROGRAM NOT LOADED OR IS LIBRARY
          this.zone.run(() => {
            //   this.snack.open(
            //     this.words['projects.ace']['bp_err'],
            //     this.words['dismiss']
            //   );     
            this.snackbarService.openTipSnackBar("projects.ace.bp_err");      
          });
          return;
        }
        const app = this.service.activeFile.substring(
          0,
          this.service.activeFile.indexOf('.')
        );
        const prjAndApp =
          '"' + this.prj.currProject.value.name + '","' + app + '"';
        const api = isBKGFile(this.service.activeFile) ?
                    `?BKG_getAppBreakpointsList(${prjAndApp})` : 
                    `?TP_GET_APP_BREAKPOINTS_LIST(${prjAndApp})`;
        
        let changedFlag = false;
        e.stop();
        const line = e.getDocumentPosition().row;
        const bpts = Object.keys(this.editor.getSession().getBreakpoints());
        const cmd = isBKGFile(this.service.activeFile) ? 
                    `?BKG_toggleAppBreakpoint(${prjAndApp},${line + 1})` :
                    `?TP_TOGGLE_APP_BREAKPOINT(${prjAndApp},${line + 1})`;
        for (let i = 0; i < bpts.length && !changedFlag; i++) {
          if (line === bpts[i]) {
            changedFlag = true;
            this.ws
              .query(cmd)
              .then((ret: MCQueryResponse) => {
                if (ret.err) return;
                this.ws
                  .query(api)
                  .then((ret: MCQueryResponse) => {
                    this.setBreakpoints(ret.result);
                  });
              });
          }
        }
        if (!changedFlag) {
          this.ws
            .query(cmd)
            .then((ret: MCQueryResponse) => {
              if (ret.err) return;
              this.ws
                .query(api)
                .then((ret: MCQueryResponse) => {
                  this.setBreakpoints(ret.result);
                });
            });
        }
      })
    );
    // HANDLE LINKS
    this.editor.on("linkHover",data => {
      //if (this.currHoverRange) this.editor.session.removeMarker(this.currHoverRange);
      this.currFuncRow = -1;
      if (data.token === null) return;
      if (data.token.type === 'identifier') {
        const session = this.editor.getSession();
        const funcName = data.token.value.toLowerCase();
        const funcFound = session.functions ? session.functions.find(f=>{
          return f.name.toLowerCase() === funcName;
        }) : false;
        const subFound = session.subs ? session.subs.find(s=>{
          return s.name.toLowerCase() === funcName;
        }) : false;
        if (funcFound) {
          this.currFuncRow = funcFound.line + 1;
          const row = data.position.row;
          if (this.currHoverRange) return;
          this.currHoverRange = this.editor.session.addMarker(
            new this.Range(row, data.token.start, row, data.token.start + data.token.value.length),
            'ace-link', 'text'
          );
        } else if (subFound) {
          this.currFuncRow = subFound.line + 1;
          const row = data.position.row;
          if (this.currHoverRange) return;
          this.currHoverRange = this.editor.session.addMarker(
            new this.Range(row, data.token.start, row, data.token.start + data.token.value.length),
            'ace-link', 'text'
          );
        }
      }
    });
    this.editor.on("linkClick",data => {
      if (this.currFuncRow === -1) return;
      const line = this.editor.getSession().getLine(this.currFuncRow-1);
      this.editor.gotoLine(this.currFuncRow, line.length);
    });
    this.editor.on("linkHoverOut",()=>{
      if (this.currHoverRange) {
        this.editor.session.removeMarker(this.currHoverRange);
        this.currHoverRange = null;
      }
    });
    // HANDLE MOUSE HOVER OVER WORDS
    this.editor.on('mousemove', e => {
      const position = e.getDocumentPosition();
      if (this.service.status === null) {
        this.hideTooltip();
        return;
      }
      const code = this.service.status.statusCode;
      if (code !== 2 && code !== 4) {
        this.hideTooltip();
        return;
      }
      const stream = new this.TokenIterator(this.editor.session, position.row, position.column);
      const stream2 = new this.TokenIterator(this.editor.session, position.row, position.column);
      const token = stream.getCurrentToken();
      if (!token || token.type === 'keyword.control.asp') {
        this.hideTooltip();
        return;
      }
      let tokenNoSpaces = token.value.replace(/\s/g, '');
      let prevToken = stream.stepBackward();
      let nextToken = stream2.stepForward();
      while (prevToken && prevToken.value === '.') {
        prevToken = stream.stepBackward();
        tokenNoSpaces = prevToken.value.replace(/\s/g, '') + '.' + tokenNoSpaces;
        prevToken = stream.stepBackward();
      }
      while (nextToken && nextToken.value === '.') {
        nextToken = stream2.stepForward();
        tokenNoSpaces = tokenNoSpaces + '.' + nextToken.value.replace(/\s/g, '');
        nextToken = stream2.stepForward();
      }
      if (tokenNoSpaces.length === 0) return;
      if (tokenNoSpaces === ']') {
        const tokens = this.editor.session.getTokens(position.row);
        const i = tokens.indexOf(token);
        if (i < 3) return;
        tokenNoSpaces = tokens.slice(i - 3, i+1).map(t=>{
          return t.value;
        }).join('');
      }
      if (tokenNoSpaces === this.lastWord) return;
      this.hideTooltip();
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
      this.lastWord = tokenNoSpaces;
      if (!isNaN(Number(tokenNoSpaces))) return;
      const cmd1 = 'watch ' + this.service.activeFile + ' ' + tokenNoSpaces;
      const cmd2 = 'watch ' + tokenNoSpaces;
      const nameWithoutExt = this.service.activeFile.split('.')[0];
      const cmd3 = 'watch ' + nameWithoutExt + '::' + tokenNoSpaces;
      this.tooltipTimeout = window.setTimeout(() => {
        this.ws.query(cmd1).then(ret => {
          if (ret.err) {
            return this.ws.query(cmd2).then(ret => {
              if (ret.err) {
                return this.ws.query(cmd3).then(ret => {
                  if (ret.err) return;
                  this.showTooptip(e, ret.result);
                });
              }
              this.showTooptip(e, ret.result);
            });
          }
          this.showTooptip(e, ret.result);
        });
      }, 500);
    });
    this.editor.commands.addCommand({
      name: 'save',
      bindKey: { win: 'Ctrl-S', mac: 'Command-Option-S' },
      exec: () => {
        this.zone.run(() => {
          this.service.save();
        });
      },
    });
    if (this.service.activeFile && this.service.modeToggle === 'prj' && this.service.activeFile.endsWith('UPG') && this.prj.currProject.value) {
      const app = this.service.activeFile.substring(
        0,
        this.service.activeFile.indexOf('.')
      );
      const prjAndApp =
        '"' + this.prj.currProject.value.name + '","' + app + '"';
      const api = isBKGFile(this.service.activeFile) ? `?BKG_getAppBreakpointsList(${prjAndApp})` : `?TP_GET_APP_BREAKPOINTS_LIST(${prjAndApp})`;
      
      this.ws
        .query(api)
        .then((ret: MCQueryResponse) => {
          this.setBreakpoints(ret.result);
        });
    }
    setTimeout(()=>{
      this.editor.resize();
    },0);
  }

  // tslint:disable-next-line: no-any
  private showTooptip(e: {domEvent: MouseEvent}, val: string) {
    this.tooltipX = e.domEvent.offsetX + 50;
    this.tooltipY = e.domEvent.offsetY + 8;
    const editorWidth = (this.editorDiv.nativeElement as HTMLElement).offsetWidth;
    const tooltipWidth = (this.lastWord.length + val.length + 3) * 12; // 12px per character
    if (this.tooltipX + tooltipWidth >= editorWidth) {
      this.tooltipX = editorWidth - tooltipWidth;
    }
    this.tooltipVisible = true;
    this.tooltipValue = val;
    this.cd.detectChanges();
  }

  private hideTooltip() {
    if (!this.tooltipVisible) return;
    this.tooltipVisible = false;
    this.cd.detectChanges();
  }

  private setBreakpoints(bptsString: string) {
    this.editor.getSession().clearBreakpoints();
    const bpts = bptsString.split(',');
    for (const bp of bpts) {
      const n = Number(bp);
      if (isNaN(n)) continue;
      this.editor.getSession().setBreakpoint(n - 1, 'ace_breakpoint');
    }
  }

  highlightLine(line: number) {
    if (this.editor === null) return;
    if (this.currRange) this.editor.session.removeMarker(this.currRange);
    this.currRange = this.editor.session.addMarker(
      new this.Range(line - 1, 0, line - 1, 1),
      'line-highlight',
      'fullLine'
    );
    this.markers.push(this.currRange);
  }

  highlightErrors(lines: Array<{number: number}>) {
    if (this.editor === null) return;
    this.removeAllMarkers();
    for (const line of lines) {
      const len = 1;
      const col = 0;
      this.markers.push(
        this.editor.session.addMarker(
          new this.Range(line.number - 1, col, line.number - 1, len),
          'line-highlight-error',
          'fullLine'
        )
      );
    }
  }

  highlightSyntaxErrors(lines: Array<{number: number, col: number}>) {
    if (this.editor === null) return;
    this.removeAllMarkers();
    for (const line of lines) {
      const col = line.col;
      const len = this.editor.getSession().getLine(line.number-1).length;
      this.markers.push(
        this.editor.session.addMarker(
          new this.Range(line.number - 1, col, line.number - 1, len),
          'line-syntax-error', 'text'
        )
      );
    }
  }

  highlightSyntaxWarnings(lines: Array<{number: number, col: number}>) {
    if (this.editor === null) return;
    this.removeAllMarkers();
    for (const line of lines) {
      const col = line.col;
      const len = this.editor.getSession().getLine(line.number-1).length;
      this.markers.push(
        this.editor.session.addMarker(
          new this.Range(line.number - 1, col, line.number - 1, len),
          'line-syntax-warning', 'text'
        )
      );
    }
  }

  removeAllMarkers() {
    if (this.editor === null) return;
    while (this.markers.length > 0) {
      this.editor.session.removeMarker(this.markers.pop());
    }
  }
  
  

  /*************** Virtual Keyboard **********************/
  @ViewChild('dummyInput', { static: false }) dummyInput: ElementRef;
  dummyText = '';
  showKeyboard() {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    this.dummyText = editor.session.getLine(row).replace(/\t/g,'  ');
    this.dummyInput.nativeElement.setAttribute('column', position.column);
    this.dummyInput.nativeElement.focus();
  }
  onDummyKeyboardClose() {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    if (this.dummyText === '\n') this.insertLineBreak();
    else this.replaceLine(row, this.dummyText, true);
    this.dummyText = '';
  }
  /******************************************************/
}

export interface Command {
  name: string;
  syntax: string;
  description: string;
}