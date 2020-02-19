import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';
import { MCKeyword } from '../models/mc-keyword.model';
import { GroupManagerService } from './group-manager.service';
import { DOCS } from '../defs/docs.constants';
import { DataService } from './data.service';

declare var ace;

@Injectable({
  providedIn: 'root',
})
export class KeywordService {

  initDone: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private snippetManager = ace.require("./snippets").snippetManager;
  private TokenIterator = ace.require('ace/token_iterator').TokenIterator;
  private HashHandler = ace.require('ace/keyboard/hash_handler').HashHandler;

  // AUTOCOMPLETE
  private ovrldIndx = 0;
  private lastContext: string;

  get wordList() {
    return this._wordList;
  }

  get keywords() {
    return this._keywords;
  }

  private _wordList: string[];
  private _keywords: string[];

  constructor(
    private api: ApiService,
    private data: DataService,
    private groups: GroupManagerService) {

    this.defineFolding();
    //this.defineWorker();

    this.api
      .getMCKeywords()
      .then(keywords => {
        this._keywords = keywords.split('|');
        return this.api.getMCProperties();
      })
      .then((cmds: MCKeyword[]) => {
        const wordList: string[] = [];
        for (const cmd of cmds) {
          wordList.push(cmd.text);
        }
        this._wordList = wordList;
        this.initDone.next(true);
      });
  }

