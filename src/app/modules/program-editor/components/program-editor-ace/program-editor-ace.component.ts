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
      enableLiveAutocompletion: false,
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
          const staticWordCompleter = {
            getCompletions: (
              editor,
              session,
              pos,
              prefix: string,
              callback: Function
            ) => {
              let line: string = session.getLine(pos.row);
              let i = pos.column;
              if (i < line.length && i > 0) line = line.substring(0, i);
              const trimmed = line.trim();
              i = trimmed.indexOf(' ');
              const firstWord =
                i > 0
                  ? trimmed
                      .substring(0, i)
                      .toLowerCase()
                      .trim()
                  : trimmed;
              let params = [];
              if (firstWord.length > 0) {
                for (let options of OPTIONAL) {
                  if (options.cmd === firstWord) {
                    params = options.params;
                    break;
                  }
                }
              }
              if (line.charAt(line.length - prefix.length - 1) === '.') {
                const index = line.lastIndexOf(' ');
                let candidate = line
                  .substring(index + 1, line.length - 1)
                  .toLowerCase();
                if (candidate.charAt(candidate.length - 1) === '.')
                  candidate = candidate.substring(0, candidate.length - 1);
                let found = false;
                // COMPARE WITH GROUPS AND AXES
                for (let g of this.groups.groups) {
                  if (g.name.toLowerCase() === candidate) {
                    found = true;
                    break;
                  }
                  for (let a of g.axes) {
                    if (a.toLowerCase() === candidate) {
                      found = true;
                      break;
                    }
                  }
                }
                callback(
                  null,
                  this.keywords.wordList.map(function(word) {
                    return {
                      caption: word,
                      value: word,
                      meta: 'parameter',
                      type: 'parameter',
                    };
                  })
                );
              } else if (
                trimmed.charAt(trimmed.length - prefix.length - 1) === '='
              ) {
                let candidate;
                if (
                  trimmed.charAt(trimmed.length - prefix.length - 2) === ' '
                ) {
                  const parts = trimmed.split(' ');
                  candidate = parts[parts.length - 2].toLowerCase();
                } else {
                  const index = trimmed.lastIndexOf(' ');
                  candidate = trimmed
                    .substring(index + 1, trimmed.length - 1)
                    .toLowerCase();
                }
                let values: Values = null;
                for (let val of VALUES) {
                  if (val.attr === candidate) {
                    values = val;
                    break;
                  }
                }
                if (values === null) return;
                callback(
                  null,
                  values.values.map(function(val) {
                    return {
                      caption: val.val,
                      value: val.val,
                      meta: 'Value',
                      type: 'Value',
                      docHTML: '<div class="docs">' + val.doc + '</div>',
                    };
                  })
                );
              } else if (MOTION_COMMANDS.includes(firstWord)) {
                callback(
                  null,
                  this.data.robots
                    .map(function(robot) {
                      return {
                        caption: robot,
                        value: robot,
                        meta: 'Motion Element',
                        type: 'Motion Element',
                      };
                    })
                    .concat(
                      this.data.locations
                        .concat(this.data.joints)
                        .map(function(pos) {
                          return {
                            caption: pos.name,
                            value: pos.name,
                            meta: 'Position',
                            type: 'Position',
                          };
                        })
                        .concat(
                          params.map(function(param) {
                            return {
                              caption: param,
                              value: param,
                              meta: 'Optional',
                              type: 'Optional',
                            };
                          })
                        )
                    )
                );
              } else if (TASK_COMMANDS.includes(firstWord)) {
                callback(
                  null,
                  this.task.tasks.map(function(task) {
                    return {
                      caption: task.name,
                      value: task.name,
                      meta: 'Task',
                      type: 'Task',
                    };
                  })
                );
              } else if (PROGRAM_COMMANDS.includes(firstWord)) {
                callback(
                  null,
                  this.files.map(function(file) {
                    return {
                      caption: file.fileName,
                      value: file.fileName,
                      meta: 'File',
                      type: 'File',
                    };
                  })
                );
              } else if (params.length > 0) {
                callback(
                  null,
                  params.map(function(param) {
                    return {
                      caption: param,
                      value: param,
                      meta: 'Command Parameter',
                      type: 'Command Parameter',
                    };
                  })
                );
              } else {
                callback(
                  null,
                  this.commands
                    .map<any>(function(cmd) {
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
                    })
                    .concat(
                      this.keywords.wordList.map(function(word) {
                        return {
                          caption: word,
                          value: word,
                          meta: 'parameter',
                          type: 'parameter',
                        };
                      })
                    )
                    .concat(
                      this.keywords.keywords.map(function(word) {
                        return {
                          caption: word,
                          value: word,
                          meta: 'keyword',
                          type: 'keyword',
                        };
                      })
                    )
                );
              }
            },
          };
          this.editor.completers = [staticWordCompleter];
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
