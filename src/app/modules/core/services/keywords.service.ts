import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';
import { MCKeyword } from '../models/mc-keyword.model';
import { GroupManagerService } from './group-manager.service';

declare var ace;

@Injectable({
  providedIn: 'root',
})
export class KeywordService {
  initDone: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get wordList() {
    return this._wordList;
  }

  get keywords() {
    return this._keywords;
  }

  private _wordList: string[];
  private _keywords: string[];

  constructor(private api: ApiService, private groups: GroupManagerService) {

    this.defineFolding();
    this.defineWorker();

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

  defineWorker() {
    ace.define('ace/mode/mcbasic_worker',(require, exports, module) =>{
      "use strict";
      const oop = require("../lib/oop");
      const Mirror = require("../worker/mirror").Mirror;
      //const mcparse = require("../mode/mcbasic/mcbasicparse");
      // tslint:disable-next-line: variable-name
      const Worker = exports.Worker = function(sender) {
        Mirror.call(this, sender);
        this.setTimeout(500);
        this.setOptions();
      };

      oop.inherits(Worker, Mirror);

      (function() {
        this.onUpdate = function() {
          const value = this.doc.getValue();
          const errors = [];
          //const errors = mcparse.parse(value);
          errors.push({
            row: 0,
            column: 5,
            text: 'wtf are you doing?',
            type: 'warning'
          });
          //this.sender.emit("annotate", errors);
          this.sender.emit("lint", errors);
        };

      }).call(Worker.prototype);
    });
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
        this.foldingStartMarker = /\b(then|while|function|sub|try|select)\b|{\s*$|(\[=*\[)/i;
        this.foldingStopMarker = /\bend\b (if|while|function|sub|try|select)/i;

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
            "select": 1
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
