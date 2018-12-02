import { Component, OnInit, ViewChild, ElementRef, ApplicationRef, NgZone} from '@angular/core';
import {ProgramEditorService, ProgramStatus, TASKSTATE_NOTLOADED, TRNERRLine} from '../../services/program-editor.service';
import {ApiService} from '../../../../modules/core/services/api.service';
import {MCCommand} from '../../../home-screen/components/terminal/terminal.component';
import {GroupManagerService} from '../../../../modules/core/services/group-manager.service';
import {Subscription} from 'rxjs';
import {DataService, TaskService, MCFile, ProjectManagerService, WebsocketService, MCQueryResponse} from '../../../core';
import {MatSnackBar} from '@angular/material';

declare var ace;

const MOTION_COMMANDS = ['move','moves','circle'];
const TASK_COMMANDS = ['unload','idle','kill'];
const PROGRAM_COMMANDS = ['load'];
const OPTIONAL: OptionalParams[] = [
  {
    cmd: 'move',
    params: ['Vcruise','Acc','Dec'],
  },
  {
    cmd: 'circle',
    params: ['Angle','CircleCenter','CirclePlane','CirclePoint','TargetPoint'],
  }
];
const VALUES : Values[] = [
  {
    attr: 'blendingmethod',
    values: [
      {val:'0',doc:'No blending'},
      {val:'1',doc:'CP (continuous path)'},
      {val:'2',doc:'SP (superposition)'},
      {val:'3',doc:'3 – AI (advance interpolation)'},
      {
        val:'4',
        doc:'CP<br>Same as 1, but instead of distance, this CP blending is defined by percentage with BlendingFactor'
      }
    ]
  },
];

@Component({
  selector: 'program-editor-ace',
  templateUrl: './program-editor-ace.component.html',
  styleUrls: ['./program-editor-ace.component.css']
})
export class ProgramEditorAceComponent implements OnInit {
  
  @ViewChild('editor') editorDiv : ElementRef;
  private editor : any;
  private Range = ace.require('ace/range').Range;
  private currRange:any;
  private markers : any[] = [];
  private subs: Subscription;
  private commands: Command[];
  private files: MCFile[];
  
  // HANDLE MOUSE HOVER TOOLTIPS
  private tooltipTimeout: any;
  lastWord: string;
  tooltipValue: string;
  tooltipVisible: boolean = false;
  tooltipX: number;
  tooltipY: number;

