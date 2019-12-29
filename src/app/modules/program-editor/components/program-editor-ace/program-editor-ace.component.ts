import { TASKSTATE_READY } from './../../services/program-editor.service';
import { length } from 'ramda';
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
  TRNERRLine,
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
import { DOCS } from '../../../core/defs/docs.constants';

declare var ace;

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
  private TokenIterator = ace.require('ace/token_iterator').TokenIterator;
  private HashHandler = ace.require('ace/keyboard/hash_handler').HashHandler;
  // tslint:disable-next-line: no-any
  private currRange: any;
  // tslint:disable-next-line: no-any
  private markers: any[] = [];
  private commands: Command[];
  private files: MCFile[];
  private words: {};
  private notifier: Subject<boolean> = new Subject();

  // AUTOCOMPLETE
  private ovrldIndx = 0;
  private lastContext: string;

  // HANDLE MOUSE HOVER TOOLTIPS
  private tooltipTimeout: number;
  lastWord: string;
  tooltipValue: string;
  tooltipVisible = false;
  tooltipX: number;
  tooltipY: number;

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
    private trn: TranslateService,
    private keywords: KeywordService,
    public login: LoginService,
    public cmn: CommonService,
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
        if (this.service.errors.length === 0 || this.service.backtrace === null) {
          this.removeAllMarkers();
        }
        this.editor.setReadOnly(
          stat === null ||
            (stat.statusCode > -1 && !this.service.activeFile.endsWith('B')) ||
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
          if (this.service.mode === 'mc') return;
          const fileName = this.service.activeFile;
          const app = fileName.substring(0, fileName.indexOf('.'));
          const prjAndApp =
            '"' + this.prj.currProject.value.name + '","' + app + '"';
          this.ws
            .query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')')
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
          this.ws
            .query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')')
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
      theme: 'ace/theme/cs',
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      readOnly: this.cmn.isTablet,
      tabSize: 2,
      fontFamily: 'cs-monospace'
    });
    /*this.editor.getSession().setAnnotations([{
      row: 0,
      column: 4,
      text: 'wtf are you doing!?',
      type: 'warning' // could be 'error' or 'info'
    }]);*/
    this.api
      .getDocs()
      .then((result : Command[]) => {
        this.commands = result;
      })
      .then(() => {
        return this.api.getFiles();
      })
      .then(files => {
        this.files = files;
        this.keywords.initDone.subscribe(done => {
          if (!done) return;
          const newWordCompleter = this.getNewWordCompleter();
          this.editor.completers = [newWordCompleter];
          this.editor.getSession().setMode('ace/mode/mcbasic');
        });
      });
    this.editor.$blockScrolling = Infinity;
    if (this.service.editorText) {
      this.editor.setValue(this.service.editorText, -1);
    } else {
      this.editor.setReadOnly(true);
      this.cd.detectChanges();
    }
    this.editor.getSession().on("changeAnnotation", e=>{
      if (this.service.status === null || 
          this.service.status.statusCode !== TASKSTATE_NOTLOADED) {
        return;
      }
      const syntaxErrors = [];
      for (const a of this.editor.getSession().getAnnotations()) {
        const row = a.row + 1;
        if (!syntaxErrors.includes(row)) {
          syntaxErrors.push({number: row, col: a.col });
        }
      }
      this.highlightSyntaxErrors(syntaxErrors);

    });
    this.editor.getSession().on('change', e => {
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
        if (this.service.activeFile.endsWith('B') || this.service.backtrace) {
          this.zone.run(() => {
            this.snack.open(
              this.words['projects.ace']['bp_lib'],
              this.words['dismiss']
            );
          });
          return;
        }
        if (
          this.service.status === null ||
          this.service.status.statusCode === TASKSTATE_NOTLOADED
        ) {
          // PROGRAM NOT LOADED OR IS LIBRARY
          this.zone.run(() => {
            this.snack.open(
              this.words['projects.ace']['bp_err'],
              this.words['dismiss']
            );
          });
          return;
        }
        const app = this.service.activeFile.substring(
          0,
          this.service.activeFile.indexOf('.')
        );
        const prjAndApp =
          '"' + this.prj.currProject.value.name + '","' + app + '"';
        let changedFlag = false;
        e.stop();
        const line = e.getDocumentPosition().row;
        const bpts = Object.keys(this.editor.getSession().getBreakpoints());
        for (let i = 0; i < bpts.length && !changedFlag; i++) {
          if (line === bpts[i]) {
            changedFlag = true;
            this.ws
              .query(
                '?TP_TOGGLE_APP_BREAKPOINT(' +
                  prjAndApp +
                  ',' +
                  (line + 1) +
                  ')'
              )
              .then((ret: MCQueryResponse) => {
                if (ret.err) return;
                this.ws
                  .query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')')
                  .then((ret: MCQueryResponse) => {
                    this.setBreakpoints(ret.result);
                  });
              });
          }
        }
        if (!changedFlag) {
          this.ws
            .query(
              '?TP_TOGGLE_APP_BREAKPOINT(' + prjAndApp + ',' + (line + 1) + ')'
            )
            .then((ret: MCQueryResponse) => {
              if (ret.err) return;
              this.ws
                .query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')')
                .then((ret: MCQueryResponse) => {
                  this.setBreakpoints(ret.result);
                });
            });
        }
      })
    );
    // HANDLE MOUSE HOVER OVER WORDS
    this.editor.on('mousemove', e => {
      if (this.service.status === null) {
        this.hideTooltip();
        return;
      }
      const code = this.service.status.statusCode;
      if (code !== 2 && code !== 4) {
        this.hideTooltip();
        return;
      }
      const position = e.getDocumentPosition();
      const token = this.editor.session.getTokenAt(
        position.row,
        position.column
      );
      if (token === null) {
        this.hideTooltip();
        return;
      }
      let tokenNoSpaces = token.value.replace(/\s/g, '');
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
    if (this.service.activeFile && this.service.modeToggle === 'prj') {
      const app = this.service.activeFile.substring(
        0,
        this.service.activeFile.indexOf('.')
      );
      const prjAndApp =
        '"' + this.prj.currProject.value.name + '","' + app + '"';
      this.ws
        .query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')')
        .then((ret: MCQueryResponse) => {
          this.setBreakpoints(ret.result);
        });
    }
    setTimeout(()=>{
      this.editor.resize();
    },0);
  }

  // tslint:disable-next-line: no-any
  private showTooptip(e: any, val: string) {
    this.tooltipX = e.domEvent.offsetX + 50;
    this.tooltipY = e.domEvent.offsetY + 8;
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
      console.log(line,col,len);
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

  removeAllMarkers() {
    if (this.editor === null) return;
    while (this.markers.length > 0) {
      this.editor.session.removeMarker(this.markers.pop());
    }
  }

  private resetOvrldIndex(context: string) {
    if (this.lastContext !== context) {
      if (this.lastContext) {
        this.ovrldIndx = 0;
      }
      this.lastContext = context;
    }
  }

  private getOptionsByType(type: string) {
    let optionsArr = [];
    switch (type) {
      default:
        if (type.charAt(0) === '{') {
          optionsArr = [type];
        }
        break;
      case '[' + DOCS.types[3] + ']':
        optionsArr = this.groups.groups.map(g=>{
          return g.name;
        });
        break;
      case '[' + DOCS.types[4] + ']':
        const axes = this.data.robotCoordinateType.legends.length;
        const pnt = '{' + new Array(axes).fill('0').join(',') + '}';
        optionsArr = this.data.joints.map(j=>{
          return j.name;
        }).concat(this.data.locations.map(l=>{
          return l.name;
        })).concat([pnt, '#'+pnt]).sort();
        break;
    }
    return optionsArr;
  }
  
  getNewWordCompleter() {
    return {
      getCompletions: (
        editor,
        session,
        pos,
        prefix: string,
        callback: Function
      ) => {
        // INIT TAB HANDLER
        editor.completer.commands['Tab'] = e=>{
          const completer = editor.completer;
          console.log(e,completer);
          const noCompletions = completer && completer.completions === null;
          const isActivated = completer && completer.activated;
          if (noCompletions) {
            completer.detach();
            editor.insert('\t');
          } else if (isActivated) {
            const row = completer.popup.getRow();
            const data = completer.popup.getData(row);
            if (data) {
              const cmd = data.cmd;
              if (this.ovrldIndx >= cmd.length) {
                this.ovrldIndx = 0;
              }
              if (!cmd || cmd.length === 1) {
                const result = editor.completer.insertMatch();
                if (!result && !editor.tabstopManager) {
                    editor.completer.goTo("down");
                } else {
                    return result;
                }
                return;
              } else if (cmd && this.ovrldIndx === cmd.length - 1) {
                this.ovrldIndx = -1; // will be 0 in next lines
              }
            }
            completer.detach();
            this.ovrldIndx++;
            completer.showPopup(editor);
            if (data && data.cmd) {
              completer.popup.setRow(row);
            }
          } else if (completer) {
            completer.goTo("down");
          }
        };
        editor.completer.commands['Return'] = e=>{
          if (!editor.completer.completions) {
            editor.completer.detach();
            editor.insert('\n');
            return;
          }
          editor.completer.insertMatch();
          editor.completer.showPopup(editor);
        };
        editor.completer.keyboardHandler = new this.HashHandler();
        editor.completer.keyboardHandler.bindKeys(editor.completer.commands);
        // editor.keyBinding.removeKeyboardHandler(editor.completer.keyboardHandler);
        // editor.keyBinding.addKeyboardHandler(editor.completer.keyboardHandler);

        const stream = new this.TokenIterator(session, pos.row, pos.column);
        let token = stream.getCurrentToken();
        let context: string = null;
        const cursorPosition = editor.getCursorPosition();
        const line: string = session.getLine(pos.row).substring(0,cursorPosition.column);
        const trimmed = line.trim();
        if (!token || trimmed.length === 0) {
          //console.log('no token / EMPTY LINE');
          return callback();
        };
        token.value = token.value.trim(); // token could be '    .'
        if (token.value === '.') { // use types a '.'
          token = stream.stepBackward();
          prefix = (token.value as string).toLowerCase();
          context = prefix;
        } else if (token.value !== '=' && token.value !== '}') {
          token = stream.stepBackward();
          if (token && token.value === '.') {
            token = stream.stepBackward();
            prefix = (token.value as string).toLowerCase();
            context = prefix;
          }
        }
        if (!context) {
          let i = trimmed.indexOf(' ');
          if (i === -1) i = trimmed.length;
          context = trimmed.substring(0,i);
        }
        context = context.toLowerCase();

        // FIND POSITION IN SYNTAX
        let linePos = 0;
        const match = line.match(/\S+/g);
        if (match) {
          linePos = match.length;
          if (!line.endsWith(' ') && !line.endsWith('\n')) {
            linePos--;
          }
        }

        // STEP 0 - COMPARE CONTEXT TO GROUPS AND AXES
        // TODO: IMPLEMENT
        
        // STEP 1 - COMPARE CONTEXT TO OBJECTS
        if (DOCS.ac_objects.includes(context) && line.endsWith('.')) {
          // OBJECT FOUND
          this.resetOvrldIndex(context);
          return callback(null, DOCS.objects[context].map(param=>{
            const name = param.short || param.name;
            return {
              caption: name,
              value: name,
              meta: context + ' property',
              type: context + ' property',
              docHTML: this.getParamDoc(param, name),
              context,
              param
            };
          }));
        } else if (line.endsWith('.')) {
          return callback();
        }
        // STEP 2 - COMPARE CONTEXT TO COMMANDS
        if (DOCS.commands[context]) {
          this.resetOvrldIndex(context);
          const cmd = DOCS.commands[context];
          if (this.ovrldIndx >= cmd.length) {
            this.ovrldIndx = 0;
          }
          const currOverload = cmd[this.ovrldIndx];
          const doc = this.getOverloadDoc(cmd, this.ovrldIndx, linePos);
          // CHECK CURRENT OVERLOAD PARTS
          const parts = currOverload['syntax'].split(' ');
          let optionsArr: string[] = [];
          if (linePos > -1 && linePos < parts.length) {
            const part: string = parts[linePos];
            const c = part.charAt(0);
            if (c !== '[' && c !== '{') {
              const i = part.indexOf('=');
              if (token.value === '=') {
                const type = part.substring(i+1);
                optionsArr = this.getOptionsByType(type);
              } else if (token.value !== '}') {
                optionsArr = [part.substring(0,i)];
                return callback(null, optionsArr.map(o=>{
                  return {
                    caption: o,
                    value: o + '=',
                    docHTML: doc,
                    cmd
                  };
                }));
              } else {
                return callback();
              }
            } else {
              optionsArr = this.getOptionsByType(part);
            }
          } else if (linePos >= parts.length && currOverload['optionalType'] > -1) {
            // OPTIONAL PARAM
            const typeIdx = currOverload['optionalType'];
            const options = DOCS.optionals[typeIdx];
            if ((token.value as string) === '=') {
              token = stream.stepBackward();
              if (!options[token.value]) return callback();
              const tokenOptions = options[token.value]['options']
              if (tokenOptions) {
                return callback(null, tokenOptions.map(o=>{
                  return {
                    caption: o.desc,
                    value: '' + o.val,
                    docHTML: doc,
                    cmd
                  };
                }));
              } else {
                const paramType: number = options[token.value]['type'];
                const type = '[' + DOCS.types[paramType] + ']';
                optionsArr = this.getOptionsByType(type);
              }
            } else if (line.endsWith(' ')) {
              const keys = Object.keys(options);
              return callback(null, keys.map(o=>{
                const doc = this.getOverloadDoc(cmd, this.ovrldIndx, linePos, o);
                return {
                  caption: o,
                  value: o + '=',
                  docHTML: doc,
                  cmd
                };
              }));
            } else {
              return callback();
            }
          }
          // COMMAND PARAM
          return callback(null, optionsArr.map(o=>{
            return {
              caption: o,
              value: o + ' ',
              docHTML: doc,
              cmd
            };
          }));
        }
        /* 
          STEP 3 - CHECK IF WORD IS A PART OF COMMAND OR OBJECT
          WE SHOULD SHOW COMMANDS ONLY IF IT IS THE FIRST WORD IN THE LINE
        */
        if (context.length === 0 || prefix.length === 0) return;
        // TODO: ALSO RETURN GROUPS
        let optionsArr = DOCS.ac_objects.map(o=>{
          return {
            caption: o,
            value: o + '.'
          };
        });
        if (linePos === 0) {
          optionsArr = optionsArr.concat(Object.keys(DOCS.commands).map(o=>{
            const cmd = DOCS.commands[o];
            const doc = this.getOverloadDoc(cmd,this.ovrldIndx,0);
            const index = this.ovrldIndx < cmd.length ? this.ovrldIndx : 0;
            const isOneWordCommand = cmd[index]['syntax'].split(' ').length === 1;
            return {
              caption: o,
              value: o + (isOneWordCommand ? '\n' : ' '),
              docHTML: doc,
              cmd
            };
          }));
        }
        optionsArr = optionsArr.sort((a,b)=>{
          return a.caption > b.caption ? 1 : -1;
        });
        return callback(null, optionsArr);
      }
    };
  }

  getOverloadDoc(cmd: [], index: number, tokenIndex: number, optional?: string) {
    if (index < 0 || index >= cmd.length) {
      index = 0;
    }
    const ovrld = cmd[index] as {};
    const syntaxParts = ovrld['syntax'].split(' ');
    let title = '<div class="ac_cmd">' + syntaxParts.map((s,i)=>{
      if (i === tokenIndex) return '<span class="ac_selected">'+s+'</span>';
      return s;
    }).join(' ');
    if (ovrld['optionalType'] > -1) {
      const p = 
          tokenIndex >= syntaxParts.length ? ' <span class="ac_selected">[optional params]</span>' : ' [optional params]';
      title += p;
    }
    title += '</div>';
    const optionalType: number = ovrld['optionalType'];
    let desc = ovrld['desc'];
    if (optional) {
      const option = DOCS.optionals[optionalType][optional];
      desc = `<b>${optional}</b> : ${DOCS.types[option['type']]}<p>${option['desc']}</p>`;
      if (option['options']) {
        let options = '<br><p><b>Options:</b></p><ul>';
        for (const o of option['options']) {
          options += '<li>' + o['val'] + ' - ' + o['desc'] + '</li>'
        }
        options += '</ul>';
        desc += options;
      }
    }
    const ovrldInfo = cmd.length > 1 ? `<br><div class="ac_ovrld">(Overload ${index+1} / ${cmd.length}) | press TAB to switch</div>` : '';
    return `${title}<hr>${desc}<br>${ovrldInfo}`;
  }

  getParamDoc(param: {}, name: string) {
    let title = `<b>${name}</b> : ${DOCS.types[param['type']]}`;
    if (param['range']) title += ` (${param['range']})`;
    return title + `<br><br>${param['desc']}`;
  }

  /*************** Virtual Keyboard **********************/
  @ViewChild(MatInput, { static: false }) dummyInput: MatInput;
  dummyText = '';
  showKeyboard() {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    this.dummyText = editor.session.getLine(row).replace(/\t/g,'  ');
    this.dummyInput.focus();
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

interface OptionalParams {
  cmd: string;
  params: string[];
}

interface Values {
  attr: string;
  values: Array<{
    val: string;
    doc: string;
  }>;
}

export interface Command {
  name: string;
  syntax: string;
  description: string;
}