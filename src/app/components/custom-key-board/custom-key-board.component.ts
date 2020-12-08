import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { isNotNumber, isNull, isUndefined } from 'ramda-adjunct';
import { fromEvent, Subject } from 'rxjs';
import { interval } from 'rxjs/internal/observable/interval';
import { throttle } from 'rxjs/internal/operators/throttle';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { getValidNumberString } from '../../directives/number.directive';
import { DATA_TYPE, InputType } from './custom-key-board.model';
import { CommonService } from '../../modules/core/services/common.service';
import { CustomKeyBoardService } from './custom-key-board.service';
import { UtilsService } from '../../modules/core/services/utils.service';
import { CustomKeyBoardDialogComponent } from './custom-key-board-dialog/custom-key-board-dialog.component';
import { TerminalService } from '../../modules/home-screen/services/terminal.service';

enum ErrorNumberCode {
  Required = 'required',
  InvalidNumber = 'invalidNumber',
  Limit = 'limit',
  Precision = 'precision',
  NumberOutOfRange = 'numberOutRange',
}

enum ErrorStringCode {
  Required = 'required',
  FirstLetter = 'firstLetter',
  NameRules = 'nameRules',
  ExistNameList = 'existNameList',
  UserNameReserved = 'userNameReserved',
  InvalidUserName = 'invalidUserName',
  FullName = 'fullName',
  ConfirmPassword = 'confirmPassword',
  LetterAndNumber = 'letterAndNumber',
  Precision = 'precision',
  IPAndMask = 'inValidIPAndMask',
  MaxLength = 'maxLength',
  MinLength = 'minLength',
  PasswordRegex = 'passwordRegex',
  FixedLength ='fixedLength'
}