  /*
    RETURN THE AUTOCOMPLETE OBJECTS.

    IF disableNewLines IS TRUE, PRESSING "ENTER" WILL ADD A SPACE INSTEAD OF AN ENTER.
    THIS IS USED FOR TERMINAL.
  */
  getNewWordCompleter(disableNewLines?: boolean) {
    return {
      getCompletions: (editor,session,pos,prefix: string,callback: Function) => {
        //console.log('get completions');
        if (!editor.initMcCompleter) {
          editor.initMcCompleter = true;
          // INIT TAB HANDLER
          editor.completer.commands['Tab'] = e=>{
            session.bgTokenizer.start(0);
            const completer = editor.completer;
            const noCompletions = completer && !completer.completions;
            const isActivated = completer && completer.activated;
            if (noCompletions) {
              completer.detach();
              editor.insert('\t');
            } else if (isActivated) {
              const row = completer.popup.getRow();
              const data = completer.popup.getData(row);
              if (data && data.snippet) {
                const result = editor.completer.insertMatch();
                return result;
              }
              else if (data) {
                const cmd = data.cmd;
                if (!cmd || cmd.length === 1) {
                  const result = editor.completer.insertMatch();
                  if (!result && !editor.tabstopManager) {
                      editor.completer.goTo("down");
                  } else {
                      return result;
                  }
                  return;
                }
                if (this.ovrldIndx >= cmd.length) {
                  this.ovrldIndx = 0;
                }
                if (cmd && this.ovrldIndx === cmd.length - 1) {
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
        }
        const stream = new this.TokenIterator(session, pos.row, pos.column);
        let token = stream.getCurrentToken();
        let context: string = null;
        const cursorPosition = editor.getCursorPosition();
        const line: string = session.getLine(pos.row).substring(0,cursorPosition.column);
        const trimmed = line.trim();
        const isComment = /^(?:'|REM).*/i.test(trimmed);
        if (!token || trimmed.length === 0 || isComment) {
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
          } else if (!token) {
            token = stream.stepForward();
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
        const isGroup = this.groups.groups.find(g=>{
          return g.name.toLowerCase() === context;
        });
        const axes = [].concat.apply([],this.groups.groups.map(g=>{
          return g.axes;
        })) as string[];
        const isAxis = axes.find(a=>{
          return a.toLowerCase() === context;
        });
        if (isGroup && line.endsWith('.')) {
          // GROUP FOUND
          this.resetOvrldIndex(context);
          return callback(null, DOCS.element.concat(DOCS.group).map(param=>{
            const name = param.short || param.name;
            return {
              caption: name,
              value: name + ' ',
              meta: context + ' property',
              type: context + ' property',
              docHTML: this.getParamDoc(param, name),
              context,
              param
            };
          }));
        }
        if (isAxis && line.endsWith('.')) {
          // AXIS FOUND
          this.resetOvrldIndex(context);
          return callback(null, DOCS.axis.concat(DOCS.element).map(param=>{
            const name = param.short || param.name;
            return {
              caption: name,
              value: name + ' ',
              meta: context + ' property',
              type: context + ' property',
              docHTML: this.getParamDoc(param, name),
              context,
              param
            };
          }));
        }
        // STEP 1 - COMPARE CONTEXT TO OBJECTS
        if (DOCS.ac_objects.includes(context) && line.endsWith('.')) {
          // OBJECT FOUND
          this.resetOvrldIndex(context);
          return callback(null, DOCS.objects[context].map(param=>{
            const name = param.short || param.name;
            return {
              caption: name,
              value: name + ' ',
              meta: context + ' property',
              type: context + ' property',
              docHTML: this.getParamDoc(param, name),
              context,
              param
            };
          }));
        }
        // COMPARE CONTEXT TO GROUP/ELEMENT/AXES OBJECTS
        const obj = DOCS.axis.concat(DOCS.group).concat(DOCS.element).filter(o=>{
          return o.type === 5;
        }).find(o=>{
          return o.name.toLowerCase() === context;
        });
        if (obj && line.endsWith('.')) {
          return callback(null, obj['children'].map(param=>{
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
        }
        if (line.endsWith('.')) {
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
          if (linePos > 0 && linePos < parts.length) {
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
              const doc = this.getOverloadDoc(cmd, this.ovrldIndx, linePos, token.value);
              const tokenOptions = options[token.value]['options']
              if (tokenOptions) {
                return callback(null, tokenOptions.map(o=>{
                  return {
                    caption: o.desc.length > 8 ? o.val : o.desc,
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
          if (linePos !== 0) {
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
        }
        /* 
          STEP 3 - CHECK IF WORD IS A PART OF COMMAND OR OBJECT
          WE SHOULD SHOW COMMANDS AND SNIPPETS ONLY IF IT IS THE FIRST WORD IN THE LINE
        */
        if (context.length === 0 || prefix.length === 0) return;
        const scopes = this.snippetManager.getActiveScopes(editor);
        const snippetMap = this.snippetManager.snippetMap;
        const snippetCompletions = [];
        scopes.forEach(scope => {
          const snippets = snippetMap[scope] || [];
          for (let i = snippets.length; i--;) {
            const s = snippets[i];
            let doc = s.name + '<br><br>' + s.content;
            const snippetDoc = DOCS.snippets[s.tabTrigger.toLowerCase()];
            if (snippetDoc) {
              doc = `<div class="ac_cmd">${snippetDoc.syntax || ''}</div><hr>${snippetDoc.desc}`;
            }
            snippetCompletions.push({
              caption: s.name,
              snippet: s.content,
              meta: s.tabTrigger && !s.name ? s.tabTrigger + "\u21E5 " : "snippet",
              type: "snippet",
              docHTML: doc
            });
          }
        }, this);
        let optionsArr = DOCS.ac_objects.map(o=>{
          return {
            caption: o,
            value: o + '.'
          };
        }).concat(this.groups.groups.map(g=>{
          return {
            caption: g.name,
            value: g.name
          };
        }));
        if (linePos === 0) {
          optionsArr = snippetCompletions.concat(optionsArr).concat(Object.keys(DOCS.commands).map(o=>{
            const cmd = DOCS.commands[o];
            const doc = this.getOverloadDoc(cmd,this.ovrldIndx,0);
            const index = this.ovrldIndx < cmd.length ? this.ovrldIndx : 0;
            const cmdHasOptionalParams = typeof cmd[index]['optionalType'] !== 'undefined';
            const isOneWordCommand = cmd[index]['syntax'].split(' ').length === 1;
            return {
              caption: o,
              value: o + (isOneWordCommand && !cmdHasOptionalParams && !disableNewLines ? '\n' : ' '),
              docHTML: doc,
              cmd
            };
          })).concat(DOCS.element.concat(DOCS.group).map(el=>{
            const name =  el.short || el.name;
            return {
              caption: name,
              value: name + ' ',
              docHTML: this.getParamDoc(el,name)
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
    if (param['readOnly']) title += ` <b>READ ONLY</b>`;
    return title + `<br><br>${param['desc']}`;
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

  defineFolding() {
    ace.define('ace/mode/folding/mcbasic',(require, exports, module) =>{
      "use strict";
      
      const oop = require("../../lib/oop");
      const Range = require("../../range").Range;
      const tokenIterator = require("../../token_iterator").TokenIterator;
      const baseFoldMode = require("./fold_mode").FoldMode;
      // tslint:disable-next-line: only-arrow-functions
      const foldMode = exports.FoldMode = function() {};
      
      oop.inherits(foldMode, baseFoldMode);
      
      (function() {
      
        // regular expressions that identify starting and stopping points
        this.foldingStartMarker = /\b(then|while|function|sub|try|select|program|OnSystemError|onerror)\b|{\s*$|(\[=*\[)/i;
        this.foldingStopMarker = /\bend\b (if|while|function|sub|try|select|program|OnSystemError|onerror)/i;

        // tslint:disable-next-line: only-arrow-functions
        this.mcBasicBlock = function(session, row, column, tokenRange) {
          const stream = new tokenIterator(session, row, column);
          const indentKeywords = {
            "then": 1,
            "elseif": -1,
            "end": -1,
            "while": 1,
            "function": 1,
            "sub": 1,
            "try": 1,
            "select": 1,
            "program": 1,
            "onsystemerror": 1,
            "onerror": 1
          };
          let token = stream.getCurrentToken();
          if (
              !token ||
              (token.type !== "keyword.control.asp" && token.type !== 'storage.type.function.asp')
          ) {
            return;
          }
  
          const val = token.value.toLowerCase(); //i.e: then
          const stack = [val]; // to detect command inside command etc...
          const dir = indentKeywords[val];

          if (!dir) return;

          //console.log('start',token,dir,stack);
  
          const startColumn = dir === -1 ? stream.getCurrentTokenColumn() : session.getLine(row).length;
          const startRow = row;

          stream.step = dir === -1 ? stream.stepBackward : stream.stepForward;
  
          // tslint:disable-next-line: no-conditional-assignment
          while(token = stream.step()) {
            token.value = token.value.toLowerCase();
            if (token.type !== "keyword.control.asp" || !indentKeywords[token.value]) {
              continue;
            }
            //console.log('found token:',token.value);
            const level = dir * indentKeywords[token.value];
            if (level > 0) {
              stack.unshift(token.value);
              //console.log(stack);
            } else if (level <= 0) {
              stack.shift();
              //console.log(stack);
              if (!stack.length && token.value !== "elseif") {
                break;
              }
              if (level === 0) {
                stack.unshift(token.value);
                //console.log(stack);
              }
              if (token.value === 'end') { // ignore next keyword (i.e: end try)
                while (token) {
                  token = stream.stepForward();
                  if (token && token.value.trim().length > 0) break;
                }
                //console.log('token is now', token.value);
              }
            }
          }
  
          if (!token) return null;
  
          if (tokenRange) {
            return stream.getCurrentTokenRange();
          }
  
          const r = stream.getCurrentTokenRow();
          const result = new Range(startRow, startColumn, r, stream.getCurrentTokenColumn());
          return result;
        };
        
    
        this.getFoldWidgetRange = function (session, foldStyle, row) {
          const line = session.getLine(row).toLowerCase();
          let match = this.foldingStartMarker.exec(line);
          if (match) {
            if (match[1]) {
                return this.mcBasicBlock(session, row, match.index + 1);
            }
            if (match[2]) {
              //return session.getCommentFoldRange(row, match.index + 1);
            }

            //return this.openingBracketBlock(session, "{", row, match.index);
          }

          match = this.foldingStopMarker.exec(line);
          if (match) {
            if (match[0] === "end") {
              const type = session.getTokenAt(row, match.index + 1).type;
              if (type === "keyword.control.asp" || type === 'storage.type.function.asp') {
                return this.mcBasicBlock(session, row, match.index + 1);
              }
            }

            //return this.closingBracketBlock(session, "}", row, match.index + match[0].length);
          }
        };

        // tslint:disable-next-line: only-arrow-functions
        this.getFoldWidget = function(session, foldStyle, row) {
          const line = session.getLine(row).toLowerCase();
          const isStart = this.foldingStartMarker.test(line);
          const isEnd = this.foldingStopMarker.test(line);
          if (isStart && !isEnd) {
            const match = line.match(this.foldingStartMarker);
            if (match[1] === "then" && /\belseif\b/i.test(line)) {
              return;
            }
            if (match[1]) {
              const token = session.getTokenAt(row,match.index + 1);
              if (
                  token.type === 'keyword.control.asp' ||
                  token.type === 'storage.type.function.asp'
                ) {
                return "start";
              }
            } else {
              return "start";
            }
          }
          if (foldStyle !== "markbeginend" || !isEnd || isStart && isEnd) {
            return "";
          }
          const match = line.match(this.foldingStopMarker);
          if (match[0] === "end") {
            const type = session.getTokenAt(row, match.index + 1).type;
            if (type === "keyword.control.asp" || type === 'storage.type.function.asp') {
              return "end";
            }
          } else {
            return "end";
          }
        };
      
      }).call(foldMode.prototype);
      
      });
  }
}
