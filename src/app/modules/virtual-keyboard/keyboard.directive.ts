import {
  Directive,
  ElementRef,
  Renderer2,
  HostListener,
  Component,
  Inject,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgModel, FormControlName, AbstractControl } from '@angular/forms';
import { CommonService } from '../core/services/common.service';
import { NgControl } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Optional } from '@angular/core';
import { TerminalService } from '../home-screen/services/terminal.service';

@Directive({
  selector: '[virtualKeyboard]',
  providers: [NgModel, FormControlName],
})
export class KeyboardDirective {
  private _dialogOpen = false;
  private ref?: MatDialogRef<KeyboardDialog>;

  @Input() ktype?: string;
  @Input() showArrows?: boolean;
  @Input() enableLineDelete?: boolean;
  @Output() onKeyboardClose: EventEmitter<{ target: { value: string | number} }> = new EventEmitter();
  @Output() onLineDelete: EventEmitter<void> = new EventEmitter();

  @HostListener('focus',['$event'])
  onClick() {
    if (!this.cmn.isTablet || this.ktype === 'none' || this._dialogOpen) {
      if (!this._dialogOpen) this.el.nativeElement.readOnly = false;
      return;
    }
    this.el.nativeElement.blur();
    this.el.nativeElement.readOnly = true;
    let selectedLayout: string[][] = null;
    switch (this.ktype) {
      case 'numeric':
        selectedLayout = LAYOUT_NUMERIC;
        break;
      case 'numeric_pos':
        selectedLayout = LAYOUT_NUMERIC_POS;
        break;
      case 'numeric_int':
        selectedLayout = LAYOUT_NUMERIC_INT;
        break;
      case 'numeric_int_pos':
        selectedLayout = LAYOUT_NUMERIC_INT_POS;
        break;
      default:
        selectedLayout = LAYOUT_STRING;
        break;
    }
    this._dialogOpen = true;
    // SHOW KEYBOARD DIALOG
    const data: KeyboardData = {
      el: this.el.nativeElement,
      ngModel: this.ngModel,
      name: this.name,
      layout: selectedLayout,
      keyboardType: this.ktype,
      accept: [this.onKeyboardClose],
      ctrl: this.ctrl,
      showArrows: this.showArrows,
      enableLineDelete: this.enableLineDelete,
      onLineDelete: this.onLineDelete,
    };
    this.ref = this.dialog.open(KeyboardDialog, {
      autoFocus: false,
      data,
    });
    this.ref.afterClosed().subscribe(() => {
      this.el.nativeElement.blur();
      this._dialogOpen = false;
    });
  }

  @HostListener('keydown',['$event'])
  onkeydown(e: KeyboardEvent) {
    if (!this.cmn.isTablet && this.ktype && e.key.length === 1) {
      const isNumeric = this.ktype && this.ktype.includes('numeric');
      if (isNumeric) {
        const isPos = this.ktype.includes('pos');
        const isInt = this.ktype.includes('int');
        if (e.key !== '.' && e.key !== '-' && e.key !== 'e' && isNaN(Number(e.key))) {
          e.preventDefault();
        }
        if (isPos && e.key === '-') e.preventDefault();
        if (isInt && e.key === '.') e.preventDefault();
      }
    }
  }

  constructor(
    public el: ElementRef,
    public dialog: MatDialog,
    public renderer: Renderer2,
    private ngModel: NgModel,
    private cmn: CommonService,
    @Optional() private ctrl: NgControl,
    private name: FormControlName
  ) {
    const element = el.nativeElement as HTMLElement;
    element.setAttribute('autocomplete','off');
  }
}

@Component({
  selector: 'keyboard-dialog',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss'],
})
export class KeyboardDialog implements OnInit {
  
  ngModel?: NgModel | FormControlName;
  placeholder?: string;
  inputType?: string;
  layout?: string[][];
  ctrl?: FormControlName;
  control?: FormControl | AbstractControl;
  currValue = '';
  cursorInitDone = false;
  private onKeyboardClose?: Array<EventEmitter<{ target: { value: string | number} }>>;
  private _shiftMode = false;
  private _moreMode = false;
  private val: number | string;
  private lastCmdIndex = -1;
  private backKeyDown = false;
  private _cursorPos = 0; // index of the letter the cursor is at
  private panLeft = 0;

