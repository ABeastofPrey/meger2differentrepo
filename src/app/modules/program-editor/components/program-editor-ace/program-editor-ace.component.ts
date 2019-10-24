import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ApplicationRef,
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

declare var ace;

const MOTION_COMMANDS = ['move', 'moves', 'circle'];
const TASK_COMMANDS = ['unload', 'idle', 'kill'];
const TASK_PREFIXES = ['prg','upg','lib','ulb'];
const PROGRAM_COMMANDS = ['load'];
const OPTIONAL: OptionalParams[] = [
  {
    cmd: 'move',
    params: ['Vcruise', 'Acc', 'Dec'],
  },
  {
    cmd: 'circle',
    params: [
      'Angle',
      'CircleCenter',
      'CirclePlane',
      'CirclePoint',
      'TargetPoint',
    ],
  },
];
const VALUES: Values[] = [
  {
    attr: 'blendingmethod',
    values: [
      { val: '0', doc: 'No blending' },
      { val: '1', doc: 'CP (continuous path)' },
      { val: '2', doc: 'SP (superposition)' },
      { val: '3', doc: '3 – AI (advance interpolation)' },
      {
        val: '4',
        doc:
          'CP<br>Same as 1, but instead of distance, this CP blending is defined by percentage with BlendingFactor',
      },
    ],
  },
];

@Component({
  selector: 'program-editor-ace',
  templateUrl: './program-editor-ace.component.html',
  styleUrls: ['./program-editor-ace.component.css'],
})
export class ProgramEditorAceComponent implements OnInit {
  @ViewChild('ace', { static: false }) editorDiv: ElementRef;
  private editor: any;
  private Range = ace.require('ace/range').Range;
  private TokenIterator = ace.require('ace/token_iterator').TokenIterator;
  private currRange: any;
  private markers: any[] = [];
  private commands: Command[];
  private files: MCFile[];
  private words: any;
  private notifier: Subject<boolean> = new Subject();

  // HANDLE MOUSE HOVER TOOLTIPS
  private tooltipTimeout: any;
  lastWord: string;
  tooltipValue: string;
  tooltipVisible: boolean = false;
  tooltipX: number;
  tooltipY: number;

