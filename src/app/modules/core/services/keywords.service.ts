import {Injectable} from "@angular/core";
import {ApiService} from "./api.service";
import {BehaviorSubject} from "rxjs";
import {MCKeyword} from "../models/mc-keyword.model";
import {GroupManagerService} from "./group-manager.service";

declare var ace;

@Injectable({
  providedIn: 'root'
})
export class KeywordService {
  
  initDone: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  get staticWordCompleter() {
    return this._staticWordCompleter;
  }
  
  get wordList() {
    return this._wordList;
  }
  
  get keywords() {
    return this._keywords;
  }
  
  private _staticWordCompleter: any = null;
  private _wordList: string[];
  private _keywords: string[];
  
  
  constructor(private api: ApiService, private groups: GroupManagerService) {
    this.api.getMCKeywords().then(keywords=>{
      this._keywords = keywords.split('|');
      ace.define("ace/mode/mcbasic_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){
	var e=this.createKeywordMapper({"keyword.control.asp":keywords+"|common|shared|try|catch|long|double|sys|din|dout|Program|TargetPoint|If|Then|Else|ElseIf|End|While|Wend|For|To|Each|Case|Select|Return|Continue|Do|Until|Loop|Next|With|Exit|Function|Property|Type|Enum|Sub|IIf",
	"storage.type.asp":"Dim|Call|Class|Const|Dim|Redim|Set|Let|Get|New|Randomize|Option|Explicit","storage.modifier.asp":"Private|Public|Default","keyword.operator.asp":"Mod|And|Not|Or|Xor|as","constant.language.asp":"Empty|False|Nothing|Null|True","support.class.asp":"Application|ObjectContext|Request|Response|Server|Session","support.class.collection.asp":"Contents|StaticObjects|ClientCertificate|Cookies|Form|QueryString|ServerVariables","support.constant.asp":"TotalBytes|Buffer|CacheControl|Charset|ContentType|Expires|ExpiresAbsolute|IsClientConnected|PICS|Status|ScriptTimeout|CodePage|LCID|SessionID|Timeout","support.function.asp":"Lock|Unlock|SetAbort|SetComplete|BinaryRead|AddHeader|AppendToLog|BinaryWrite|Clear|Flush|Redirect|Write|CreateObject|HTMLEncode|MapPath|URLEncode|Abandon|Convert|Regex","support.function.event.asp":"Application_OnEnd|Application_OnStart|OnTransactionAbort|OnTransactionCommit|Session_OnEnd|Session_OnStart","support.function.vb.asp":"Array|Add|Asc|Atn|CBool|CByte|CCur|CDate|CDbl|Chr|CInt|CLng|Conversions|Cos|CreateObject|CSng|CStr|Date|DateAdd|DateDiff|DatePart|DateSerial|DateValue|Day|Derived|Math|Escape|Eval|Exists|Exp|Filter|FormatCurrency|FormatDateTime|FormatNumber|FormatPercent|GetLocale|GetObject|GetRef|Hex|Hour|InputBox|InStr|InStrRev|Int|Fix|IsArray|IsDate|IsEmpty|IsNull|IsNumeric|IsObject|Item|Items|Join|Keys|LBound|LCase|Left|Len|LoadPicture|Log|LTrim|RTrim|Trim|Maths|Mid|Minute|Month|MonthName|MsgBox|Now|Oct|Remove|RemoveAll|Replace|RGB|Right|Rnd|Round|ScriptEngine|ScriptEngineBuildVersion|ScriptEngineMajorVersion|ScriptEngineMinorVersion|Second|SetLocale|Sgn|Sin|Space|Split|Sqr|StrComp|String|StrReverse|Tan|Time|Timer|TimeSerial|TimeValue|TypeName|UBound|UCase|Unescape|VarType|Weekday|WeekdayName|Year","support.type.vb.asp":"vbtrue|vbfalse|vbcr|vbcrlf|vbformfeed|vblf|vbnewline|vbnullchar|vbnullstring|int32|vbtab|vbverticaltab|vbbinarycompare|vbtextcomparevbsunday|vbmonday|vbtuesday|vbwednesday|vbthursday|vbfriday|vbsaturday|vbusesystemdayofweek|vbfirstjan1|vbfirstfourdays|vbfirstfullweek|vbgeneraldate|vblongdate|vbshortdate|vblongtime|vbshorttime|vbobjecterror|vbEmpty|vbNull|vbInteger|vbLong|vbSingle|vbDouble|vbCurrency|vbDate|vbString|vbObject|vbError|vbBoolean|vbVariant|vbDataObject|vbDecimal|vbByte|vbArray"},"identifier",!0);this.$rules={start:[{token:["meta.ending-space"],regex:"$"},{token:[null],regex:"^(?=\\t)",next:"state_3"},{token:[null],regex:"^(?= )",next:"state_4"},{token:["text","storage.type.function.asp","text","entity.name.function.asp","text","punctuation.definition.parameters.asp","variable.parameter.function.asp","punctuation.definition.parameters.asp"],regex:"^(\\s*)(Function|Sub)(\\s+)([a-zA-Z_]\\w*)(\\s*)(\\()([^)]*)(\\))"},{token:"punctuation.definition.comment.asp",regex:"'$|REM(?=\\s|$)$",next:"start",caseInsensitive:!0},{token:"punctuation.definition.comment.asp",regex:"'|REM(?=\\s|$)",next:"comment",caseInsensitive:!0},{token:"storage.type.asp",regex:"On Error Resume Next|On Error GoTo",caseInsensitive:!0},{token:"punctuation.definition.string.begin.asp",regex:'"',next:"string"},{token:["punctuation.definition.variable.asp"],regex:"(\\$)[a-zA-Z_x7f-xff][a-zA-Z0-9_x7f-xff]*?\\b\\s*"},{regex:"\\w+",token:e},{token:["entity.name.function.asp"],regex:"(?:(\\b[a-zA-Z_x7f-xff][a-zA-Z0-9_x7f-xff]*?\\b)(?=\\(\\)?))"},{token:["keyword.operator.asp"],regex:"\\-|\\+|\\*\\/|\\>|\\<|\\=|\\&"}],state_3:[{token:["meta.odd-tab.tabs","meta.even-tab.tabs"],regex:"(\\t)(\\t)?"},{token:"meta.leading-space",regex:"(?=[^\\t])",next:"start"},{token:"meta.leading-space",regex:".",next:"state_3"}],state_4:[{token:["meta.odd-tab.spaces","meta.even-tab.spaces"],regex:"(  )(  )?"},{token:"meta.leading-space",regex:"(?=[^ ])",next:"start"},{defaultToken:"meta.leading-space"}],comment:[{token:"comment.line.apostrophe.asp",regex:"$|(?=(?:%>))",next:"start"},{defaultToken:"comment.line.apostrophe.asp"}],string:[{token:"constant.character.escape.apostrophe.asp",regex:'""'},{token:"string.quoted.double.asp",regex:'"',next:"start"},{defaultToken:"string.quoted.double.asp"}]}};r.inherits(s,i),t.VBScriptHighlightRules=s}),ace.define("ace/mode/mcbasic",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/mcbasic_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./mcbasic_highlight_rules").VBScriptHighlightRules,o=function(){this.HighlightRules=s};r.inherits(o,i),function(){this.lineCommentStart=["'","REM"],this.$id="ace/mode/mcbasic"}.call(o.prototype),t.Mode=o});
      return this.api.getMCProperties();
    }).then((cmds:MCKeyword[])=>{
      let wordList : string[] = [];
      for (let cmd of cmds) {
        wordList.push(cmd.text);
      }
      this._wordList = wordList;
      this._staticWordCompleter = {
        getCompletions: (editor, session, pos, prefix:string, callback:Function)=>{
          let line: string = session.getLine(pos.row);
          const i = pos.column;
          if (i < line.length && i>0)
            line = line.substring(0,i);
          if (line.charAt(line.length - prefix.length - 1) === '.') {
            const index = line.lastIndexOf(' ');
            let candidate = line.substring(index+1, line.length - 1).toLowerCase();
            if (candidate.charAt(candidate.length-1)==='.')
              candidate = candidate.substring(0, candidate.length-1);
            let found = false;
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
            if (!found)
              return;
            callback(null, wordList.map(function(word) {
              return {
                caption: word,
                value: word,
                meta: "parameter"
              };
            }));
          }
        }
      };
      this.initDone.next(true);
    });
  }
  
  
  
}