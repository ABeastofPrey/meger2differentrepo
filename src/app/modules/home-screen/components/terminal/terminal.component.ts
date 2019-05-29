import { Component, OnInit, ElementRef, ViewChild, HostListener, NgZone } from '@angular/core';
import {TerminalService} from '../../services/terminal.service';
import {Input} from '@angular/core';
import {trigger, transition, style, animate} from '@angular/animations';
import {KeywordService} from '../../../core/services/keywords.service';
import {ApplicationRef} from '@angular/core';
import {CommonService} from '../../../core/services/common.service';
import {LoginService} from '../../../core';
import {MatInput} from '@angular/material';
import { trim, equals, complement, compose } from 'ramda';

const isNotEmptyStr = complement(compose(equals(''), trim));
declare var ace;

@Component({
  selector: 'terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css'],
  animations: [
    trigger('fade',[
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TerminalComponent implements OnInit {
  
  private _cmd : string = '';
  contextMenuShown : boolean = false;
  contextMenuX : number = 0;
  contextMenuY : number = 0;
  contextSelection: string = null;
  @ViewChild('wrapper') wrapper : ElementRef;
  @ViewChild('upload') uploadInput: ElementRef;
  @ViewChild('editorLine') editorLine : ElementRef;
  @ViewChild('editorDiv') editorDiv: ElementRef;
  
  @Input('offsetX') offsetX: number;
  @Input('offsetY') offsetY: number;

  private changeFlag : boolean = false;
  private lastCmdIndex : number = -1;
  private editor : any;
  private Range = ace.require('ace/range').Range;
  
  get cmd() {
    return this._cmd;
  }
  
  set cmd(val:string) {
    this._cmd = val;
    if (this.editor) {
      this.editor.setValue(val,1);
    }
  }

  constructor(
    public terminal : TerminalService,
    private keywords: KeywordService,
    private zone: NgZone,
    private ref: ApplicationRef,
    public cmn: CommonService,
    public login: LoginService
  ) {}
  
  ngAfterViewInit() {
    if (!this.login.isAdmin)
      return;
    setTimeout(()=>{
      const height = this.wrapper.nativeElement.scrollHeight;
      this.wrapper.nativeElement.scrollTop = height;
    },0);
    this.zone.runOutsideAngular(()=>{
      this.initMainAce(); // Init the command history editor
      this.initAce(); // Init line editor
    });
  }
  
  private initMainAce() {
    let editor = ace.edit(this.editorDiv.nativeElement);
    editor.setOptions({
      autoScrollEditorIntoView: true,
      highlightActiveLine: false,
      printMargin: false,
      showGutter: false,
      theme: "ace/theme/cs",
      fontSize: "14px",
      maxLines: Infinity,
      readOnly: true,
    });
    editor.getSession().setUseWrapMode(true);
    editor.renderer.$cursorLayer.element.style.display = "none";
    this.keywords.initDone.subscribe(done=>{
      if (!done)
        return;
      editor.getSession().setMode("ace/mode/mcbasic");
    });
    editor.$blockScrolling = Infinity;
    editor.setValue(this.terminal.cmdsAsString,1);
    setTimeout(()=>{
      const height = this.wrapper.nativeElement.scrollHeight;
      this.wrapper.nativeElement.scrollTop = height;
    },50);
    this.terminal.onNewCommand.subscribe(cmd=>{
      editor.setValue(this.terminal.cmdsAsString,1);
      setTimeout(()=>{
        const height = this.wrapper.nativeElement.scrollHeight;
        this.wrapper.nativeElement.scrollTop = height;
      },50);
    });
  }
  
  private initAce() {
    this.editor = ace.edit(this.editorLine.nativeElement);
    let editor = this.editor;
    editor.setOptions({
      maxLines: 1, // make it 1 line
      autoScrollEditorIntoView: true,
      highlightActiveLine: false,
      printMargin: false,
      showGutter: false,
      theme: "ace/theme/cs",
      fontSize: "14px",
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      readOnly: this.cmn.isTablet
    });
    this.keywords.initDone.subscribe(done=>{
      if (!done)
        return;
      editor.completers = [this.keywords.staticWordCompleter];
      editor.getSession().setMode("ace/mode/mcbasic");
    });
    editor.$blockScrolling = Infinity;
    editor.on("paste", function(e) {
      e.text = e.text.replace(/[\r\n]+/g, " ");
    });
    // make mouse position clipping nicer
    editor.renderer.screenToTextCoordinates = function(x, y) {
      var pos = this.pixelToScreenCoordinates(x, y);
      return this.session.screenToDocumentPosition(
        Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
        Math.max(pos.column, 0)
      );
    };
    // handle Enter key press
    editor.commands.bindKey("Shift-Enter", "null");
    editor.commands.bindKey("Enter",()=>{
      this.cmd = editor.getValue();
      this.send();
    });
    editor.commands.bindKey("up",()=>{ this.onKeyUp(); });
    editor.commands.bindKey("down",()=>{ this.onKeyUp(); });
    if (!this.cmn.isTablet)
      editor.focus();
  }
  
  onContextMenu(e:MouseEvent) {
    e.preventDefault();
    let rect = this.wrapper.nativeElement.getBoundingClientRect();
    this.contextMenuX = e.clientX - rect.left;
    this.contextMenuY = e.clientY - rect.top;
    this.contextMenuShown = true;
    this.contextSelection = this.getSelection();
  }
  
  onClick(e:MouseEvent) { // 0 - down, 1 - up
    const mouseY = e.clientY;
    const editorLineY = this.editorLine.nativeElement.getBoundingClientRect().y;
    if (mouseY > editorLineY) {
      if (!this.cmn.isTablet)
        this.editor.focus();
      else {
        const target: HTMLElement = <HTMLElement>e.target;
        if (target.tagName.toUpperCase() === 'DIV')
          this.showKeyboard();
      }
    }
  }
  
  clear(e: MouseEvent) {
    e.stopImmediatePropagation();
    this.terminal.clear();
    this.cmd = '';
    this.contextMenuShown = false;
    if (!this.cmn.isTablet)
      this.editor.focus();
  }
  
  private send() {
    this.changeFlag = true;
    this.terminal.send(this.cmd).then(()=>{
      // tslint:disable-next-line
      isNotEmptyStr(this.cmd) && this.terminal.sentCommandEmitter.emit(this.cmd);
      this.cmd = '';
      this.lastCmdIndex = -1;
      setTimeout(()=>{
        this.ref.tick();
      },0);
    });
  }
  
  private getSelection(): string {
    let t: string = null;
    if (window.getSelection) {
      t = window.getSelection().toString();
    } else if (document.getSelection && document.getSelection().type !== 'Control') {
      t = document.getSelection().toString();
    }
    let editorSelection = '';
    if (this.editor && this.editor.getSelectedText() && this.editor.getSelectedText().length > 0)
      editorSelection = this.editor.getSelectedText();
    if (t && t.trim().length > 0)
      return t + editorSelection;
    else if (editorSelection.length > 0)
      return editorSelection;
    return null;
  }
  
  cut() {
    document.execCommand('cut');
    this.contextMenuShown = false;
    this.editor.focus();
    this.contextSelection = null;
  }
  
  copy() {
    document.execCommand('copy');
    this.contextMenuShown = false;
    this.contextSelection = null;
  }
  
  paste() {
    try {
      navigator['clipboard'].readText()
      .then(text => {
        this.editor.insert(text);
        this.contextMenuShown = false;
        this.editor.focus();
      })
      .catch(err => {
        console.log('Something went wrong', err);
      });
    } catch (err) {
      alert('CLIPBOARD OPERATIONS NOT SUPPORTED, USE CTRL + V');
      this.contextMenuShown = false;
      this.editor.focus();
    }
  }
  
  openScriptDialog() {
    this.uploadInput.nativeElement.click();
  }
  
  onKeyDown() {
    if (this.terminal.history.length > 0) {
      this.lastCmdIndex++;
      if (this.lastCmdIndex >= this.terminal.history.length)
        this.lastCmdIndex = 0;
      let cmd: string = this.terminal.history[this.lastCmdIndex];
      let cmdTmp: string = cmd;
      while (this.lastCmdIndex < this.terminal.history.length && (cmdTmp.trim().length === 0 || cmdTmp === this.cmd)) {
        this.lastCmdIndex++;
        if (this.lastCmdIndex < this.terminal.history.length)
          cmdTmp = this.terminal.history[this.lastCmdIndex];
      }
      if (this.lastCmdIndex < this.terminal.history.length)
        cmd = cmdTmp;
      this.cmd = cmd;
    }
    this.ref.tick();
  }
  
  onKeyUp() {
    if (this.terminal.history.length > 0) {
      this.lastCmdIndex--;
      if (this.lastCmdIndex < 0)
        this.lastCmdIndex = this.terminal.history.length - 1;
      let cmd: string = this.terminal.history[this.lastCmdIndex];
      let cmdTmp: string = cmd;
      while (this.lastCmdIndex >= 0 && (cmdTmp.trim().length === 0 || cmdTmp === this.cmd)) {
        this.lastCmdIndex--;
        if (this.lastCmdIndex >= 0)
          cmdTmp = this.terminal.history[this.lastCmdIndex];
      }
      if (this.lastCmdIndex > -1)
        cmd = cmdTmp;
      this.cmd = cmd;
    }
    this.ref.tick();
  }
  
  onUploadFilesChange(e:any) {
    for(let f of e.target.files) {
      
    }
  }

  ngOnInit() {
  }
  
  /*@HostListener('document:keydown.enter')
    onEnterPress() {
      this.send();
      this.editor.focus();
    }*/
  
  /*************** Virtual Keyboard **********************/
  @ViewChild(MatInput) dummyInput : MatInput;
  dummyText : string = '';
  showKeyboard() {
    var editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
    this.dummyText = editor.session.getLine(row).trim();
    this.dummyInput.focus();
  }
  onDummyKeyboardClose() {
    var editor = this.editor;
    var position = editor.getCursorPosition();
    var row = position.row; // current row
    this.cmd = this.dummyText;
    this.send();
    this.dummyText = '';
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
  /******************************************************/

}