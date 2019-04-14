import { Directive, ElementRef, Renderer2, HostListener, Component, Inject, Input, Output, EventEmitter} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {NgModel, FormControlName} from '@angular/forms';
import {CommonService} from '../core/services/common.service';
import {WebsocketService} from '../core';

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
        accept: this.onKeyboardClose
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
  public currValue: string = '';
  private onKeyboardClose: EventEmitter<any>;
  private _shiftMode : boolean = false;
  private _moreMode : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<KeyboardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.ngModel = typeof data.name.model === 'undefined' ? data.ngModel : data.name;
      this.placeholder = data.el.getAttribute('placeholder');
      this.inputType = data.el.getAttribute('type');
      this.layout = data.layout;
      this.onKeyboardClose = data.accept;
      this.ctrl = data.name;
      if (this.ctrl && this.ctrl.name) {
        this.currValue = this.ctrl.value;
        if (this.ctrl.valueChanges) {
          this.ctrl.valueChanges.subscribe(val=>{
            this.currValue = val;
          });
        }
      } else {
        this.currValue = this.ngModel.value || '';
        this.ngModel.valueChanges.subscribe(val=>{
          this.currValue = val;
        });
      }
    }
    
  onInput(key) {
    var value : string = '' + (this.ngModel.value || this.ctrl.value);
    if (value === 'undefined' || value === 'null')
      value = '';
    switch(key) {
      case 'backspace':
        /*if (this._shiftMode){
          this._shiftMode = false;
          this.layout = this.data.layout;
        }*/
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
    if (this.ngModel && !this.ctrl.name) {
      this.ngModel.update.emit(value);
    }
    else if (this.ctrl.control)
      this.ctrl.control.setValue(value);
    else
      this.ctrl.valueAccessor.writeValue(value);
  }
  
  accept() {
    this.dialogRef.close();
    this.onKeyboardClose.emit();
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