  constructor(
    private service : ProgramEditorService,
    private api : ApiService,
    private groups: GroupManagerService,
    private zone: NgZone,
    private ref: ApplicationRef,
    private data: DataService,
    private task: TaskService,
    private prj: ProjectManagerService,
    private ws: WebsocketService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.task.start();
    this.service.refreshStatus(true);
    this.subs = this.service.editorTextChange.subscribe(text=>{
      this.removeAllMarkers();
      if (this.editor)
        this.editor.setValue((text || ''),-1);
    });
    this.subs.add(this.service.statusChange.subscribe((stat:ProgramStatus)=>{
      this.removeAllMarkers();
      this.editor.setReadOnly(
        stat === null || stat.statusCode !== TASKSTATE_NOTLOADED
      );
      if (stat.programLine > 0) {
        this.highlightLine(stat.programLine);
        this.editor.scrollToLine(stat.programLine,true, true,null);
      }
      if (stat.statusCode === TASKSTATE_NOTLOADED)
        this.setBreakpoints('');
    }));
    this.subs.add(this.service.errLinesChange.subscribe(lines=>{
      this.highlightErrors(lines);
    }));
    this.subs.add(this.service.onInsertAndJump.subscribe(ret=>{
      if (ret)
        this.insertAndJump(ret.cmd,ret.lines);
    }));
    this.subs.add(this.service.onReplaceRange.subscribe(ret=>{
      if (ret)
        this.replaceRange(ret);
    }));
    this.subs.add(this.service.onReplaceLine.subscribe(ret=>{
      if (ret)
        this.replaceLine(ret.index,ret.cmd);
    }));
    this.subs.add(this.service.skipLineRequest.subscribe((line:number)=>{
      if (line) {
        this.editor.scrollToLine(line,true, true,null);
      }
    }));
    this.subs.add(this.service.fileChange.subscribe((fileName)=>{
      if (fileName.endsWith('B'))
        return this.setBreakpoints('');
      const app = fileName.substring(0, fileName.indexOf('.'));
      const prjAndApp = '"' + this.prj.currProject.value.name + '","' + app + '"';
      this.ws.query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')').then((ret: MCQueryResponse)=>{
        this.setBreakpoints(ret.result);
      });
      this.editor.getSession().setUndoManager(new ace.UndoManager());
    }));
    this.subs.add(this.service.dragEnd.subscribe(()=>{
      if (this.editor)
        this.editor.resize();
    }));
    this.subs.add(this.service.onUndo.subscribe(()=>{
      if (this.editor)
        this.editor.undo();
    }));
    this.subs.add(this.service.onRedo.subscribe(()=>{
      if (this.editor)
        this.editor.redo();
    }));
    this.subs.add(this.service.onFind.subscribe(()=>{
      if (this.editor)
        this.editor.execCommand("find");
    }));
    this.subs.add(this.service.onReplace.subscribe(()=>{
      if (this.editor)
        this.editor.execCommand("replace");
    }));
  }
  
  ngAfterViewInit() {
    this.zone.runOutsideAngular(()=>{
      this.initEditor();
    });
  }
  
  ngOnDestroy() {
    this.subs.unsubscribe();
    this.task.stop();
    this.service.refreshStatus(false);
  }
  
  private replaceLine(index : number, newLine : string) {
    let editor = this.editor;
    let line : string = editor.session.getLine(index);
    let tabs = Array(this.numberOfTabs(line) + 1).join('\t');
    let txtLines = newLine.split('\n');
    for (let i = 0; i < txtLines.length; i++)
      txtLines[i] = tabs + txtLines[i];
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
    var line : string = editor.session.getLine(row);
    // get current indentation
    let tabs = Array(this.numberOfTabs(line) + 1).join('\t');
    let txtLines = txt.split('\n');
    for (let i = 1; i < txtLines.length; i++)
      txtLines[i] = tabs + txtLines[i];
    txt = txtLines.join('\n');
    this.editor.session.replace(
      this.editor.selection.getRange(),
      txt
    );
  }
  
  private numberOfTabs(text : string) {
    let count = 0;
    let index = 0;
    let spaceIndex = 0;
    if (text === null || text.length === 0)
      return 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i)===32)
        spaceIndex++;
      else
        break;
      if (spaceIndex%4 === 0)
        count++;
    }
    while (text.charAt(index++) === "\t") {
      count++;
    }
    return count;
  }
  
  private insertAndJump(txt : string, lines : number) {
    let editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
    var line : string = editor.session.getLine(row);
    var column = line.length; // end of line
    editor.gotoLine(row + 1, column);
    // get current indentation
    let tabs = Array(this.numberOfTabs(line) + 1).join('\t');
    let txtLines = txt.split('\n');
    for (let i = 1; i < txtLines.length; i++)
      txtLines[i] = tabs + txtLines[i];
    txt = txtLines.join('\n');
    if (line.trim().length > 0) {
      txt = '\n' + tabs + txt;
    } else {
      lines--;
    }
    editor.insert(txt + "\n" + tabs);
    if (lines <= 0)
      return editor.focus();
    position = editor.getCursorPosition();
    row += lines;
    column = editor.session.getLine(row).length; // end of line
    editor.gotoLine(row + 1, column);
    editor.focus();
  }
  
  private initEditor() {
    this.editor = ace.edit(this.editorDiv.nativeElement);
    this.editor.setOptions({
      fontSize: '14px',
      showPrintMargin: false,
      theme: "ace/theme/eclipse",
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true
    });
    this.api.getDocs().then(result=>{
      this.commands = result;
    }).then(() => {return this.api.getFiles();}).then(files=>{
      this.files = files;
    }).then(()=>{return this.api.getMCKeywords();}).then(keywords=>{
      ace.define("ace/mode/mcbasic_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){
	var e=this.createKeywordMapper({"keyword.control.asp":keywords+"|common|shared|try|catch|long|double|sys|din|dout|Program|TargetPoint|If|Then|Else|ElseIf|End|While|Wend|For|To|Each|Case|Select|Return|Continue|Do|Until|Loop|Next|With|Exit|Function|Property|Type|Enum|Sub|IIf",
	"storage.type.asp":"Dim|Call|Class|Const|Dim|Redim|Set|Let|Get|New|Randomize|Option|Explicit","storage.modifier.asp":"Private|Public|Default","keyword.operator.asp":"Mod|And|Not|Or|Xor|as","constant.language.asp":"Empty|False|Nothing|Null|True","support.class.asp":"Application|ObjectContext|Request|Response|Server|Session","support.class.collection.asp":"Contents|StaticObjects|ClientCertificate|Cookies|Form|QueryString|ServerVariables","support.constant.asp":"TotalBytes|Buffer|CacheControl|Charset|ContentType|Expires|ExpiresAbsolute|IsClientConnected|PICS|Status|ScriptTimeout|CodePage|LCID|SessionID|Timeout","support.function.asp":"Lock|Unlock|SetAbort|SetComplete|BinaryRead|AddHeader|AppendToLog|BinaryWrite|Clear|Flush|Redirect|Write|CreateObject|HTMLEncode|MapPath|URLEncode|Abandon|Convert|Regex","support.function.event.asp":"Application_OnEnd|Application_OnStart|OnTransactionAbort|OnTransactionCommit|Session_OnEnd|Session_OnStart","support.function.vb.asp":"Array|Add|Asc|Atn|CBool|CByte|CCur|CDate|CDbl|Chr|CInt|CLng|Conversions|Cos|CreateObject|CSng|CStr|Date|DateAdd|DateDiff|DatePart|DateSerial|DateValue|Day|Derived|Math|Escape|Eval|Exists|Exp|Filter|FormatCurrency|FormatDateTime|FormatNumber|FormatPercent|GetLocale|GetObject|GetRef|Hex|Hour|InputBox|InStr|InStrRev|Int|Fix|IsArray|IsDate|IsEmpty|IsNull|IsNumeric|IsObject|Item|Items|Join|Keys|LBound|LCase|Left|Len|LoadPicture|Log|LTrim|RTrim|Trim|Maths|Mid|Minute|Month|MonthName|MsgBox|Now|Oct|Remove|RemoveAll|Replace|RGB|Right|Rnd|Round|ScriptEngine|ScriptEngineBuildVersion|ScriptEngineMajorVersion|ScriptEngineMinorVersion|Second|SetLocale|Sgn|Sin|Space|Split|Sqr|StrComp|String|StrReverse|Tan|Time|Timer|TimeSerial|TimeValue|TypeName|UBound|UCase|Unescape|VarType|Weekday|WeekdayName|Year","support.type.vb.asp":"vbtrue|vbfalse|vbcr|vbcrlf|vbformfeed|vblf|vbnewline|vbnullchar|vbnullstring|int32|vbtab|vbverticaltab|vbbinarycompare|vbtextcomparevbsunday|vbmonday|vbtuesday|vbwednesday|vbthursday|vbfriday|vbsaturday|vbusesystemdayofweek|vbfirstjan1|vbfirstfourdays|vbfirstfullweek|vbgeneraldate|vblongdate|vbshortdate|vblongtime|vbshorttime|vbobjecterror|vbEmpty|vbNull|vbInteger|vbLong|vbSingle|vbDouble|vbCurrency|vbDate|vbString|vbObject|vbError|vbBoolean|vbVariant|vbDataObject|vbDecimal|vbByte|vbArray"},"identifier",!0);this.$rules={start:[{token:["meta.ending-space"],regex:"$"},{token:[null],regex:"^(?=\\t)",next:"state_3"},{token:[null],regex:"^(?= )",next:"state_4"},{token:["text","storage.type.function.asp","text","entity.name.function.asp","text","punctuation.definition.parameters.asp","variable.parameter.function.asp","punctuation.definition.parameters.asp"],regex:"^(\\s*)(Function|Sub)(\\s+)([a-zA-Z_]\\w*)(\\s*)(\\()([^)]*)(\\))"},{token:"punctuation.definition.comment.asp",regex:"'$|REM(?=\\s|$)$",next:"start",caseInsensitive:!0},{token:"punctuation.definition.comment.asp",regex:"'|REM(?=\\s|$)",next:"comment",caseInsensitive:!0},{token:"storage.type.asp",regex:"On Error Resume Next|On Error GoTo",caseInsensitive:!0},{token:"punctuation.definition.string.begin.asp",regex:'"',next:"string"},{token:["punctuation.definition.variable.asp"],regex:"(\\$)[a-zA-Z_x7f-xff][a-zA-Z0-9_x7f-xff]*?\\b\\s*"},{regex:"\\w+",token:e},{token:["entity.name.function.asp"],regex:"(?:(\\b[a-zA-Z_x7f-xff][a-zA-Z0-9_x7f-xff]*?\\b)(?=\\(\\)?))"},{token:["keyword.operator.asp"],regex:"\\-|\\+|\\*\\/|\\>|\\<|\\=|\\&"}],state_3:[{token:["meta.odd-tab.tabs","meta.even-tab.tabs"],regex:"(\\t)(\\t)?"},{token:"meta.leading-space",regex:"(?=[^\\t])",next:"start"},{token:"meta.leading-space",regex:".",next:"state_3"}],state_4:[{token:["meta.odd-tab.spaces","meta.even-tab.spaces"],regex:"(  )(  )?"},{token:"meta.leading-space",regex:"(?=[^ ])",next:"start"},{defaultToken:"meta.leading-space"}],comment:[{token:"comment.line.apostrophe.asp",regex:"$|(?=(?:%>))",next:"start"},{defaultToken:"comment.line.apostrophe.asp"}],string:[{token:"constant.character.escape.apostrophe.asp",regex:'""'},{token:"string.quoted.double.asp",regex:'"',next:"start"},{defaultToken:"string.quoted.double.asp"}]}};r.inherits(s,i),t.VBScriptHighlightRules=s}),ace.define("ace/mode/mcbasic",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/mcbasic_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./mcbasic_highlight_rules").VBScriptHighlightRules,o=function(){this.HighlightRules=s};r.inherits(o,i),function(){this.lineCommentStart=["'","REM"],this.$id="ace/mode/mcbasic"}.call(o.prototype),t.Mode=o});
      return this.api.getMCProperties();
    }).then((cmds:MCCommand[])=>{
      let wordList : string[] = [];
      for (let cmd of cmds) {
        wordList.push(cmd.text);
      }
      const staticWordCompleter = {
        getCompletions: (editor, session, pos, prefix:string, callback:Function)=>{
          let line: string = session.getLine(pos.row);
          let i = pos.column;
          if (i < line.length && i>0)
            line = line.substring(0,i);
          const trimmed = line.trim();
          i = trimmed.indexOf(' ');
          const firstWord = i > 0 ? trimmed.substring(0, i).toLowerCase().trim() : trimmed;
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
            let candidate = line.substring(index+1, line.length - 1).toLowerCase();
            if (candidate.charAt(candidate.length-1)==='.')
              candidate = candidate.substring(0, candidate.length-1);
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
            callback(null, wordList.map(function(word) {
              return {
                caption: word,
                value: word,
                meta: "parameter",
                type: 'parameter'
              };
            }));
          } else if (trimmed.charAt(trimmed.length - prefix.length - 1) === '=') {
            let candidate;
            if (trimmed.charAt(trimmed.length - prefix.length - 2) === ' ') {
              const parts = trimmed.split(' ');
              candidate = parts[parts.length - 2].toLowerCase();
            } else {
              const index = trimmed.lastIndexOf(' ');
              candidate = trimmed.substring(index+1, trimmed.length - 1).toLowerCase();              
            }
            let values: Values = null;
            for (let val of VALUES) {
              if (val.attr === candidate) {
                values = val;
                break;
              }
            }
            if (values === null)
              return;
            callback(null, values.values.map(function(val) {
              return {
                caption: val.val,
                value: val.val,
                meta: "Value",
                type: 'Value',
                docHTML: '<div class="docs">' + val.doc + '</div>'
              };
            }));
          } else if (MOTION_COMMANDS.includes(firstWord)) {
            callback(null, this.data.robots.map(function(robot) {
              return {
                caption: robot,
                value: robot,
                meta: "Motion Element",
                type: 'Motion Element'
              };
            }).concat(this.data.locations.concat(this.data.joints).map(function(pos) {
              return {
                caption: pos.name,
                value: pos.name,
                meta: "Position",
                type: 'Position'
              };
            }).concat(params.map(function(param){
              return {
                caption: param,
                value: param,
                meta: "Optional",
                type: 'Optional'
              };
            }))));
          } else if (TASK_COMMANDS.includes(firstWord)) {
            callback(null, this.task.tasks.map(function(task) {
              return {
                caption: task.name,
                value: task.name,
                meta: "Task",
                type: 'Task'
              };
            }));
          } else if (PROGRAM_COMMANDS.includes(firstWord)) {
            callback(null, this.files.map(function(file) {
              return {
                caption: file.fileName,
                value: file.fileName,
                meta: "File",
                type: 'File'
              };
            }));
          } else if (params.length > 0) {
            callback(null, params.map(function(param) {
              return {
                caption: param,
                value: param,
                meta: "Command Parameter",
                type: 'Command Parameter'
              };
            }));
          } else {
            callback(null, this.commands.map(function(cmd) {
              return {
                caption: cmd.name,
                value: cmd.name,
                meta: "command",
                type: 'command',
                docHTML: '<div class="docs"><b>' + cmd.name + '<br><br>Syntax: </b>' + cmd.syntax + '<br><b>Description:</b><br>' + cmd.description + '</div>'
              };
            }));
          }
        }
      }
      this.editor.completers = [staticWordCompleter];
      this.editor.getSession().setMode("ace/mode/mcbasic");
    });
    this.editor.$blockScrolling = Infinity;
    if (this.service.editorText)
      this.editor.setValue(this.service.editorText,-1);
    else 
      this.editor.setReadOnly(true);
    this.editor.getSession().on('change',e=>{
      this.service.isDirty = true;
      var breakpointsArray = Object.keys(this.editor.session.getBreakpoints());
      var breakpoint;
      var prevBreakpoint = -1;
      if(breakpointsArray.length > 0){
        if(e.lines.length>1){
          var lines = e.lines.length -1;
          var start = e.start.row;
          var end = e.end.row;
          if (e.action === 'insert'){
            for (var i=0; i<breakpointsArray.length; i++) {
              breakpoint = parseInt(breakpointsArray[i]);
              if (i>0)
                prevBreakpoint = parseInt(breakpointsArray[i-1]);
              else
                prevBreakpoint = -1;
              if(breakpoint>start){
                if (prevBreakpoint === -1 || prevBreakpoint !== breakpoint - 1)
                  this.editor.session.clearBreakpoint(breakpoint);
                this.editor.session.setBreakpoint(breakpoint + lines);
              }
            }
          } else if(e.action==='remove'){
            for (var i=0; i<breakpointsArray.length; i++) {
              breakpoint = parseInt(breakpointsArray[i]);
              if(breakpoint>start && breakpoint<end ){
                this.editor.session.clearBreakpoint(breakpoint);
              }
              if(breakpoint>=end ){
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
    this.editor.getSession().getSelection().on('changeCursor', (e)=>{
      const range = this.editor.session.getSelection().getRange();
      let rowIndex : number = this.editor.session.getSelection().getSelectionAnchor().row;
      let row : string = this.editor.session.getLine(rowIndex);
      this.zone.run(()=>{
        if (this.editor.getSelectedText().length === 0)
          this.service.onAceEditorCursorChange(rowIndex,row);
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
    this.editor.on("guttermousedown", this.editor.$breakpointListener = (e)=>{
      if (this.service.activeFile.endsWith('B') || this.service.backtrace) {
        this.zone.run(()=>{
          this.snack.open('Library breakpoints are not supported yet','DISMISS');
        });
        return;
      }
      if (this.service.status === null || this.service.status.statusCode === TASKSTATE_NOTLOADED) {// PROGRAM NOT LOADED OR IS LIBRARY
        this.zone.run(()=>{
          this.snack.open('Breakpoints can only be inserted on a loaded file','DISMISS');
        });
        return;
      }
      const app = this.service.activeFile.substring(0, this.service.activeFile.indexOf('.'));
      const prjAndApp = '"' + this.prj.currProject.value.name + '","' + app + '"';
      let changedFlag = false;
      e.stop();
      const line = e.getDocumentPosition().row;
      const bpts = Object.keys(this.editor.getSession().getBreakpoints());
      for (let i=0; i<bpts.length && !changedFlag; i++) {
        if (line == bpts[i]) {
          changedFlag = true;
          this.ws.query('?TP_TOGGLE_APP_BREAKPOINT(' + prjAndApp + ',' + (line + 1) + ')').then((ret: MCQueryResponse)=>{
            if (ret.err)
              return;
            this.ws.query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')').then((ret: MCQueryResponse)=>{
              this.setBreakpoints(ret.result);
            });
          });
        }
      }
      if (!changedFlag) {
        this.ws.query('?TP_TOGGLE_APP_BREAKPOINT(' + prjAndApp + ',' + (line + 1) + ')').then((ret: MCQueryResponse)=>{
          if (ret.err)
            return;
          this.ws.query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')').then((ret: MCQueryResponse)=>{
            this.setBreakpoints(ret.result);
          });
        });
      }
    });
    // HANDLE MOUSE HOVER OVER WORDS
    this.editor.on('mousemove', (e)=> {
      if (this.service.status === null || this.service.status.statusCode !== 2)
        return this.hideTooltip();
      const position = e.getDocumentPosition();
      const token = this.editor.session.getTokenAt(position.row,position.column);
      if (token === null)
        return this.hideTooltip();
      if (token.value === this.lastWord)
        return;
      this.hideTooltip();
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
      this.lastWord = token.value;
      if (this.lastWord.trim().length === 0 || this.lastWord === ' ')
        return;
      const cmd1 = 'watch ' + this.service.activeFile + ' ' + token.value;
      const cmd2 = 'watch ' + token.value;
      this.tooltipTimeout = setTimeout(()=>{
        this.ws.query(cmd1).then((ret: MCQueryResponse)=>{
          if (ret.err) {
            return this.ws.query(cmd2).then((ret: MCQueryResponse)=>{
              if (ret.err)
                return;
              this.tooltipX = e.domEvent.offsetX + 50;
              this.tooltipY = e.domEvent.offsetY + 120;
              this.tooltipVisible = true;
              this.tooltipValue = ret.result;
              this.ref.tick();
            });
          }
          this.tooltipX = e.domEvent.offsetX + 50;
          this.tooltipY = e.domEvent.offsetY + 120;
          this.tooltipVisible = true;
          this.tooltipValue = ret.result;
          this.ref.tick();
        });
      },500);
      
      
    });
    if (this.service.activeFile) {
      const app = this.service.activeFile.substring(0, this.service.activeFile.indexOf('.'));
      const prjAndApp = '"' + this.prj.currProject.value.name + '","' + app + '"';
      this.ws.query('?TP_GET_APP_BREAKPOINTS_LIST(' + prjAndApp + ')').then((ret: MCQueryResponse)=>{
        this.setBreakpoints(ret.result);
      });
    }
  }
  
  private hideTooltip() {
    this.tooltipVisible = false;
  }
  
  private setBreakpoints(bptsString:string){
    this.editor.getSession().clearBreakpoints();
    let bpts = bptsString.split(',');
    for (let bp of bpts) {
      let n = Number(bp);
      if (isNaN(n))
        continue;
      this.editor.getSession().setBreakpoint(n-1, "ace_breakpoint");
    }
  }
  
  highlightLine (line:number) {
    if (this.editor === null)
      return;
    if (this.currRange)
      this.editor.session.removeMarker(this.currRange);
    this.currRange = this.editor.session.addMarker(
      new this.Range(line, 0, line, 1),
      "line-highlight", "fullLine"
    );
    this.markers.push(this.currRange);
  }
  
  highlightErrors(lines : TRNERRLine[]) {
    if (this.editor === null)
      return;
    this.removeAllMarkers();
    for (let line of lines) {
      this.markers.push(this.editor.session.addMarker(
        new this.Range(line.number-1, 0, line.number-1, 1),
        "line-highlight-error", "fullLine"
      ));
    }
  }
  
  removeAllMarkers() {
    if (this.editor === null)
      return;
    while (this.markers.length > 0) {
      this.editor.session.removeMarker(this.markers.pop());
    }
  }

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