@Component({
  selector: 'custom-key-board',
  templateUrl: './custom-key-board.component.html',
  styleUrls: ['./custom-key-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomKeyBoardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() id: string;
  @Input() emitInvalidValue: boolean = true;  //Whether to trigger valueChange
  @Input() value: string | number;  //keyboard binding value
  @Input() keyBoardDialog: boolean = false;  //Whether the keyboard is used in the keyboard pop-up window
  @Input() type: 'int' | 'float' | 'string';  //keyboard type
  @Input() min: number;  //min
  @Input() max: number;  //max
  @Input() toNumber: boolean = false; // empty string convert to 0
  @Input() leftClosedInterval = true;  //Left closed interval
  @Input() rightClosedInterval = true;  //Right closed interval
  @Input() required: boolean = false;  //required field
  @Input() requiredErrMsg: string;  //Error message prompt for required fields
  @Input() disabled: boolean = false;  //disabled
  @Input() label: string | number;  //label message
  @Input() prefix: string | number;  //prefix
  @Input() suffix: string | number;  //suffix
  @Input() hint: string;  //hint message
  @Input() placeHolder: string | number;  //placeHolder
  @Input() showPlaceHolderOnlyDialog: boolean = false;  //Whether to display prompt information in the pop-up window
  @Input() appearance: string = "legacy";  //Input box style
  @Input() matLabel: string;  //matLabel message
  @Input() isPositiveNum: boolean = false;  //Is it positive?
  @Input() isNgIf: boolean = true;  //show or hide
  @Input() readonly: boolean = false;  //readonly
  @Input() maxLength: number;  //Maximum length of input
  @Input() minLength: number;  //Minimum length of input
  @Input() precision: number = 6;  //Six digits after the decimal point are taken by default
  @Input() isShowPrecision: boolean = true;  //Whether to display the prompt for the limit of decimals
  @Input() firstLetter: boolean = false;  //The first character is a letter
  @Input() nameRules: boolean = false;  //Naming rules, Must begin with a letter, include only letters, numbers or _.
  @Input() existNameList: string[];  //Name list already exists
  @Input() useUnitPasswordRegex: boolean = false;
  @Input() password: boolean = false;  //password
  @Input() isCommand: boolean = false;  //Whether to open keyboard in command
  @Input() iconPrefix: boolean = false;  //iconPrefix
  @Input() iconPrefixColor: string = "#0000000DE";  //iconPrefix Color
  @Input() iconSuffix: boolean = false;  //iconSuffix
  @Input() markAsTouchedFirst: boolean = false;  //Whether to trigger markAsTouched on first entry
  @Input() reserved: boolean = false;  //Reserved name
  @Input() fullName: boolean = false;  //fullName
  @Input() letterAndNumber: boolean = false; //Naming rules,letter and number
  @Input() confirmPassword: string;  //confirmPassword
  @Input() isProgram: boolean = false;  //Whether to open the keyboard in the program
  @Input() enterTrigerBlur: boolean = true;  //Enter whether to lose focus
  @Input() outSideValidators: any[];  //Enter verification rules
  @Input() isUserName: boolean = false;  //userName ?
  @Input() isIPAndMask: boolean = false;  //IP:MASK add verification rules
  @Input() identificationTag: string;
  @Input() defaultValueOfInvalidNum = null;
  @Input() caseSensitive: boolean = false; // (false a === A)  (true a !== A)
  @Input() emitNoDirtyValue: boolean = false;// if the value is not dirty ,emit it
  @Output() valueChange: EventEmitter<string | number> = new EventEmitter<string | number>();  //emit input event
  @Output() inputChange: EventEmitter<string | number> = new EventEmitter<string | number>();
  @Output() focusEvent: EventEmitter<string | number> = new EventEmitter<string | number>();  //emit focus event
  @Output() blurEvent: EventEmitter<string | number> = new EventEmitter<string | number>();  //emit blur event
  @Output() pressEnterEvent: EventEmitter<string | number> = new EventEmitter<string | number>();  //emit press enter event
  @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();  //emit valid event
  @Output() onLineDelete: EventEmitter<any> = new EventEmitter<any>();  //Program delete line
  @ViewChild('numInput', { static: true }) numInput: any;// ElementRef<FromEventTarget<{ target: HTMLInputElement }>>;

  public isPad: boolean = this.common.isTablet;
  public control: FormControl = new FormControl();
  public inputElement: HTMLInputElement;
  private stopSubscribe: Subject<void> = new Subject<null>();
  public isPasswordInput: string = "text";
  public textIndent: number = 0;
  private inputWidth: number = 320;
  private setTimeoutId: any;
  private hasFocus: boolean = true;

  private lastCmdIndex = -1;

  private _originalValue: number | string;

  private dialogRef: any;

  private get isNumberValue() {
    return this.type == DATA_TYPE.Float || this.type == DATA_TYPE.Int;
  }

  private words: {} = {};
  private validatorsMap: Map<string,any> = new Map<string,any>();


  constructor(
    public common: CommonService,
    public dialog: MatDialog,
    private utils: UtilsService,
    private ckb: CustomKeyBoardService,
    private ngZone: NgZone,
    public terminal: TerminalService,
    private translateService: TranslateService,
    private changeDectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.type === "string" ? this.inputWidth = 815 : "";
    this.password ? (this.isPasswordInput = "password") : "";
    (this.value || this.value == 0) && this.control.setValue(this.value.toString());
    // this.setFloatValue();
    this.inputElement = this.numInput.nativeElement as HTMLInputElement;
    // The initial content exceeds the input box
    if (this.inputWidth < this.ckb.getCharWidth(this.control.value, this.password) && this.keyBoardDialog) {
      this.textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value, this.password);
    }

    let validatorsMap: Map<string,ValidatorFn> = new Map<string,ValidatorFn>();

    this.required && validatorsMap.set(ErrorNumberCode.Required,Validators.required); //need check
    if (this.isNumberValue) {
      validatorsMap.set(ErrorNumberCode.InvalidNumber,this.utils.isNumberValidator());
    }
    if ((!isNotNumber(this.min) || !isNotNumber(this.max)) && this.isNumberValue) {
      const validatorLimit = this.utils.limitValidator(this.min, this.max, this.type === DATA_TYPE.Float, this.leftClosedInterval, this.rightClosedInterval);
      validatorsMap.set(ErrorNumberCode.Limit,validatorLimit);
    }

    if(this.minLength && this.maxLength && (this.minLength === this.maxLength)){
      validatorsMap.set(ErrorStringCode.FixedLength,this.utils.fixedLengthValidator(Number(this.maxLength)))
    }else{
      this.minLength && validatorsMap.set(ErrorStringCode.MinLength,this.utils.minLengthValidator(Number(this.minLength)));
      this.maxLength && validatorsMap.set(ErrorStringCode.MaxLength,this.utils.maxLengthValidator(Number(this.maxLength)));
    }

    this.firstLetter && validatorsMap.set(ErrorStringCode.FirstLetter,this.utils.firstLetterValidator());

    this.nameRules && validatorsMap.set(ErrorStringCode.NameRules,this.utils.nameRulesValidator());

    this.existNameList && validatorsMap.set(ErrorStringCode.ExistNameList,this.utils.existNameListValidator(this.existNameList,this.caseSensitive));

    this.reserved && validatorsMap.set(ErrorStringCode.UserNameReserved,this.utils.reserved());

    this.fullName && validatorsMap.set(ErrorStringCode.FullName,this.utils.fullName());

    this.letterAndNumber && validatorsMap.set(ErrorStringCode.LetterAndNumber,this.utils.letterAndNumber());

    this.confirmPassword && validatorsMap.set(ErrorStringCode.ConfirmPassword,this.utils.confirmPassword(this.confirmPassword));

    this.isIPAndMask && validatorsMap.set(ErrorStringCode.IPAndMask,UtilsService.ipAndMaskValidator());

    this.isUserName && validatorsMap.set(ErrorStringCode.InvalidUserName,this.utils.validatorUserName());

    this.isNumberValue && validatorsMap.set(ErrorStringCode.Precision,this.utils.precision(this.precision));

    this.password && this.useUnitPasswordRegex && validatorsMap.set(ErrorStringCode.PasswordRegex,UtilsService.validatoePassword())

    if (!isNull(this.outSideValidators) && !isUndefined(this.outSideValidators)) {
      let index: number = 0;
      for(let node of this.outSideValidators){
        validatorsMap.set(`outSideValidators_${index}`,node);
      }
    }
    this.control.clearValidators();
    this.validatorsMap = validatorsMap;
    this.control.setValidators(Array.from(validatorsMap.values()));
    this.getTranslateInfo();
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
      const { currentValue, firstChange } = value;
      const isNullOrUndefinded = isUndefined(currentValue) || isNull(currentValue);
      const newValue = isNullOrUndefinded ? '' : currentValue;
      if (!this.hasFocus || this.isPad) {
        this.inputChange.emit(this.handleBlurEmitValue(newValue));
      }
      if (currentValue !== this.control.value) {
        this.control.setValue(newValue);
      }
      this._originalValue = this.handleBlurEmitValue(newValue);
      this.onConfirmPwValidator();
      this.isValidEvent.emit(this.control.valid);
    })(changes);

    (({ existNameList }) => {
      if (isUndefined(existNameList)) return;
      const { currentValue, previousValue } = existNameList;
      if (!currentValue || !previousValue) return;
      this.existNameList = currentValue;
      this.control.clearValidators();
      this.validatorsMap.set(ErrorStringCode.ExistNameList,this.utils.existNameListValidator(this.existNameList,this.caseSensitive))
      this.control.setValidators(Array.from(this.validatorsMap.values()));

    })(changes);

    (({ confirmPassword }) => {
      if (isUndefined(confirmPassword)) return;
      const { currentValue } = confirmPassword;
      this.onConfirmPwValidator();
    })(changes);

    (({ max }) => {
      this.changeMaxMin(max);
    })(changes);

    (({ min }) => {
      this.changeMaxMin(min);
    })(changes);

  }

  ngAfterViewInit(): void {
    if (this.isPad && !this.keyBoardDialog) {
      fromEvent(this.numInput.nativeElement, 'click').pipe(
        takeUntil(this.stopSubscribe),
      ).subscribe(this.openDialog.bind(this));
    }
    fromEvent(this.numInput.nativeElement, 'input').pipe(
      debounceTime(50), takeUntil(this.stopSubscribe),
      throttle(ev => interval(50))
    ).subscribe(this.inputEventHandler.bind(this));

    fromEvent(this.numInput.nativeElement, 'blur').pipe(
      takeUntil(this.stopSubscribe),
      throttle(ev => interval(50))
    ).subscribe(this.blurEventHandler.bind(this, false));

    fromEvent(this.numInput.nativeElement, 'keyup').pipe(
      debounceTime(50),
      takeUntil(this.stopSubscribe),
      throttle(ev => interval(50))
    ).subscribe(this.keyupEventHandler.bind(this));
    if (this.markAsTouchedFirst) {
      this.setTimeoutId = setTimeout(() => {
        this.control.markAsTouched();
      }, 0);
    }

    this.control.valueChanges.subscribe(() => { //listen value change
      const errorInfo = this.getErrorInfo();
      if (this.errorHtmlCode !== errorInfo) {
        this.errorHtmlCode = errorInfo;
      }
    });

    this.isValidEvent.emit(this.control.valid);

  }

  ngOnDestroy() {
    this.setTimeoutId && clearTimeout(this.setTimeoutId);
    this.stopSubscribe.next(null);
    this.stopSubscribe.complete();
    this.dialogRef = null;
  }

  get cursorLeft(): number {
    if (this.control.value === null || this.control.value === undefined) return;
    const num = this.getSelectionStartNum();
    const text = this.control.value.slice(0, num);
    return this.ckb.getCharWidth(text, this.password) + this.textIndent;
  }

  public getSelectionStartNum(): number {
    return this.ckb.selectionStart(this.inputElement);
  }

  public openDialog(): void {
    if (this.readonly || this.dialogRef) {
      return;
    }
    this.ngZone.run(() => {
      this.dialogRef = this.dialog.open(CustomKeyBoardDialogComponent, {
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
          showPlaceHolder: this.showPlaceHolderOnlyDialog,
          isPositiveNum: this.isPositiveNum,
          minLength: this.minLength,
          maxLength: this.maxLength,
          firstLetter: this.firstLetter,
          nameRules: this.nameRules,
          existNameList: this.existNameList,
          password: this.password,
          isCommand: this.isCommand,
          matLabel: this.matLabel,
          reserved: this.reserved,
          fullName: this.fullName,
          confirmPassword: this.confirmPassword,
          letterAndNumber: this.letterAndNumber,
          precision: this.precision,
          isProgram: this.isProgram,
          isUserName: this.isUserName,
          isIPAndMask: this.isIPAndMask,
          outSideValidators: this.outSideValidators,
          emitNoDirtyValue: this.emitNoDirtyValue,
          defaultValueOfInvalidNum: this.defaultValueOfInvalidNum,
          useUnitPasswordRegex: this.useUnitPasswordRegex,
          caseSensitive: this.caseSensitive
        },
        width: this.type === 'string' ? '839px' : '344px',
        height: this.type === 'string' ? '439.75px' : '384.75px',
        // width: '100vw',
        // height: '100vh',
        hasBackdrop: false
      });
      this.dialogRef && this.dialogRef.afterClosed().subscribe((data: { delete?: boolean, enter?: boolean, value?: any }) => {
        this.dialogRef = null;
        if (!data) {
          if (this.emitNoDirtyValue) {
            this.emitBlurValue(this.value);
          }
          return;
        }
        if (data.delete) {
          this.onLineDelete.emit();
          return;
        }
        if (data.enter && (this.isCommand || this.emitNoDirtyValue || this._originalValue === null || this._originalValue === undefined || this._originalValue.toString() !== data.value)) {
          this._originalValue = data.value;
          this.emitBlurValue(data.value);
        }
      });

    });
    this.changeDectorRef.detectChanges();

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
        num > 0 ? this.deleteChar(num) : this.programDeleteLine();
        break;
      default:
        this.setInputValue(value, num);
        break;
    }
    const inputValue: string = this.control.value;
    const numberType: boolean = this.isNumberValue;
    let validValue = "";
    numberType ? validValue = getValidNumberString(this.control.value, this.type, this.isPositiveNum) : validValue = inputValue;
    // const validValue = getValidNumberString(this.control.value, this.type,this.isPositiveNum);
    this.control.setValue(validValue);
    // The first decimal point is filled with zero, the number entered before the minus sign disappears,
    // and the cursor position and textindex are reset
    if (!numberType) {
      return;
    }
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


  public cursorToLeft(num: number): void {
    if (this.control.value === null || this.control.value === undefined) return;
    if (num <= 0) {
      return;
    }
    this.inputElement.setSelectionRange(num - 1, num - 1);
    if (this.cursorLeft < 0) {
      const text = this.control.value.slice(this.getSelectionStartNum(), this.getSelectionStartNum() + 1);
      this.textIndent = this.textIndent + this.ckb.getCharWidth(text, this.password);
    }
  }

  public cursorToRight(num: number): void {
    if (this.control.value === null || this.control.value === undefined) return;
    if (num >= this.control.value.length) {
      return;
    }
    if (Math.round(this.textIndent + this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()), this.password)) >= this.inputWidth) {
      const text = this.control.value.slice(this.getSelectionStartNum(), this.getSelectionStartNum() + 1);
      this.textIndent = this.textIndent - this.ckb.getCharWidth(text, this.password);
    }
    this.inputElement.setSelectionRange(num + 1, num + 1);
  }


  public deleteChar(num: number): void {
    if (this.control.value === null || this.control.value === undefined) return;
    let beforePx = this.textIndent + this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()), this.password);
    let afterPx = this.ckb.getCharWidth(this.control.value.slice(this.getSelectionStartNum()), this.password);
    // The content behind the input box exceeds
    if ((this.inputWidth - beforePx) < afterPx) {
      this.deleteCharSetValue(num);
    } else if (this.textIndent < 0) {
      // The front content of the input box exceeds
      let charWidth = this.ckb.getCharWidth(this.control.value.slice(this.getSelectionStartNum() - 1, this.getSelectionStartNum()), this.password);
      this.textIndent += charWidth;
      this.deleteCharSetValue(num);
    } else {
      // normal
      this.deleteCharSetValue(num);
    }
    this.programDeleteLine();
  }

  public programDeleteLine() {
    if (!this.control.value && this.getSelectionStartNum() === 0 && this.isProgram) {
      this.onLineDelete.emit();
    }
  }

  public deleteCharSetValue(num: number): void {
    if (this.control.value === null || this.control.value === undefined) return;
    const start = this.control.value.substring(0, num - 1);
    const end = this.control.value.substring(num);
    this.control.setValue(start + end);
    this.inputElement.setSelectionRange(num - 1, num - 1);
    this.control.markAsTouched();
  }

  public setInputValue(value: string, num: number): void {
    let newValue = '';
    if (this.control.value === null || this.control.value === undefined) {
      newValue = '';
    } else {
      newValue = this.control.value;
    }
    const start = newValue.substring(0, num);
    const end = newValue.substring(num);
    this.control.setValue(start + value + end);
    this.inputElement.setSelectionRange(num + 1, num + 1);
    this.control.markAsTouched();
    if (this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()), this.password) + this.textIndent > this.inputWidth) {
      let textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()), this.password);
      this.textIndent = textIndent;
    }
  }

  public getValue(): string {
    return this.control.value;
  }

  public getValid(): boolean {
    return this.control.valid;
  }


  private changeMaxMin(value: any): void {
    if (isUndefined(value) || value === null || value === undefined) return;
    if ((!isNotNumber(this.min) || !isNotNumber(this.max)) && this.isNumberValue) {
      const validatorLimit = this.utils.limitValidator(this.min, this.max, this.type === DATA_TYPE.Float, this.leftClosedInterval, this.rightClosedInterval);
      this.control.clearValidators();
      this.validatorsMap.set(ErrorNumberCode.Limit,validatorLimit)
      this.control.setValidators(Array.from(this.validatorsMap.values()));
    }
  }

  public onFocus() {
    this.hasFocus = true;
    if (!this.keyBoardDialog) {
      this.focusEvent.emit(this.handleBlurEmitValue(this.control.value));
    }
  }

  public blurEventHandler(closeKeyBoardDialog: boolean): void {
    this.hasFocus = false;
    if (this.isPad && !closeKeyBoardDialog) {
      this.isValidEvent.emit(this.control.valid);
      return;
    }
    if (!this.isPad && (!this.control.dirty && !this.emitNoDirtyValue)) {
      this.isValidEvent.emit(this.control.valid);
      return;
    }
    const numberType: boolean = this.isNumberValue;
    const inputValue = numberType ? this.utils.parseFloatAchieve(this.control.value) : this.control.value;
    this.emitBlurValue(inputValue);
  }

  public keyupEventHandler(event: any): boolean {
    if (event.keyCode !== 13) return;
    if (this.enterTrigerBlur) {
      this.numInput.nativeElement.blur();
    } else {
      if (!this.control.dirty && !this.emitNoDirtyValue) return;
      this.pressEnterEvent.emit(this.control.value);
    }
  }

  public inputEventHandler({ target: any }): void {
    const numberType: boolean = this.isNumberValue;
    let validValue = "";
    numberType ? validValue = getValidNumberString(this.control.value, this.type, this.isPositiveNum) : validValue = this.control.value;
    const newValue = this.handleInputEmitValue(validValue);
    this.control.setValue(newValue);
    this.isValidEvent.emit(this.control.valid);
    if (!this.emitInvalidValue && this.control.status === 'INVALID') return;
    this.valueChange.emit(newValue);
  }

  private emitBlurValue(value) {
    this.control.markAsTouched();
    this.control.setValue(this.isNumberValue ? this.handleBlurEmitValue(value) : value);
    if (this.control.status === 'INVALID' || this.control.value === '') {
      if (!this.emitInvalidValue) {
        this.isValidEvent.emit(this.control.valid);
        return;
      }
      if (this.isNumberValue && this.defaultValueOfInvalidNum !== undefined && (this.control.value === '' || isNaN(+this.control.value))) {
        this.valueChange.emit(this.defaultValueOfInvalidNum);
        this.blurEvent.emit(this.defaultValueOfInvalidNum);
        this.isValidEvent.emit(this.control.valid);
        return;
      }
    }
    this.valueChange.emit(this.control.value);
    this.blurEvent.emit(this.control.value);
    this.onConfirmPwValidator();
    this.isValidEvent.emit(this.control.valid);
  }

  public resetStatus(): void {
    this.control.reset();
  }

  public onSwipe(e): void {

  }

  public setDefaultValue(direction: string): void {
    let value: string = "";
    if (direction === InputType.Top) {
      const obj = this.terminal.up(this.lastCmdIndex, this.control.value);
      value = obj.cmd;
      this.lastCmdIndex = obj.index;
    }
    if (direction === InputType.Bottom) {
      const obj = this.terminal.down(this.lastCmdIndex, this.control.value);
      value = obj.cmd;
      this.lastCmdIndex = obj.index;
    }
    (this.value || this.value == 0) && this.control.setValue(value);
    this.control.value ? this.inputElement.setSelectionRange(this.control.value.length, this.control.value.length) : "";
    this.inputElement = this.numInput.nativeElement as HTMLInputElement;
    if (this.inputWidth < this.ckb.getCharWidth(this.control.value, this.password) && this.keyBoardDialog) {
      this.textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value, this.password);
    } else {
      this.textIndent = 0;
    }
  }

  public setControlValue(value: string | string) {
    this.control.setValue(value);
    this.changeDectorRef.detectChanges();
  }

  private handleInputEmitValue(value: string | number): number | string {
    if (this.isNumberValue && value !== '' && value !== '-' && value !== null && value !== undefined) {
      return (this.type === DATA_TYPE.Int) ? Number(value) : this.getPrecisionLimit(value);
    } else {
      return value;
    }
  }

  private handleBlurEmitValue(value: string | number): number | string {
    if (this.isNumberValue && value !== '-' && value !== null && value !== undefined) {
      if (value === '') {
        return this.toNumber ? 0 : '';
      }
      return (this.type === DATA_TYPE.Int) ? Number(value) : Number(this.getPrecisionLimit(value));
    } else {
      return value;
    }

  }

  private getPrecisionLimit(value: string | number): any {
    const re = new RegExp(`(-?[0-9]+\.[0-9]{${this.precision}})[0-9]*`);
    return value.toString().replace(re, "$1");
  }

  private onConfirmPwValidator() {
    if (!this.password || isUndefined(this.confirmPassword)) return;
    if (this.value !== this.confirmPassword && this.confirmPassword !== "") {
      this.control.setErrors({ "confirmPassword": "confirmPassword" });
      this.errorHtmlCode = this.words['inputErrors.confirmPassword'];
    } else {
      this.control.setErrors(null)
    }
  }


  public setErrors(error: { errorCode?: string, errorHtmlCode?: string }) {
    this.control && this.control.setErrors(error);
    if (error && error.errorHtmlCode) {
      this.errorHtmlCode = error.errorHtmlCode;
    } else {
      this.errorHtmlCode = null;
    }
    this.changeDectorRef && this.changeDectorRef.detectChanges();
  }

  private _errorHtmlCode: string;
  public get errorHtmlCode(): string {
    return this._errorHtmlCode;
  }

  public set errorHtmlCode(value) {
    this._errorHtmlCode = value;
  }

  private getErrorInfo() {
    const control = this.control;
    const errorCodes: string[] = this.isNumberValue ? this.getNumberErrorCode() : this.getStringErrorCode();
    const index = errorCodes.findIndex((item) => {
      return control.hasError(item);
    });
    if (index < 0) {
      return null;
    } else {
      let errorCode = control.getError(errorCodes[index]);
      if (errorCode === true && errorCodes[index] === ErrorNumberCode.Required) {
        errorCode = ErrorNumberCode.Required;
      }
      return this.isNumberValue ? this.getNumberErrorHtml(errorCode) : this.getStringErrorHtml(errorCode);
    }
  }

  private getNumberErrorHtml(errorCode): string {
    let html = '';
    const transCode = this.words[`inputErrors.${errorCode}`];
    switch (errorCode) {
      case ErrorNumberCode.Required:
        html = this.requiredErrMsg ? this.requiredErrMsg : transCode;
        break;
      case ErrorNumberCode.Limit:
        html = `${transCode}
        ${this.leftClosedInterval ? '[' : '('}
        ${this.min !== undefined ? this.min : '-∞'},
        ${this.max !== undefined ? this.max : '+∞'}
        ${this.rightClosedInterval ? ']' : ')'}`; break;
      case ErrorStringCode.Precision:
        html = `${transCode} : ${this.precision}`;
        break;
      default:
        html = transCode; break;
    }
    return html;
  }


  private getStringErrorHtml(errorCode): string {
    let html = '';
    const transCode = this.words[`inputErrors.${errorCode}`];
    switch (errorCode) {
      case ErrorNumberCode.Required:
        html = this.requiredErrMsg ? this.requiredErrMsg : transCode;
        break;
      case ErrorStringCode.MaxLength:
        html = `${transCode}: ${this.maxLength}`;
        break;
      case ErrorStringCode.MinLength:
        html = `${transCode}: ${this.minLength}`;
        break;
      case ErrorStringCode.FixedLength:
        html = `${transCode}: ${this.maxLength}`;
        break;
      case ErrorStringCode.LetterAndNumber:
        html = `${transCode}: ${this.minLength}`
      default: html = transCode; break;
        ;
    }
    return html;
  }


  private getTranslateInfo() {
    const errorCodes: any[] = this.isNumberValue ? this.getNumberErrorCode() : this.getStringErrorCode();
    const errorsI18N = errorCodes.map((item) => `inputErrors.${item}`);
    this.translateService.get(errorsI18N).subscribe(words => {
      this.words = words;
    });
  }

  private getNumberErrorCode(): string[] { // sort by error severity level
    return [ErrorNumberCode.Required, ErrorNumberCode.InvalidNumber, ErrorNumberCode.Precision, ErrorNumberCode.Limit];
  }

  private getStringErrorCode(): string[] {//// sort by error severity level
    return [ErrorStringCode.Required, ErrorStringCode.MaxLength, ErrorStringCode.MinLength, ErrorStringCode.FirstLetter, ErrorStringCode.NameRules, ErrorStringCode.ExistNameList, ErrorStringCode.LetterAndNumber, ErrorStringCode.IPAndMask,
    ErrorStringCode.UserNameReserved, ErrorStringCode.InvalidUserName, ErrorStringCode.FullName, ErrorStringCode.ConfirmPassword,ErrorStringCode.PasswordRegex,ErrorStringCode.FixedLength]
  }


}