  @ViewChild('displayInput', { static: true }) displayInput?: ElementRef;

  get cursorX() {
    if (this.displayInput) {
      const el = this.displayInput.nativeElement as HTMLElement;
      if (el.style.left === null) return 0;
      const left = Math.abs(Number(el.style.left.slice(0,-2)));
      const inputWidth = el.offsetWidth;
      const cursorPos = this._cursorPos * this.cmn.fontWidth - left;
      return cursorPos <= inputWidth ? cursorPos : inputWidth;
    } else {
      return 0;
    }
  }

  constructor(
    public dialogRef: MatDialogRef<KeyboardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: KeyboardData,
    public terminal: TerminalService,
    private cmn: CommonService
  ) {}

  ngOnInit() {
    this.ngModel = this.data.name || this.data.ngModel;
    this.placeholder = this.data.el.getAttribute('placeholder');
    this.inputType = this.data.el.getAttribute('type');
    this.layout = this.data.layout;
    this.onKeyboardClose = this.data.accept;
    this.ctrl = this.data.name;
    this.control = this.data.ctrl ? this.data.ctrl.control : null;    
    if (this.ctrl && this.ctrl.name) {
      this.currValue = this.ctrl.value || '';
      this._cursorPos = this.currValue.length;
      if (this.ctrl.valueChanges) {
        this.ctrl.valueChanges.subscribe(val => {
          this.currValue = val;
          if (!this.cursorInitDone) {
            setTimeout(()=>{
              this._cursorPos = this.currValue.length;
              this.scrollToCursor();
              this.cursorInitDone = true;
            },0);
          }
        });
      }
    } else if (this.control) {
      this.currValue = this.control.value || '';
      this._cursorPos = this.currValue.length;
      if (this.control.valueChanges) {
        this.control.valueChanges.subscribe(val => {
          this.currValue = val;
          if (!this.cursorInitDone) {
            setTimeout(()=>{
              this._cursorPos = this.currValue.length;
              this.scrollToCursor();
              this.cursorInitDone = true;
            },0);
          }
        });
      }
    } else if (this.ngModel) {
      this.currValue = this.ngModel.value || this.data.el.value || '';
      this._cursorPos = this.currValue.length;
      if (this.ngModel && this.ngModel.valueChanges) {
        this.ngModel.valueChanges.subscribe(val => {
          this.currValue = val;
          if (!this.cursorInitDone) {
            setTimeout(()=>{
              this._cursorPos = this.currValue.length;
              this.scrollToCursor();
              this.cursorInitDone = true;
            },0);
          }
        });
      }
    }
  }
  
  private scrollToCursor() {
    // TODO: REMOVE TIMEOUT AND FIX THIS ISSUE
    const start = new Date().getTime();
    const TIMEOUT = 200; // 200 ms
    let diff = 0;
    if (this.data.keyboardType === 'numeric' || !this.displayInput) return;
    // scroll to cursor position, if needed
    const el = this.displayInput.nativeElement as HTMLElement;
    if (el.parentElement === null) return;
    const containerWidth = el.parentElement.clientWidth;
    const charsInLine = Math.floor(containerWidth / this.cmn.fontWidth);
    if (el.style.left === null) return;
    const currLeft = Number(el.style.left.slice(0,-2)) * -1;
    let min = Math.floor(currLeft / this.cmn.fontWidth);
    if (this._cursorPos >= min && this._cursorPos <= (min + charsInLine)) return;
    if (this._cursorPos < min) {
      while (this._cursorPos < min && diff < TIMEOUT) {
        const max = this._cursorPos;
        min = max - charsInLine;
        diff = new Date().getTime() - start;
      }
      if (diff >= TIMEOUT) {
        console.log('ERROR IN SCROLL TO CURSOR:');
        console.log(this._cursorPos, charsInLine, min);
        return;
      }
      if (min < 0) {
        min = 0;
      }
      const left = min * this.cmn.fontWidth;
      el.style.left = -left + 'px';
    } else if (this._cursorPos > (min + charsInLine)) {
      while (this._cursorPos > (min + charsInLine) && diff < TIMEOUT) {
        min = min + charsInLine;
        diff = new Date().getTime() - start;
      }
      if (diff >= TIMEOUT) {
        console.log('ERROR IN SCROLL TO CURSOR:');
        console.log(this._cursorPos, charsInLine, min);
        return;
      }
      if (min + charsInLine > this.currValue.length) {
        min = this.currValue.length - charsInLine;
      }
      const left = (min + 0.5) * this.cmn.fontWidth;
      el.style.left = -left + 'px';
    }
  }