  constructor(
    public service: ProgramEditorService,
    private api: ApiService,
    private groups: GroupManagerService,
    private zone: NgZone,
    private ref: ApplicationRef,
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
            if (this.editor)
              this.editor.resize();
          }, 1000);
        }
      });
    this.service.statusChange
      .pipe(takeUntil(this.notifier))
      .subscribe((stat: ProgramStatus) => {
        if (this.service.errors.length === 0 || this.service.backtrace === null)
          this.removeAllMarkers();
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
          if (stat.statusCode !== TASKSTATE_RUNNING)
            this.editor.scrollToLine(stat.programLine, true, true, null);
        }
        if (stat && stat.statusCode === TASKSTATE_NOTLOADED)
          this.setBreakpoints('');
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
            this.highlightErrors([{ number: line, file: '', error: '' }]);
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
        if (fileName.endsWith('B') || this.service.modeToggle === 'mc')
          return this.setBreakpoints('');
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
    let editor = this.editor;
    let line: string = editor.session.getLine(index);
    let tabs = replaceTabs ? '' : Array(this.numberOfTabs(line) + 1).join('\t');
    let txtLines = newLine.split('\n');
    for (let i = 0; i < txtLines.length; i++) txtLines[i] = tabs + txtLines[i];
    newLine = txtLines.join('\n');
    editor.session.replace(
      new this.Range(index, 0, index, Number.MAX_VALUE),
      newLine
    );
  }

  private replaceRange(txt: string) {
    let editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
    var line: string = editor.session.getLine(row);
    // get current indentation
    let tabs = Array(this.numberOfTabs(line) + 1).join('\t');
    let txtLines = txt.split('\n');
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
    let editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
    var line: string = editor.session.getLine(row);
    var column = line.length; // end of line
    editor.gotoLine(row + 1, column);
    editor.insert('\n');
    editor.focus();
  }

  deleteLine() {
    this.editor.removeLines();
  }

  private insertAndJump(txt: string, lines: number) {
    let editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
    var line: string = editor.session.getLine(row);
    var column = line.length; // end of line
    editor.gotoLine(row + 1, column);
    // get current indentation
    let tabs = Array(this.numberOfTabs(line) + 1).join('\t');
    let txtLines = txt.split('\n');
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
      fontFamily: 'courier',
    });
    this.api
      .getDocs()
      .then(result => {
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
    this.editor.getSession().on('change', e => {
      this.service.isDirty = true;
      var breakpointsArray = Object.keys(this.editor.session.getBreakpoints());
      var breakpoint;
      var prevBreakpoint = -1;
      if (e.lines[0] && (e.lines[0] === '.' || e.lines[0] === ' ')) {
        setTimeout(() => {
          this.editor.commands.byName.startAutocomplete.exec(this.editor);
        }, 50);
      }
      if (breakpointsArray.length > 0) {
        if (e.lines.length > 1) {
          var lines = e.lines.length - 1;
          var start = e.start.row;
          var end = e.end.row;
          if (e.action === 'insert') {
            for (var i = 0; i < breakpointsArray.length; i++) {
              breakpoint = parseInt(breakpointsArray[i]);
              if (i > 0) prevBreakpoint = parseInt(breakpointsArray[i - 1]);
              else prevBreakpoint = -1;
              if (breakpoint > start) {
                if (prevBreakpoint === -1 || prevBreakpoint !== breakpoint - 1)
                  this.editor.session.clearBreakpoint(breakpoint);
                this.editor.session.setBreakpoint(breakpoint + lines);
              }
            }
          } else if (e.action === 'remove') {
            for (var i = 0; i < breakpointsArray.length; i++) {
              breakpoint = parseInt(breakpointsArray[i]);
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
        let rowIndex: number = this.editor.session
          .getSelection()
          .getSelectionAnchor().row;
        let row: string = this.editor.session.getLine(rowIndex);
        this.zone.run(() => {
          if (this.editor.getSelectedText().length === 0)
            this.service.onAceEditorCursorChange(rowIndex, row);
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
        if (this.service.modeToggle !== 'prj') return;
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
          if (line == bpts[i]) {
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
      if (code !== 2 && code != 4) {
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
        const tokens: any[] = this.editor.session.getTokens(position.row);
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
      this.tooltipTimeout = setTimeout(() => {
        this.ws.query(cmd1).then((ret: MCQueryResponse) => {
          if (ret.err) {
            return this.ws.query(cmd2).then((ret: MCQueryResponse) => {
              if (ret.err) {
                return this.ws.query(cmd3).then((ret: MCQueryResponse) => {
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
  }

  private showTooptip(e: any, val: any) {
    this.tooltipX = e.domEvent.offsetX + 50;
    this.tooltipY = e.domEvent.offsetY + 8;
    this.tooltipVisible = true;
    this.tooltipValue = val;
    this.ref.tick();
  }

  private hideTooltip() {
    if (!this.tooltipVisible) return;
    this.tooltipVisible = false;
    this.ref.tick();
  }

  private setBreakpoints(bptsString: string) {
    this.editor.getSession().clearBreakpoints();
    let bpts = bptsString.split(',');
    for (let bp of bpts) {
      let n = Number(bp);
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

  highlightErrors(lines: TRNERRLine[]) {
    if (this.editor === null) return;
    this.removeAllMarkers();
    for (let line of lines) {
      this.markers.push(
        this.editor.session.addMarker(
          new this.Range(line.number - 1, 0, line.number - 1, 1),
          'line-highlight-error',
          'fullLine'
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
  
  getNewWordCompleter() {
    return {
      getCompletions: (
        editor,
        session,
        pos,
        prefix: string,
        callback: Function
      ) => {
        let stream = new this.TokenIterator(session, pos.row, pos.column);
        let token = stream.getCurrentToken();
        const line: string = session.getLine(pos.row).trim();
        for (let cmd in DOCS.commands) {
          const cmdObj = DOCS.commands[cmd];
          const match = line.match(new RegExp(cmdObj.regStr,'gi'));
          if (match) {
            // find which part of the command are we
            const i = match[0].split(' ').length - 1;
            if (!cmdObj.parts[i]) {
              return callback(null, cmdObj.opts.map(opt=>{
                 return {
                   caption: opt,
                   value: opt,
                   meta: 'Command Parameter',
                   type: 'Command Parameter',
                   docHTML: this.getDoc(DOCS.properties,opt)
                 };
               }));
            }
            const partTypes = cmdObj.parts[i].split('|');
            let results = [];
            for (let t of partTypes) {
              if (t === 'me') { // motion element
                results = results.concat(this.groups.groups.map(grp=>{
                  return grp.name;
                }));
              } else if (t === 'jnt') {
                results = results.concat(this.data.joints.map(jnt=>{
                  return jnt.name;
                }));
              } else if (t === 'loc') {
                results = results.concat(this.data.locations.map(loc=>{
                  return loc.name;
                }));
              } else if (t === 'must') {
                return callback(null, cmdObj.musts.map(must=>{
                  return {
                    caption: must,
                    value: must,
                    meta: 'Command Parameter',
                    type: 'Command Parameter',
                    docHTML: this.getDoc(DOCS.musts,must)
                  };
                }).concat(results.map(res=>{
                  return {
                    caption: res,
                    value: res,
                    meta: 'Command Parameter',
                    type: 'Command Parameter'
                  };
                })));
              }
            }
            return callback(null, results.map(res=>{
              return {
                caption: res,
                value: res,
                meta: 'Command Parameter',
                type: 'Command Parameter'
              };
            }));
          }
        }
        if (token.value === '.') {
          token = stream.stepBackward();
          prefix = (token.value as string).toLowerCase();
          if (TASK_PREFIXES.includes(prefix)) { // i.e: prg
            token = stream.stepBackward();
            if (token.value as string === '.') {
              token = stream.stepBackward();
              prefix = (token.value as string).toLowerCase() + '.' +
                prefix; // i.e: demo.prg
              return callback(null, this.handlePrefix(prefix));
            }
          }
          return callback(null, this.handlePrefix(prefix));
        }
        token = stream.stepBackward();
        if (token.value === '.') {
          token = stream.stepBackward();
          prefix = (token.value as string).toLowerCase();
          return callback(null, this.handlePrefix(prefix));
        }
        // HANDLE NON-PREFIX
        return callback(null, this.getAutocompleteOptions(prefix));
      }
    };
  }
  
  handlePrefix(p: string) {
    // HANDLE SYS
    if (p === 'sys') {
      return Object.keys(DOCS.sys).map(key=>{
        return {
          caption: key,
          value: key,
          meta: 'System Parameter',
          type: 'System Parameter',
          docHTML: this.getDoc(DOCS.sys,key)
        };
      });
    }
    // HANDLE GROUP
    if (this.groups.groups.map(grp=>{
      return grp.name.toLowerCase();
    }).includes(p)) {
      return DOCS.group.map(property=>{
        return {
          caption: property,
          value: property,
          meta: 'Group Parameter',
          type: 'Group Parameter',
          docHTML: this.getDoc(DOCS.properties,property)
        };
      });
    }
    // HANDLE AXIS
    const axes = this.groups.groups.map(grp=>{
      return grp.axes.map(axis=>{
        return axis.toLowerCase();
      });
    });
    if (axes.some(arr=>{ return arr.includes(p); })) {
      return DOCS.axis.map(property=>{
        return {
          caption: property,
          value: property,
          meta: 'Axis Parameter',
          type: 'Axis Parameter',
          docHTML: this.getDoc(DOCS.properties,property)
        };
      });
    }
    // HANDLE TASKS
    if (this.task.tasks.map(t=>{
      return t.name.toLowerCase();
    }).includes(p)) {
      return Object.keys(DOCS.tasks).map(key=>{
        return {
          caption: key,
          value: key,
          meta: 'Task Parameter',
          type: 'Task Parameter',
          docHTML: this.getDoc(DOCS.tasks,key)
        };
      });
    }
  }
  
  getAutocompleteOptions(prefix: string) {
    if (prefix.trim().length === 0) return;
    const groups = this.groups.groups.map(grp=>{
      return {
        caption: grp.name,
        value: grp.name,
        meta: 'Group',
        type: 'Group'
      };
    });
    const variables = this.data.joints
      .concat(this.data.locations)
      .concat(this.data.longs)
      .concat(this.data.doubles)
      .concat(this.data.strings)
      .map(v=>{
        return {
          caption: v.name,
          value: v.name,
          meta: v.typeStr,
          type: v.typeStr,
          docHTML: v.isArr ? v.name + '[' + v.value.length + ']' : null
        };
    });
    const commands = this.commands.map<any>(cmd => {
      return {
        caption: cmd.name,
        value: cmd.name,
        meta: 'command',
        type: 'command',
        docHTML:
          '<div class="docs"><b>' +
          cmd.name +
          '<br><br>Syntax: </b>' +
          cmd.syntax +
          '<br><b>Description:</b><br>' +
          cmd.description +
          '</div>',
      };
    }).concat(this.keywords.wordList.map(word => {
        return {
          caption: word,
          value: word,
          meta: 'parameter',
          type: 'parameter',
        };
      })
    ).concat(this.keywords.keywords.map(word => {
        return {
          caption: word,
          value: word,
          meta: 'keyword',
          type: 'keyword',
        };
      })
    );
    return groups.concat(variables).concat(commands).filter(a=>{
      return a.value.toLowerCase().startsWith(prefix);
    }).sort((a,b)=>{
      return a.caption >= b.caption ? 1 : -1;
    });
  }
  
  getDoc(obj, key) {
    let doc = '<b>' + key;
    if (obj[key].type === 'list') {
      doc += '</b>:<table style="margin-top: 8px;">';
      for (let k in obj[key].options) {
        const val = obj[key].options[k];
        doc += '<tr><td style="padding-right: 6px; font-weight: bold;">' + k + '</td><td style="padding-right: 6px;">' + val.name + '</td><td>'
         + val.desc + '</td></tr>';
      }
      doc += '</table>';
    } else {
      doc += ' [' + obj[key].type + ']</b>';
    }
    doc += '<p style="margin-top: 8px;">' + obj[key].desc + '</p>';
    return doc;
      
  }

  /*************** Virtual Keyboard **********************/
  @ViewChild(MatInput, { static: false }) dummyInput: MatInput;
  dummyText: string = '';
  showKeyboard() {
    var editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
    this.dummyText = editor.session.getLine(row).replace(/\t/g,'  ');
    this.dummyInput.focus();
  }
  onDummyKeyboardClose() {
    var editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
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
  values: {
    val: string;
    doc: string;
  }[];
}

export interface Command {
  name: string;
  syntax: string;
  description: string;
}

// TODO: REMOVE THIS FROM HERE AND PUT IN WEB SERVER !!!
export const DOCS = {
  "axis": ['VCruise', 'VMax'],
  "commands": {
    "attach": {
      "musts": [],
      "opts": [],
      "parts": ['me'],
      "regStr": "(attach) *(\\w+)?"
    },
    "circle": {
      "musts": ['CirclePoint', 'TargetPoint', 'Angle'],
      "opts": ['VTran'],
      "parts": ['me|must','must'],
      "regStr": "(circle) *(?:(\\w+)? *(CirclePoint|TargetPoint|Angle)? *= *(\\w+) *(CirclePoint|TargetPoint|Angle) *= *(\\w+)(?: +(.+))*)?"
    },
    "dopass": {
      "musts": [],
      "opts": [],
      "parts": ['me'],
      "regStr": "(DoPass) *(\\w+)?"
    },
    "move(s)": {
      "musts": [],
      "opts": ['VCruise', 'VMax'],
      "parts": ['me|jnt|loc'],
      "regStr": "(moves?) *(\\w+)?(?: +(.+))*"
    },
    "stop": {
      "musts": ['StopType'],
      "opts": [],
      "parts": ['me|must'],
      "regStr": "(stop) *(\\w+ *)?(?:stoptype *= *(\\w+))?"
    },
    "with": {
      "musts": [],
      "opts": [],
      "parts": ['me'],
      "regStr": "(with) *(\\w+)?"
    }
  },
  "group": ['VCruise', 'VMax'],
  "musts": {
   "Angle": {"desc":"Angle", "type": "Double"},
   "CirclePoint": {"desc":"CirclePoint", "type": "Joint/Location"},
   "StopType": {"desc":"StopType", "type": "list", "options":{
     1: {"name":"IMMEDIATE", "desc": "Immediate stop using maximum deceleration."},
     2: {"name":"ONPATH", "desc": "Immediate stop on the path of the motion. This is useful for stopping group motion so all axes remain on the original path of travel during the stop. For a single axis, IMMEDIATE and ONPATH are the same."},
     3: {"name":"ENDMOTION", "desc": "Stop at the end of the current motion command."},
     4: {"name":"ABORT", "desc": "Stop the current motion immediate but do not wait for proceed to start next motion. Only the accepted motion commands are stopped, the commands coming after this stoptype will be executed regularly"},
     5: {"name":"DecStopOnPath", "desc": "the stopping procedure is started immediately according to DecStop value or DecStopTran and DecStopRot values (for ROBOT ). As those parameters are modal so their values must be updated before executing the motion command.  Contrary to stop immediate in this case the Robot is stopped as a whole group on the movement path."},
   }},
   "TargetPoint": {"desc":"TargetPoint", "type": "Joint/Location"},
  },
  "properties": {
    "VCruise": {"desc":"Velocity of motion", "type": "double"},
    "VMax": {"desc":"Maximum velocity of motion", "type": "double"},
    "VTran": {"desc":"Transitional Velocity", "type": "double"}
  },
  "sys": {
    "information": {"desc":"Prints information about the system", "type": "string"},
    "name": {"desc":"The name of the system", "type": "string"}
  },
  "tasks": {
    "state": {"desc":"The current state id of the task", "type": "long"},
    "status": {"desc":"The current status string of the task", "type": "string"}
  }
};