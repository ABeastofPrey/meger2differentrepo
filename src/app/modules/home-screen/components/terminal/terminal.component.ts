import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { TerminalService } from '../../services/terminal.service';
import { Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { KeywordService } from '../../../core/services/keywords.service';
import { CommonService } from '../../../core/services/common.service';
import { LoginService } from '../../../core';
import { MatInput } from '@angular/material';
import { trim, equals, complement, compose } from 'ramda';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  
  @ViewChild('wrapper', { static: false }) wrapper!: ElementRef;
  @ViewChild('upload', { static: false }) uploadInput!: ElementRef;
  @ViewChild('editorLine', { static: false }) editorLine!: ElementRef;
  @ViewChild('editorDiv', { static: false }) editorDiv!: ElementRef;

  private _cmd = '';
  private notifier: Subject<boolean> = new Subject();
  private lastCmdIndex = -1;
  // tslint:disable-next-line: no-any
  private editor: any;
  // tslint:disable-next-line: no-any
  private historyEditor: any; // the ace editor of the history commands
  private Range = ace.require('ace/range').Range;

  get cmd() {
    return this._cmd;
  }

  set cmd(val: string) {
    this._cmd = val;
    if (this.editor) {
      this.editor.setValue(val, 1);
    }
  }

  constructor(
    public terminal: TerminalService,
    private keywords: KeywordService,
    private zone: NgZone,
    private ref: ChangeDetectorRef,
    public cmn: CommonService,
    public login: LoginService
  ) {}

  ngAfterViewInit() {
    if (!this.login.isAdmin) return;
    setTimeout(() => {
      const height = this.wrapper.nativeElement.scrollHeight;
      this.wrapper.nativeElement.scrollTop = height;
    }, 0);
    this.zone.runOutsideAngular(() => {
      this.initMainAce(); // Init the command history editor
      this.initAce(); // Init line editor
    });
  }

  private initMainAce() {
    const editor = ace.edit(this.editorDiv.nativeElement);
    editor.setOptions({
      autoScrollEditorIntoView: true,
      highlightActiveLine: false,
      printMargin: false,
      showGutter: false,
      theme: 'ace/theme/cs',
      fontSize: '14px',
      maxLines: Infinity,
      readOnly: true,
      fontFamily: 'cs-monospace'
    });
    editor.getSession().setUseWrapMode(true);
    editor.renderer.$cursorLayer.element.style.display = 'none';
    this.keywords.initDone.subscribe(done => {
      if (!done) return;
      editor.getSession().setMode('ace/mode/mcbasic');
    });
    editor.$blockScrolling = Infinity;
    editor.setValue(this.terminal.cmdsAsString, 1);
    setTimeout(() => {
      const height = this.wrapper.nativeElement.scrollHeight;
      this.wrapper.nativeElement.scrollTop = height;
    }, 50);
    this.terminal.onNewCommand.subscribe(() => {
      this.zone.run(()=>{
        editor.setValue(this.terminal.cmdsAsString, 1);
        setTimeout(() => {
          if (!this.wrapper) return;
          const height = this.wrapper.nativeElement.scrollHeight;
          this.wrapper.nativeElement.scrollTop = height;
        }, 50);
      });
    });
    this.historyEditor = editor;
    this.terminal.resizeRequired.pipe(takeUntil(this.notifier)).subscribe(()=>{
      editor.resize();
    });
  }

  private initAce() {
    this.editor = ace.edit(this.editorLine.nativeElement);
    const editor = this.editor;
    editor.setOptions({
      maxLines: 1, // make it 1 line
      autoScrollEditorIntoView: true,
      highlightActiveLine: false,
      printMargin: false,
      showGutter: false,
      theme: 'ace/theme/cs',
      fontSize: '14px',
      readOnly: this.cmn.isTablet,
      fontFamily: 'cs-monospace',
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      mode: 'ace/mode/mcbasic'
    });
    this.keywords.initDone.subscribe(done => {
      if (!done) return;
      editor.completers = [this.keywords.getNewWordCompleter(true)];
      //editor.getSession().setMode('ace/mode/mcbasic');
    });
    editor.$blockScrolling = Infinity;
    editor.on('paste', (e: {text: string}) => {
      e.text = e.text.replace(/[\r\n]+/g, ' ');
    });
    editor.getSession().on('change', e=>{
      if (e.action !== 'remove' && e.lines[0] && (e.lines[0] === '.' || e.lines[0] === ' ') || e.lines[0] === '=') {
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
      this.cmd = editor.getValue();
      this.send();
    });
    editor.commands.bindKey('up', () => {
      this.onKeyUp();
    });
    editor.commands.bindKey('down', () => {
      this.onKeyUp();
    });
    if (!this.cmn.isTablet) editor.focus();
    this.terminal.resizeRequired.pipe(takeUntil(this.notifier)).subscribe(()=>{
      editor.resize();
    });
  }

  onClick(e: MouseEvent) {
    const shouldFocus = this.historyEditor.getSelectedText().trim().length === 0;
    if (!this.cmn.isTablet && shouldFocus) { // PC
      this.editor.focus();
    } else if (shouldFocus) { // TABLET
      const target = e.target as HTMLElement;
      if (target.tagName.toUpperCase() === 'DIV') {
        this.showKeyboard();
      }
    }
    const mouseY = e.clientY;
    const editorLineY = this.editorLine.nativeElement.getBoundingClientRect().y;
    if (mouseY > editorLineY) {
      this.historyEditor.clearSelection();
      if (!this.cmn.isTablet) { // PC
        this.editor.focus();
      }
    }
  }

  clear() {
    this.terminal.clear();
    this.cmd = '';
    if (!this.cmn.isTablet) this.editor.focus();
  }

  private send() {
    try {
      if (
        this.cmd.substring(0,5).toLowerCase() === 'clear' &&
        this.cmd.length === 5
      ) {
        this.terminal.history.push(this.cmd);
        this.clear();
        return;
      }
    } catch (err) {}
    this.terminal.send(this.cmd).then(() => {
      // tslint:disable-next-line
      isNotEmptyStr(this.cmd) &&
        this.terminal.sentCommandEmitter.emit(this.cmd);
      this.cmd = '';
      this.lastCmdIndex = -1;
      setTimeout(() => {
        if (this.ref) this.ref.detectChanges();
      }, 0);
    });
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
      this.cmd = cmd;
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
      this.cmd = cmd;
    }
    this.ref.detectChanges();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  /*************** Virtual Keyboard **********************/
  @ViewChild(MatInput, { static: false }) dummyInput!: MatInput;
  dummyText = '';
  showKeyboard() {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    this.dummyText = editor.session.getLine(row).trim();
    this.dummyInput.focus();
  }
  onDummyKeyboardClose() {
    const editor = this.editor;
    const position = editor.getCursorPosition();
    const row = position.row; // current row
    this.cmd = this.dummyText;
    this.send();
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