  onInputTouch(e: TouchEvent) {
    const el = e.target as HTMLElement;
    const left = el.getBoundingClientRect().left;
    const x = e.touches[0].clientX - left;
    // find nearest position
    this._cursorPos = Math.min(
      Math.floor(Math.max(0, x/this.cmn.fontWidth)),
      this.currValue.length
    );
  }
  
  onSwipe(e: {deltaX: number}, eventType: string) {
    if (!this.displayInput) return;
    const el = this.displayInput.nativeElement as HTMLElement;
    if (el.style.left === null) return;
    if (eventType === 'start') {
      const left = Number(el.style.left.slice(0,-2));
      this.panLeft = left;
    }
    if (el.parentElement === null) return;
    const width = el.getBoundingClientRect().width;
    const containerWidth = el.parentElement.clientWidth;
    el.style.left = 
      Math.max(
        containerWidth - width,
        Math.min(this.panLeft + e.deltaX,0)
      ) + 'px';
  }

  onKeyUp(key: string, e: MouseEvent) {
    if (key === 'backspace') {
      this.backKeyDown = false;
    }
    const target = e.target as HTMLElement;
    if (target) {
      const tag = target.tagName.toUpperCase();
      if (tag === 'BUTTON') target.blur();
      else if (tag === 'I' && target.parentElement) target.parentElement.blur();
    }
  }

  onInput(key: string, e: MouseEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const parent = target.parentElement;
    if (target && parent) {
      const tag = target.tagName.toUpperCase();
      if (tag === 'BUTTON') target.focus();
      else if (tag === 'I') parent.focus();
    }
    let value: string =
      '' +
      ((this.control && this.control.value) ||
        (this.ngModel && this.ngModel.value) ||
        (this.ctrl && this.ctrl.value) ||
        this.currValue ||
        '');
    if (value === 'undefined' || value === 'null') value = '';
    switch (key) {
      case 'backspace':
        if (value.length === 0) {
          if (this.data.enableLineDelete) {
            this.data.onLineDelete.emit();
            this.accept(true);
          }
          return;
        }
        this.backKeyDown = true;
        if (this.data.keyboardType === 'numeric') {
          value = value.slice(0, -1);
          if (value === '') value = '0';
        } else if (this._cursorPos > 0) {
          value =
            value.slice(0, this._cursorPos - 1) + value.slice(this._cursorPos);
          this._cursorPos--;
          this.scrollToCursor();
          setTimeout(() => {
            if (!this.backKeyDown) return;
            const interval = setInterval(() => {
              if (this.backKeyDown && this._cursorPos > 0) {
                value =
                  value.slice(0, this._cursorPos - 1) +
                  value.slice(this._cursorPos);
                this._cursorPos--;
                this.setValue(value);
              } else {
                clearInterval(interval);
              }
              this.scrollToCursor();
            }, 100);
          }, 400);
        }
        break;
      case 'arrow_upward':
        this.layout = this._shiftMode ? LAYOUT_STRING : LAYOUT_STRING_SHIFT;
        this._shiftMode = !this._shiftMode;
        this._moreMode = false;
        break;
      case 'more':
        this.layout = this._moreMode ? LAYOUT_STRING : LAYOUT_STRING_MORE;
        this._moreMode = !this._moreMode;
        this._shiftMode = false;
        break;
      case 'keyboard_return':
        this.setValue('\n');
        this.accept();
        break;
      default:
        if (
            value === '0' && this.data.keyboardType === 'numeric' && key !== '.'
        ) {
          value = key;
        } else if (this.data.keyboardType === 'numeric') {
          value += key;
        } else {
          value =
            value.substring(0, this._cursorPos) +
            key +
            value.substring(this._cursorPos);
          this._cursorPos++;
          this.scrollToCursor();
        }
        break;
    }
    this.setValue(value);
  }

