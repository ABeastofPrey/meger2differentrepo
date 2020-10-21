import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { isNotNumber, isNull, isUndefined } from 'ramda-adjunct';
import { fromEvent, Subject } from 'rxjs';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { getValidNumberString, isFloat, isInt } from '../../directives/number.directive';
import { InputType } from '../core/models/customKeyBoard/custom-key-board.model';
import { CommonService } from '../core/services/common.service';
import { CustomKeyBoardService } from '../core/services/custom-key-board.service';
import { UtilsService } from '../core/services/utils.service';
import { CustomKeyBoardDialogComponent } from '../custom-key-board-dialog/custom-key-board-dialog.component';


@Component({
  selector: 'custom-key-board',
  templateUrl: './custom-key-board.component.html',
  styleUrls: ['./custom-key-board.component.scss']
})
export class CustomKeyBoardComponent implements OnInit {

  @Input() value: string | number;
  @Input() keyBoardDialog: boolean = false;
  @Input() type: 'int' | 'float';
  @Input() min: number;
  @Input() max: number;
  @Input() leftClosedInterval = true;
  @Input() rightClosedInterval = true;
  @Input() required: boolean = false;
  @Input() requiredErrMsg: string;
  @Input() disabled: boolean = false;
  @Input() label: string | number;
  @Input() prefix: string | number;
  @Input() suffix: string | number;
  @Input() hint: string;
  @Input() placeHolder: string | number;
  @Input() appearance: string = "legacy";
  @Input() matLabel: string;
  @Input() isPositiveNum: boolean = false;
  @Input() isNgIf: boolean = true;
  @Input() readonly: boolean = false;
  @Input() toNumber: boolean = false;
  @Input() markAsTouchedFirst: boolean = true;
  @Output() valueChange: EventEmitter<string | number> = new EventEmitter<string | number>();
  @Output() focusEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
  @Output() blurEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
  @Output() pressEnterEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
  @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('numInput', { static: true }) numInput: ElementRef<FromEventTarget<{ target: HTMLInputElement }>>;

  public isPad: boolean = this.common.isTablet;
  public control: FormControl = new FormControl();
  private ref?: MatDialogRef<CustomKeyBoardDialogComponent>;
  public inputElement: HTMLInputElement;
  private stopSubscribe: Subject<void> = new Subject<null>();
  public textIndent: number = 0;
  private inputWidth: number = 432;

