import { Directive, ElementRef, Renderer2, HostListener, Component, Inject, Input, Output, EventEmitter} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {NgModel, FormControlName} from '@angular/forms';
import {CommonService} from '../core/services/common.service';
import {NgControl} from '@angular/forms';
import {FormControl} from '@angular/forms';
import {Optional} from '@angular/core';

@Directive({
  selector: '[virtualKeyboard]',
  providers: [NgModel,FormControlName]
})
export class KeyboardDirective {
  
  private _dialogOpen : boolean = false;
  private ref: MatDialogRef<KeyboardDialog>;
  
  @Input() ktype: string;
  @Output() onKeyboardClose: EventEmitter<any> = new EventEmitter();
  
  private _shiftMode : boolean = false;
  
  @HostListener('focus')
  onClick() {
    if (!this.cmn.isTablet || this.ktype==='none' || this._dialogOpen) {
      if (!this._dialogOpen)
        this.el.nativeElement.readOnly = false;
      return;
    }
    this.el.nativeElement.blur();
    this.el.nativeElement.readOnly = true;
    let selectedLayout : any = null;
    switch (this.ktype) {
      case 'numeric':
        selectedLayout = layout_numeric;
        break;
      default:
        selectedLayout = layout_string;
        break;
    }
    this._dialogOpen = true;
    // SHOW KEYBOARD DIALOG
    this.ref = this.dialog.open(KeyboardDialog, {
      data: {
        el: this.el.nativeElement,
        ngModel: this.ngModel,
        name: this.name,
        layout: selectedLayout,
        keyboardType: this.ktype,
        accept: [this.onKeyboardClose],
        ctrl: this.ctrl
      }
    });
    this.ref.afterClosed().subscribe(()=>{
      this.el.nativeElement.blur();
      this._dialogOpen = false;
    });
  }
  
  constructor(
    public el: ElementRef,
    public dialog: MatDialog,
    public renderer: Renderer2,
    private ngModel: NgModel,
    private cmn: CommonService,
    @Optional() private ctrl: NgControl,
    private name: FormControlName){
  }
  
}

@Component({
  selector: 'keyboard-dialog',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardDialog {
  
  public ngModel: NgModel;
  public placeholder : string;
  public inputType : string;
  public layout: any;
  public ctrl: FormControlName;
  public control: FormControl;
  public currValue: string = '';
  private onKeyboardClose: EventEmitter<any>[];
  private _shiftMode : boolean = false;
  private _moreMode : boolean = false;
  private val: any;

  constructor(
    public dialogRef: MatDialogRef<KeyboardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.ngModel = typeof data.name.model === 'undefined' ? data.ngModel : data.name;
      this.placeholder = data.el.getAttribute('placeholder');
      this.inputType = data.el.getAttribute('type');
      this.layout = data.layout;
      this.onKeyboardClose = data.accept;
      this.ctrl = data.name;
      this.control = data.ctrl ? data.ctrl.control : null;
      if (this.ctrl && this.ctrl.name) {
        this.currValue = this.ctrl.value || '';
        if (this.ctrl.valueChanges) {
          this.ctrl.valueChanges.subscribe(val=>{
            this.currValue = val;
          });
        }
      } else if (this.control) {
        this.currValue = this.control.value || '';
        if (this.control.valueChanges) {
          this.control.valueChanges.subscribe(val=>{
            this.currValue = val;
          });
        }
      } else {
        this.currValue = this.ngModel.value || data.el.value || '';
        if (this.ngModel) {
          this.ngModel.valueChanges.subscribe(val=>{
            this.currValue = val;
          });
        }
      }
    }
    
  onInput(key) {
    var value: string = '' + ((this.control && this.control.value) || (this.ngModel && this.ngModel.value) || (this.ctrl && this.ctrl.value) || this.currValue || '');
    if (value === 'undefined' || value === 'null')
      value = '';
    switch(key) {
      case 'backspace':
        value = value.slice(0, -1);
        if (value === '' && this.data.keyboardType === 'numeric')
          value = '0';
        break;
      case 'arrow_upward':
        this.layout = this._shiftMode ? layout_string : layout_string_shift;
        this._shiftMode = !this._shiftMode;
        this._moreMode = false;
        break;
      case 'more':
        this.layout = this._moreMode ? layout_string : layout_string_more;
        this._moreMode = !this._moreMode;
        this._shiftMode = false;
        break;
      case 'keyboard_return':
        this.accept();
        break;
      default:
        if (value === '0' && this.data.keyboardType === 'numeric' && key !== '.')
          value = key;
        else
          value += key;
        break;
    }
    this.val = value;
    if (this.control) {
      this.control.setValue(value);
      return;
    }
    if (this.ngModel && this.ctrl && !this.ctrl.name) {
      if (this.ngModel.value !== null)
        this.ngModel.update.emit(value);
      else {
        this.currValue = value;
        if ((this.inputType === 'number' && !isNaN(Number(value))) || this.inputType !== 'number')
          this.data.el.value = value;
      }
    }
    else if (this.ctrl && this.ctrl.control) {
      this.ctrl.control.setValue(value);
    } else if (this.ctrl) {
      this.ctrl.valueAccessor.writeValue(value);
    } else {
      this.data.el.value = value;
    }
  }
  
  accept() {
    this.dialogRef.close();
    for (let e of this.onKeyboardClose) {
      if (e) {
        e.emit({
          target: {
            value: this.val
          }
        });
      }
    }
  }
  
  btnToHtml(btn : string) {
    if (btn.length === 1)
      return btn;
    return '<i class="material-icons">' + btn + '</i>';
  }

}

const layout_string = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['arrow_upward','z','x','c','v','b','n','m','backspace'],
  ['more',' ','.','keyboard_return']
];

const layout_string_shift = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['arrow_upward','Z','X','C','V','B','N','M','backspace'],
  ['more',' ','.','keyboard_return']
];
  
const layout_string_more = [
  ['+','*','/','=','_','-'],
  ['!','@','#','$','%','^','&','~'],
  ['(',')','[',']','\'','"',':',','],
  ['arrow_upward','<','>','?','backspace'],
  ['more',' ','.','keyboard_return']
];
  
const layout_numeric = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['.','0','-'],
  ['backspace']
];