  down() {
    if (this.terminal.history.length > 0) {
      this.lastCmdIndex++;
      if (this.lastCmdIndex >= this.terminal.history.length) {
        this.lastCmdIndex = 0;
      }
      let cmd: string = this.terminal.history[this.lastCmdIndex];
      let cmdTmp: string = cmd;
      while (
        this.lastCmdIndex < this.terminal.history.length &&
        (cmdTmp.trim().length === 0 || cmdTmp === this.val)
      ) {
        this.lastCmdIndex++;
        if (this.lastCmdIndex < this.terminal.history.length) {
          cmdTmp = this.terminal.history[this.lastCmdIndex];
        }
      }
      if (this.lastCmdIndex < this.terminal.history.length) cmd = cmdTmp;
      this.setValue(cmd);
      this._cursorPos = cmd.length;
    }
  }

  up() {
    if (this.terminal.history.length > 0) {
      this.lastCmdIndex--;
      if (this.lastCmdIndex < 0) {
        this.lastCmdIndex = this.terminal.history.length - 1;
      }
      let cmd: string = this.terminal.history[this.lastCmdIndex];
      let cmdTmp: string = cmd;
      while (
        this.lastCmdIndex >= 0 &&
        (cmdTmp.trim().length === 0 || cmdTmp === this.val)
      ) {
        this.lastCmdIndex--;
        if (this.lastCmdIndex >= 0) {
          cmdTmp = this.terminal.history[this.lastCmdIndex];
        }
      }
      if (this.lastCmdIndex > -1) cmd = cmdTmp;
      this.setValue(cmd);
      this._cursorPos = cmd.length;
    }
  }

  setValue(value: string) {
    this.val = value;
    if (this.control) {
      this.control.setValue(value);
      return;
    }
    if (this.ngModel && this.ctrl && !this.ctrl.name) {
      if (this.ngModel.value !== null) this.ngModel.control.setValue(value);
      else {
        this.currValue = value;
        if (
          (this.inputType === 'number' && !isNaN(Number(value))) ||
          this.inputType !== 'number'
        ) {
          this.data.el.value = value;
        }
      }
    } else if (this.ctrl && this.ctrl.control) {
      this.ctrl.control.setValue(value);
    } else if (this.ctrl && this.ctrl.valueAccessor) {
      this.ctrl.valueAccessor.writeValue(value);
    } else {
      this.data.el.value = value;
    }
  }

  accept(fromLineDelete?: boolean) {
    this.dialogRef.close();
    if (fromLineDelete || !this.onKeyboardClose) return;
    for (const e of this.onKeyboardClose) {
      if (e) {
        e.emit({
          target: {
            value: this.val,
          },
        });
      }
    }
  }

  btnToHtml(btn: string) {
    if (btn.length === 1) return btn;
    return '<i class="material-icons">' + btn + '</i>';
  }
}

const LAYOUT_STRING: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['arrow_upward', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
  ['more', ' ', '.', '?', 'keyboard_return'],
];

const LAYOUT_STRING_SHIFT: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['arrow_upward', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
  ['more', ' ', '.', '?', 'keyboard_return'],
];

const LAYOUT_STRING_MORE: string[][] = [
  ['+', '*', '/', '=', '_', '-'],
  ['!', '@', '#', '$', '%', '^', '&', '~'],
  ['(', ')', '[', ']', "'", '"', ':', ','],
  ['{', '}', '<', '>', '?', 'backspace'],
  ['more', ' ', '.', 'keyboard_return'],
];

const LAYOUT_NUMERIC: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '-'],
  ['backspace'],
];

const LAYOUT_NUMERIC_POS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace']
];

const LAYOUT_NUMERIC_INT: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['backspace', '0', '-']
];

const LAYOUT_NUMERIC_INT_POS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['backspace', '0']
];

interface KeyboardData {
  el: HTMLInputElement,
  ngModel: NgModel,
  name: FormControlName,
  layout: string[][],
  keyboardType: string,
  accept: Array<EventEmitter<{ target: { value: string | number} }>>,
  ctrl: NgControl,
  showArrows: boolean,
  enableLineDelete: boolean,
  onLineDelete: EventEmitter<void>,
}