  constructor(
    public common: CommonService,
    public dialog: MatDialog,
    private utils: UtilsService,
    private ckb: CustomKeyBoardService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    (this.value || this.value == 0) && this.control.setValue(this.value.toString());
    this.inputElement = this.numInput.nativeElement as HTMLInputElement;
    // The initial content exceeds the input box
    if (this.inputWidth < this.ckb.getCharWidth(this.control.value) && this.keyBoardDialog) {
      this.textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value);
    }
    if (isNotNumber(this.min) && isNotNumber(this.max)) return;
    const validator = this.utils.limitValidator(this.min, this.max, this.type === 'float', this.leftClosedInterval, this.rightClosedInterval);
    const validators = [validator];
    this.required && validators.push(Validators.required);
    this.control.setValidators(validators);
  }

  ngAfterViewInit(): void {
    if (this.isPad && !this.keyBoardDialog) {
      fromEvent(this.numInput.nativeElement, 'click').pipe(
        debounceTime(20), takeUntil(this.stopSubscribe)
      ).subscribe(this.openDialog.bind(this));
    }
    fromEvent(this.numInput.nativeElement, 'input').pipe(
      debounceTime(20), takeUntil(this.stopSubscribe)
    ).subscribe(this.inputEventHandler.bind(this));

    fromEvent(this.numInput.nativeElement, 'blur').pipe(
      takeUntil(this.stopSubscribe)
    ).subscribe(this.blurEventHandler.bind(this, false));

    fromEvent(this.numInput.nativeElement, 'keyup').pipe(
      takeUntil(this.stopSubscribe)
    ).subscribe(this.keyupEventHandler.bind(this));
    if(this.markAsTouchedFirst){
      setTimeout(() => {
        this.control.markAsTouched();
      }, 0);
    }
  }

  get cursorLeft(): number {
    const num = this.getSelectionStartNum();
    const text = this.control.value.slice(0, num);
    return this.ckb.getCharWidth(text) + this.textIndent;
  }

  public getSelectionStartNum(): number {
    return this.ckb.selectionStart(this.inputElement);
  }

  public openDialog(): void {
    if (this.readonly) {
      return;
    }

    this.ngZone.run(() => {
      const ref = this.dialog.open(CustomKeyBoardDialogComponent, {
        data: {
          value: this.value,
          type: this.type,
          min: this.min,
          max: this.max,
          leftClosedInterval: this.leftClosedInterval,
          rightClosedInterval: this.rightClosedInterval,
          required: this.required,
          requiredErrMsg: this.requiredErrMsg,
          disabled: this.disabled,
          label: this.label,
          placeHolder: this.placeHolder,
          isPositiveNum: this.isPositiveNum
        }
      });
      ref && ref.afterClosed().subscribe((data) => {
        if (data && this.control.value !== data) {
          this.control.setValue(data);
          this.valueChange.emit(((this.toNumber && Number(data).toString() !== "NaN") ? Number(data) : data));
          this.blurEventHandler(true);
        }
      });
    });

  }

  public setValue(value: string): void {
    const num = this.getSelectionStartNum();
    switch (value) {
      case InputType.Left:
        this.cursorToLeft(num);
        break;
      case InputType.Right:
        this.cursorToRight(num);
        break;
      case InputType.Delete:
        num > 0 ? this.deleteChar(num) : "";
        break;
      default:
        this.setInputValue(value, num);
        break;
    }
    const inputValue: string = this.control.value;
    const validValue = getValidNumberString(this.control.value, this.type, this.isPositiveNum);
    this.control.setValue(validValue);
    // The first decimal point is filled with zero, the number entered before the minus sign disappears,
    // and the cursor position and textindex are reset
    if (inputValue[0] === ".") {
      this.inputElement.setSelectionRange(2, 2);
      this.textIndent = 0;
    } else if (inputValue[0] === "-" && inputValue[1] === ".") {
      this.inputElement.setSelectionRange(3, 3);
      this.textIndent = 0;
    } else if (inputValue[1] === "-" && validValue[0] !== "-") {
      this.inputElement.setSelectionRange(1, 1);
      this.textIndent = 0;
    }
  }

  public setControlValue(value: string | string){
    this.control.setValue(value);
  }

  public cursorToLeft(num: number): void {
    if (num <= 0) {
      return;
    }
    this.inputElement.setSelectionRange(num - 1, num - 1);
    if (this.cursorLeft < 0) {
      const text = this.control.value.slice(this.getSelectionStartNum(), this.getSelectionStartNum() + 1);
      this.textIndent = this.textIndent + this.ckb.getCharWidth(text);
    }
  }

  public cursorToRight(num: number): void {
    if (num >= this.control.value.length) {
      return;
    }
    if (Math.round(this.textIndent + this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()))) >= this.inputWidth) {
      const text = this.control.value.slice(this.getSelectionStartNum(), this.getSelectionStartNum() + 1);
      this.textIndent = this.textIndent - this.ckb.getCharWidth(text);
    }
    this.inputElement.setSelectionRange(num + 1, num + 1);
  }

  public deleteChar(num: number): void {
    let beforePx = this.textIndent + this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()));
    let afterPx = this.ckb.getCharWidth(this.control.value.slice(this.getSelectionStartNum()));
    // The content behind the input box exceeds
    if ((this.inputWidth - beforePx) < afterPx) {
      this.deleteCharSetValue(num);
    } else if (this.textIndent < 0) {
      // The front content of the input box exceeds
      let charWidth = this.ckb.getCharWidth(this.control.value.slice(this.getSelectionStartNum() - 1, this.getSelectionStartNum()));
      this.textIndent += charWidth;
      this.deleteCharSetValue(num);
    } else {
      // normal
      this.deleteCharSetValue(num);
    }
  }

  public deleteCharSetValue(num: number): void {
    const start = this.control.value.substring(0, num - 1);
    const end = this.control.value.substring(num);
    this.control.setValue(start + end);
    this.inputElement.setSelectionRange(num - 1, num - 1);
    this.control.markAsTouched();
  }

  public setInputValue(value: string, num: number): void {
    const start = this.control.value.substring(0, num);
    const end = this.control.value.substring(num);
    this.control.setValue(start + value + end);
    this.inputElement.setSelectionRange(num + 1, num + 1);
    this.control.markAsTouched();
    if (this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum())) + this.textIndent > this.inputWidth) {
      let textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()));
      this.textIndent = textIndent;
    }
  }

  public getValue(): string {
    return this.control.value;
  }

  public getValid(): boolean {
    return this.control.valid;
  }

  ngOnChanges(changes: SimpleChanges): void {
    (({ disabled }) => {
      if (isUndefined(disabled)) return;
      const shouldDisable = disabled.currentValue === true;
      if (shouldDisable) {
        this.control.disable({ onlySelf: true });
      } else {
        this.control.enable({ onlySelf: false });
      }
    })(changes);

    (({ value }) => {
      if (isUndefined(value)) return;
      const { currentValue } = value;
      const isNullOrUndefinded = isUndefined(currentValue) || isNull(currentValue);
      this.control.setValue(isNullOrUndefinded ? '' : currentValue);
    })(changes);
  }

  public onFocus() {
    if (!this.keyBoardDialog) {
      this.focusEvent.emit(((this.toNumber && Number(this.control.value).toString() !== "NaN") ? Number(this.control.value) : this.control.value));
    }
  }

  public blurEventHandler(closeKeyBoardDialog: boolean): void {
    if (this.isPad && !closeKeyBoardDialog) {
      return;
    }
    if (isFloat(this.type)) {
      const parsedVal = parseFloat(this.control.value);
      if (!isNaN(parsedVal) && (Math.abs(parsedVal) === 0)) {
        this.control.setValue('0');
      }
      if ([...this.control.value.toString()].pop() === '.') {
        this.control.setValue(this.control.value.slice(0, -1));
      }
    }
    if (isInt(this.type)) {
      const parsedVal = parseInt(this.control.value);
      if (!isNaN(parsedVal) && (Math.abs(parsedVal) === 0)) {
        this.control.setValue('0');
      }
    }
    this.control.markAsTouched();
    this.isValidEvent.emit(this.control.valid);
    this.blurEvent.emit(((this.toNumber && Number(this.control.value).toString() !== "NaN") ? Number(this.control.value) : this.control.value));
  }

  public keyupEventHandler(event: any): void {
    const isNotPressEnter = event.keyCode !== 13;
    if (isNotPressEnter) return;
    this.control.markAsTouched();
    this.isValidEvent.emit(this.control.valid);
    this.pressEnterEvent.emit(((this.toNumber && Number(this.control.value).toString() !== "NaN") ? Number(this.control.value) : this.control.value));
  }

  public inputEventHandler({ target: { value } }): void {
    const validValue = getValidNumberString(value, this.type, this.isPositiveNum);
    this.control.setValue(validValue);
    this.control.markAsTouched();
    this.isValidEvent.emit(this.control.valid);
    this.valueChange.emit((this.toNumber && Number(validValue).toString() !== "NaN") ? Number(validValue) : validValue);
  }

  public resetStatus(): void {
    this.control.reset();
  }

  public onSwipe(e): void {

  }

}
