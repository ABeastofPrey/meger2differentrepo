import { TranslateService } from '@ngx-translate/core';
import { FwTranslatorService } from './../../../core/services/fw-translator.service';
import { ErrorFrame } from './../../../core/models/error-frame.model';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { TerminalService, SEP } from '../../services/terminal.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { KeywordService } from '../../../core/services/keywords.service';
import { CommonService } from '../../../core/services/common.service';
import { LoginService } from '../../../core';
import { MatInput } from '@angular/material/input';
import { trim, equals, complement, compose, indexOf } from 'ramda';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UtilsService } from '../../../core/services/utils.service';

const isNotEmptyStr = complement(
  compose(
    equals(''),
    trim
  )
);
// tslint:disable-next-line: no-any
declare var ace: any;

@Component({
  selector: 'terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class TerminalComponent implements OnInit {
  
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('upload') uploadInput!: ElementRef;
  @ViewChild('editorDiv') editorDiv!: ElementRef;

  private notifier: Subject<boolean> = new Subject();
  private lastCmdIndex = -1;
  private Range = ace.require('ace/range').Range;
  // tslint:disable-next-line: no-any
  private editor: any;

  constructor(
    public terminal: TerminalService,
    private keywords: KeywordService,
    private zone: NgZone,
    private ref: ChangeDetectorRef,
    public cmn: CommonService,
    public login: LoginService,
    private utils: UtilsService,
    private fw: FwTranslatorService,
    private trn: TranslateService
  ) {}

  ngAfterViewInit() {
    if (!this.login.isAdmin) return;
    setTimeout(() => {
      const height = this.wrapper.nativeElement.scrollHeight;
      this.wrapper.nativeElement.scrollTop = height;
    }, 0);
    this.zone.runOutsideAngular(() => {
      this.initMainAce(); // Init the editor
      //this.initAce(); // Init line editor
    });
  }

  private adjustEditorLines() {
    if (!this.wrapper) return;
    const h = this.wrapper.nativeElement.offsetHeight - 15;
    const lineHeight = this.editor.renderer.lineHeight;
    const lines = Math.floor(h / lineHeight);
    this.editor.setOptions({
      minLines: lines-1,
      maxLines: lines
    });
    this.scrollToBottom();
  }

  private async initMainAce() {
    const editor = ace.edit(this.editorDiv.nativeElement);
    this.editor = editor;
    editor.setOptions({
      autoScrollEditorIntoView: true,
      highlightActiveLine: false,
      printMargin: false,
      showGutter: false,
      theme: 'ace/theme/' + (this.utils.isDarkMode ? 'cs-dark' : 'cs'),
      fontSize: '14px',
      fontFamily: 'cs-monospace',
      readOnly: this.cmn.isTablet,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      mode: 'ace/mode/mcbasic',
      dragEnabled: false
    });
    this.adjustEditorLines();
    this.keywords.initDone.subscribe(done => {
      if (!done) return;
      editor.completers = [this.keywords.getNewWordCompleter(true,SEP)];
    });
    const val = await this.terminal.cmdsAsString();
    editor.setValue((val.length === 0 ? '' : val + '\n') + SEP + '\t', 1);
    editor.commands.on('exec', e=> {
      if (e.command.readOnly) {
        return;
      }
      const editableRow = editor.session.getLength() - 1;
      const isHandled = editor.selection.getAllRanges().some(r=>{
        if (e.command.name === 'Shift-Home') {
          if (editableRow === r.start.row) return true;
          const newStart = {row: r.start.row, column: 0};
          const newRange = {start: newStart, end: r.end};
          this.editor.selection.setSelectionRange(newRange, true);
          return true;
        }
        if (e.command.name === 'Home') {
          if (editableRow === r.start.row) {
            this.editor.selection.moveTo(r.start.row, SEP.length + 1);
            this.editor.renderer.scrollCursorIntoView({
              row: r.start.row,
              column: SEP.length + 1
            }, 0.5);
            return true;
          }
          this.editor.selection.moveTo(r.start.row, r === editableRow ? SEP.length + 1 : 0);
          this.editor.renderer.scrollCursorIntoView({row: r.start.row, column: 0}, 0.5);
          return true;
        } 
        if (e.command.name === 'End') {
          this.editor.selection.moveTo(r.end.row, Infinity);
          this.editor.renderer.scrollCursorIntoView({row: r.end.row, column: Infinity}, 0.5);
          return true;
        }
        if (e.command.name === 'up' || e.command.name === 'down') {
          if (editableRow === r.start.row) return false;
          const row = (e.command.name === 'up' ? -1 : 1) + r.start.row;
          this.editor.selection.moveTo(row, Infinity);
          this.editor.renderer.scrollCursorIntoView({row, column: Infinity}, 0.5);
          return true;
        }
        return false;
      });
      if (isHandled) return;
      const deletesLeft = 
        e.command.name === 'backspace' ||
        e.command.name === 'del' ||
        e.command.name === 'removewordleft';
      const notEditable = editor.selection.getAllRanges().some(r=>{
        const isEditableRow = r.start.row === editableRow || r.end.row === editableRow;
        const addition = e.command.name === 'backspace' ? 1 : 0;
        const isFirstCol = e.command.name !== 'del' && (r.start.column === r.end.column) && r.start.column < (SEP.length+1+addition);
        const isBeforeSep = isFirstCol || r.start.column < (SEP.length+1) || r.end.column < (SEP.length+1);
        if (!isEditableRow || ((deletesLeft || e.command.name === 'insertstring' || e.command.name === 'paste') && isBeforeSep)) {
          return true;
        }
        return r.start.row !== editableRow || r.end.row !== editableRow;
      });
      if (notEditable) {
        e.preventDefault();
        if (e.command.name === 'Enter') {
          this.send();
        }
      } else if (e.command.name === 'paste') {
        e.preventDefault();
        const text = e.args.text.split('\n').join('\t').split('\r').join('\t');
        this.editor.insert(text,1);
      }
    });
    editor.$blockScrolling = Infinity;
    editor.getSession().on('change', e=>{
      if (e.action !== 'remove' && e.lines[0] && (e.lines[0] === '.' || e.lines[0] === ' ' || e.lines[0] === '=')) {
        setTimeout(() => {
          this.editor.commands.byName.startAutocomplete.exec(this.editor);
        }, 50);
      }
    });
    // make mouse position clipping nicer
    editor.renderer.screenToTextCoordinates = function(x: number, y: number) {
      const pos = this.pixelToScreenCoordinates(x, y);
      return this.session.screenToDocumentPosition(
        Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
        Math.max(pos.column, 0)
      );
    };
    // handle Enter key press
    editor.commands.bindKey('Shift-Enter', 'null');
    editor.commands.bindKey('Enter', () => {
      this.send();
    });
    editor.commands.bindKey('up', () => {
      const r = editor.getSelectionRange().start.row;
      const editableRow = editor.session.getLength() - 1;
      if (r !== editableRow) return;
      this.onKeyUp();
    });
    editor.commands.bindKey('down', () => {
      const r = editor.getSelectionRange().start.row;
      const editableRow = editor.session.getLength() - 1;
      if (r !== editableRow) return;
      this.onKeyDown();
    });
    editor.commands.bindKey('Shift-Home', () => {
      const r = editor.getSelectionRange();
      const editableRow = r.start.row === editor.session.getLength() - 1;
      const newStart = {row: r.start.row, column: editableRow ? SEP.length+1 : 0};
      const newRange = {start: newStart, end: r.end};
      this.editor.selection.setSelectionRange(newRange, true);
    });
    editor.commands.bindKey('Home', () => {
      const r = editor.getSelectionRange().start.row;
      const editableRow = editor.session.getLength() - 1;
      this.editor.selection.moveTo(r, r === editableRow ? SEP.length + 1 : 0);
      return;
    });
    editor.commands.bindKey('End', () => {
      const r = editor.getSelectionRange().end.row;
      this.editor.selection.moveTo(r, Infinity);
      return;
    });
    this.terminal.resizeRequired.pipe(takeUntil(this.notifier)).subscribe(()=>{
      this.adjustEditorLines();
      editor.resize();
    });
    this.scrollToBottom();
    if (!this.cmn.isTablet) {
      this.editor.focus();
    }
  }

  private scrollToBottom() {
    const lines = this.editor.getSession().getLength();
    this.editor.scrollToLine(lines-1);
  }

  @HostListener('window:resize')
  onWindowResize() {
    setTimeout(()=>{
      this.adjustEditorLines();
    },0);
  }

  onClick(e: MouseEvent) {
    const shouldFocus = this.editor.getSelectedText().trim().length === 0;
    if (!this.cmn.isTablet && shouldFocus) { // PC
      this.editor.focus();
    } else if (shouldFocus) { // TABLET
      const target = e.target as HTMLElement;
      if (target.tagName.toUpperCase() === 'DIV') {
        this.showKeyboard();
      }
    }
    const mouseY = e.clientY;
    const aceLines = document.querySelectorAll('.terminal .ace_line:not(.ace_selected)');
    const last = aceLines[aceLines.length - 1];
    const editorLineY = last.getBoundingClientRect()['y'];
    if (mouseY > editorLineY + 16) {
      this.editor.clearSelection();
      if (!this.cmn.isTablet) { // PC
        this.goToEnd();
      }
    }
  }

  private goToEnd() {
    const row = this.editor.session.getLength() - 1
    const column = this.editor.session.getLine(row).length;
    this.editor.gotoLine(row + 1, column);
  }

  clear() {
    this.terminal.clear();
    this.editor.setValue(SEP + '\t',1);
    this.goToEnd();
    this.editor.getSession().setUndoManager(new ace.UndoManager());
  }

  private get cmd() : string {
    const session = this.editor.getSession();
    const line = session.getLine(session.getLength()-1) as string;
    return line.substring(SEP.length+1);
  }

  private send(forceCommand?: string) {
    const cmd = forceCommand || this.cmd;
    try {
      if (cmd.substring(0,5).toLowerCase() === 'clear' && cmd.length === 5) {
        this.terminal.history.push(this.cmd);
        this.clear();
        return;
      }
    } catch (err) {

    }
    this.terminal.send(cmd).then(async ret => {
      let result = await this.parseResult(ret.result);
      result = result.length === 0 ? '\n' : '\n' + result + '\n';
      const row = this.editor.session.getLength() - 1;
      const newLine = SEP + '\t' + cmd + result + SEP + '\t';
      this.editor.session.replace(new this.Range(row, 0, row, Number.MAX_VALUE), newLine);
      this.adjustEditorLines();
      this.scrollToBottom();
      this.goToEnd();
      this.editor.getSession().setUndoManager(new ace.UndoManager());
      // tslint:disable-next-line
      isNotEmptyStr(this.cmd) && this.terminal.sentCommandEmitter.emit(this.cmd);
      this.lastCmdIndex = -1;
      if (this.ref) this.ref.detectChanges();
    });
  }

  /*
    If a message is an error - translate it
  */
  private async parseResult(msg: string) {
    if (!msg.startsWith('Error')) return msg;
    try {
      const err = new ErrorFrame(msg);
      const code = Number(err.errCode);
      if (code === 0) return msg;
      const isLibError = code >= 20000 && code <= 20999;
      if (isLibError) {
        const ret = await this.trn.get('lib_code.'+code).toPromise();
        return `Error: ${code}, "${ret}", Task: ${err.errTask}, Line: ${err.errLine}, Module: ${err.errModule}, uuid: ${err.errUUID}`;
      }
      return `Error: ${code}, "${this.fw.getTranslation(code, err.errMsg)}", Task: ${err.errTask}, Line: ${err.errLine}, Module: ${err.errModule}, uuid: ${err.errUUID}`;
    } catch (err) {
      return msg;
    }
  }

  openScriptDialog() {
    this.uploadInput.nativeElement.click();
  }

  onKeyDown() {
    if (this.terminal.history.length > 0) {
      this.lastCmdIndex++;
      if (this.lastCmdIndex >= this.terminal.history.length) {
        this.lastCmdIndex = 0;
      }
      let cmd: string = this.terminal.history[this.lastCmdIndex];
      let cmdTmp: string = cmd;
      while (
        this.lastCmdIndex < this.terminal.history.length &&
        (cmdTmp.trim().length === 0 || cmdTmp === this.cmd)
      ) {
        this.lastCmdIndex++;
        if (this.lastCmdIndex < this.terminal.history.length) {
          cmdTmp = this.terminal.history[this.lastCmdIndex];
        }
      }
      if (this.lastCmdIndex < this.terminal.history.length) cmd = cmdTmp;
      const session = this.editor.getSession();
      const row = session.getLength() - 1;
      const final = SEP + '\t' + cmd;
      session.replace(new this.Range(row, 0, row, Number.MAX_VALUE), final);
    }
    this.ref.detectChanges();
  }

  onKeyUp() {
    if (this.terminal.history.length > 0) {
      this.lastCmdIndex--;
      if (this.lastCmdIndex < 0) {
        this.lastCmdIndex = this.terminal.history.length - 1;
      }
      let cmd: string = this.terminal.history[this.lastCmdIndex];
      let cmdTmp: string = cmd;
      while (
        this.lastCmdIndex >= 0 &&
        (cmdTmp.trim().length === 0 || cmdTmp === this.cmd)
      ) {
        this.lastCmdIndex--;
        if (this.lastCmdIndex >= 0) {
          cmdTmp = this.terminal.history[this.lastCmdIndex];
        }
      }
      if (this.lastCmdIndex > -1) cmd = cmdTmp;
      const session = this.editor.getSession();
      const row = session.getLength() - 1;
      const final = SEP + '\t' + cmd;
      session.replace(new this.Range(row, 0, row, Number.MAX_VALUE), final);
    }
    this.ref.detectChanges();
  }

  ngOnInit() {
    this.trn.onLangChange.pipe(takeUntil(this.notifier)).subscribe(async e=>{
      this.onLangChange();
    });
    setTimeout(()=>{
      this.onLangChange();
    },0);
  }

  async onLangChange() {
    if (this.editor) {
      const lines = this.editor.getValue().split('\n') as string[];
      for (let i=0; i<lines.length; i++) {
        if (lines[i].startsWith('-->')) continue;
        lines[i] = await this.parseResult(lines[i]);
      }
      this.editor.setValue(lines.join('\n'), 1);
    }
  }

  ngOnDestroy() {
    this.ref.detach();
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  /*************** Virtual Keyboard **********************/
//   @ViewChild(MatInput, { static: false }) dummyInput!: MatInput;
  @ViewChild('dummyInput', { static: true }) dummyInput: any;
  dummyText = '';
  showKeyboard() {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    const editableRow = editor.session.getLength() - 1;
    if (row !== editableRow) return;
    this.dummyText = editor.session.getLine(row).substring(3).trim();
    this.dummyInput.numInput.nativeElement.click();
    
    // this.dummyInput.focus();
  }
  onDummyKeyboardClose() {
    this.send(this.dummyText);
    this.dummyText = '';
  }
  private replaceLine(index: number, newLine: string) {
    const editor = this.editor;
    const line: string = editor.session.getLine(index);
    const tabs = new Array(this.numberOfTabs(line) + 1).join('\t');
    const txtLines = newLine.split('\n');
    for (let i = 0; i < txtLines.length; i++) txtLines[i] = tabs + txtLines[i];
    newLine = txtLines.join('\n');
    editor.session.replace(
      new this.Range(index, 0, index, Number.MAX_VALUE),
      newLine
    );
  }
  private numberOfTabs(text: string) {
    let count = 0;
    let index = 0;
    let spaceIndex = 0;
    if (text === null || text.length === 0) return 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 32) spaceIndex++;
      else break;
      if (spaceIndex % 4 === 0) count++;
    }
    while (text.charAt(index++) === '\t') {
      count++;
    }
    return count;
  }
  /******************************************************/
}
