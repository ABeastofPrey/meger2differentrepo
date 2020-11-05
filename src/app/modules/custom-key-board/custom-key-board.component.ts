import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Console } from 'console';
import { isNotNumber, isNull, isUndefined } from 'ramda-adjunct';
import { fromEvent, Subject } from 'rxjs';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { getValidNumberString, isFloat, isInt } from '../../directives/number.directive';
import { CommandLocalType, DATA_TYPE, InputType } from '../core/models/customKeyBoard/custom-key-board.model';
import { CommonService } from '../core/services/common.service';
import { CustomKeyBoardService } from '../core/services/custom-key-board.service';
import { UtilsService } from '../core/services/utils.service';
import { CustomKeyBoardDialogComponent } from '../custom-key-board-dialog/custom-key-board-dialog.component';
import { TerminalService } from '../home-screen/services/terminal.service';

@Component({
    selector: 'custom-key-board',
    templateUrl: './custom-key-board.component.html',
    styleUrls: ['./custom-key-board.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomKeyBoardComponent implements OnInit,OnDestroy,AfterViewInit {

    constructor(
        public common: CommonService,
        public dialog: MatDialog,
        private utils: UtilsService,
        private ckb: CustomKeyBoardService,
        private ngZone: NgZone,
        public terminal: TerminalService
    ) { }

    @Input() emitInvalidValue: boolean = true;
    @Input() value: string | number;
    @Input() keyBoardDialog: boolean = false;
    @Input() type: 'int' | 'float' | 'string';
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
    @Input() maxLength: number;
    @Input() minLength: number;
    @Input() precision: number = 6;
    @Input() isShowPrecision: boolean = true;
    @Input() firstLetter: boolean = false;
    @Input() nameRules: boolean = false;
    @Input() existNameList: string[];
    @Input() password: boolean = false;
    @Input() isCommand: boolean = false;
    @Input() iconPrefix: boolean = false;
    @Input() iconPrefixColor: string = "#0000000DE";
    @Input() iconSuffix: boolean = false;
    @Input() markAsTouchedFirst: boolean = false;
    @Input() reserved: boolean = false;
    @Input() fullName: boolean = false;
    @Input() letterAndNumber: boolean = false;
    @Input() confirmPassword: string;
    @Input() isProgram: boolean = false;
    @Output() valueChange: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() inputChange: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() focusEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() blurEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() pressEnterEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onLineDelete: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('numInput', { static: true }) numInput: ElementRef<FromEventTarget<{ target: HTMLInputElement }>>;

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

    ngOnInit() {
        this.type === "string" ? this.inputWidth = 815 : "";
        this.password ? (this.isPasswordInput = "password") : "";
        (this.value || this.value == 0) && this.control.setValue(this.value.toString());
        // this.setFloatValue();
        this.inputElement = this.numInput.nativeElement as HTMLInputElement;
        // The initial content exceeds the input box
        if (this.inputWidth < this.ckb.getCharWidth(this.control.value,this.password) && this.keyBoardDialog) {
            this.textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value,this.password);
        }
        const validators = [];
        this.required && validators.push(Validators.required);
        if (this.type === 'int' || this.type === 'float') {
            validators.push(this.utils.isNumberValidator());
        }
        if((!isNotNumber(this.min) || !isNotNumber(this.max)) && (this.type==DATA_TYPE.Float || this.type==DATA_TYPE.Int)) {

            const validatorLimit = this.utils.limitValidator(this.min, this.max, this.type === DATA_TYPE.Float, this.leftClosedInterval, this.rightClosedInterval);
            // const validators = [validator];
            validators.push(validatorLimit);
        }
        this.minLength && validators.push(this.utils.minLengthValidator(Number(this.minLength)));
        this.maxLength && validators.push(this.utils.maxLengthValidator(Number(this.maxLength)));
        this.firstLetter && validators.push(this.utils.firstLetterValidator());
        this.nameRules && validators.push(this.utils.nameRulesValidator());
        this.existNameList && validators.push(this.utils.existNameListValidator(this.existNameList));
        this.reserved && validators.push(this.utils.reserved());
        this.fullName && validators.push(this.utils.fullName());
        this.letterAndNumber && validators.push(this.utils.letterAndNumber());
        this.confirmPassword && validators.push(this.utils.confirmPassword(this.confirmPassword));
        (this.precision && this.type === DATA_TYPE.Float) && validators.push(this.utils.precision(this.precision));
        // this.required && validators.push(Validators.required);
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
            this.setTimeoutId = setTimeout(() => {
              this.control.markAsTouched();
            }, 0);
        }
    }

    ngOnDestroy(){
        this.setTimeoutId && clearTimeout(this.setTimeoutId);
    }

    get cursorLeft(): number {
        const num = this.getSelectionStartNum();
        const text = this.control.value.slice(0, num);
        return this.ckb.getCharWidth(text,this.password) + this.textIndent;
    }

    public getSelectionStartNum(): number {
        return this.ckb.selectionStart(this.inputElement);
    }

    public openDialog(): void {
        if(this.readonly) {
            return;
        }
        this.ngZone.run(()=>{
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
                    isProgram: this.isProgram
                },
                width: this.type === 'string' ? '839px' : '344px',
                height: this.type === 'string' ? '439.75px' : '384.75px'
            });
            ref && ref.afterClosed().subscribe((data) => {
                if(data && data.delete) {
                    this.onLineDelete.emit();
                    return;
                }
                let isUndefined = (typeof data === "undefined");
                if (!isUndefined) {
                    this.control.setValue(data);
                    this.valueChange.emit(((this.toNumber && Number(data).toString() !== "NaN") ? Number(data) : data));
                    this.blurEventHandler(true);
                    setTimeout(() => {
                        this.setFloatValue();
                    }, 0);
                }
            });

        });

    }

    private setFloatValue() {
       const newValue = this.control.value + '';
        if (newValue.trim() === '') return;
        if(this.type === DATA_TYPE.Float && Math.abs(+newValue) === 0) {
            this.control.setValue("0.0");
        }
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
        const numberType: boolean = this.type === DATA_TYPE.Float || this.type === DATA_TYPE.Int;
        let validValue = "";
        numberType ? validValue = getValidNumberString(this.control.value, this.type,this.isPositiveNum) : validValue=inputValue;
        // const validValue = getValidNumberString(this.control.value, this.type,this.isPositiveNum);
        this.control.setValue(validValue);
        // The first decimal point is filled with zero, the number entered before the minus sign disappears,
        // and the cursor position and textindex are reset
        if(!numberType) {
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
        if (num <= 0) {
            return;
        }
        this.inputElement.setSelectionRange(num - 1, num - 1);
        if (this.cursorLeft < 0) {
            const text = this.control.value.slice(this.getSelectionStartNum(), this.getSelectionStartNum() + 1);
            this.textIndent = this.textIndent + this.ckb.getCharWidth(text,this.password);
        }
    }

    public cursorToRight(num: number): void {
        if (num >= this.control.value.length) {
            return;
        }
        if (Math.round(this.textIndent + this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()),this.password)) >= this.inputWidth) {
            const text = this.control.value.slice(this.getSelectionStartNum(), this.getSelectionStartNum() + 1);
            this.textIndent = this.textIndent - this.ckb.getCharWidth(text,this.password);
        }
        this.inputElement.setSelectionRange(num + 1, num + 1);
    }

    public deleteChar(num: number): void {
        let beforePx = this.textIndent + this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()),this.password);
        let afterPx = this.ckb.getCharWidth(this.control.value.slice(this.getSelectionStartNum()),this.password);
        // The content behind the input box exceeds
        if ((this.inputWidth - beforePx) < afterPx) {
            this.deleteCharSetValue(num);
        } else if (this.textIndent < 0) {
            // The front content of the input box exceeds
            let charWidth = this.ckb.getCharWidth(this.control.value.slice(this.getSelectionStartNum() - 1, this.getSelectionStartNum()),this.password);
            this.textIndent += charWidth;
            this.deleteCharSetValue(num);
        } else {
            // normal
            this.deleteCharSetValue(num);
        }
        this.programDeleteLine();
    }

    public programDeleteLine() {
        if(!this.control.value && this.getSelectionStartNum() === 0 && this.isProgram) {
            this.onLineDelete.emit();
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
        if (this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()),this.password) + this.textIndent > this.inputWidth) {
            let textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value.slice(0, this.getSelectionStartNum()),this.password);
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
            if(!this.hasFocus || this.isPad) {
                this.inputChange.emit(((this.toNumber && Number(this.control.value).toString() !== "NaN") ? Number(this.control.value) : this.control.value));
            }
        })(changes);

        (({ existNameList }) => {
            if (isUndefined(existNameList)) return;
            const { currentValue } = existNameList;
            this.existNameList = currentValue;
        })(changes);

        (({ confirmPassword }) => {
            if (isUndefined(confirmPassword)) return;
            const { currentValue } = confirmPassword;
            this.control.setValidators(this.utils.confirmPassword(this.confirmPassword));
        })(changes);

        (({ max }) => {
            this.changeMaxMin(max);
        })(changes);

        (({ min }) => {
            this.changeMaxMin(min);
        })(changes);

    }

    private changeMaxMin(value: any) :void {
        if (isUndefined(value)) return;
        if((!isNotNumber(this.min) || !isNotNumber(this.max)) && (this.type==DATA_TYPE.Float || this.type==DATA_TYPE.Int)) {
            const validatorLimit = this.utils.limitValidator(this.min, this.max, this.type === DATA_TYPE.Float, this.leftClosedInterval, this.rightClosedInterval);
            this.control.setValidators(validatorLimit);
        }
    }

    public onFocus() {
        this.hasFocus = true;
        if (!this.keyBoardDialog) {
            this.focusEvent.emit(((this.toNumber && Number(this.control.value).toString() !== "NaN")? Number(this.control.value) : this.control.value));
        }
    }

    public blurEventHandler(closeKeyBoardDialog: boolean): void {
        this.hasFocus = false;
        if (this.isPad && !closeKeyBoardDialog) {
            return;
        }
        if (isFloat(this.type)) {
            const parsedVal = parseFloat(this.control.value);
            if (parsedVal !== NaN && (Math.abs(parsedVal) === 0)) {
                this.control.setValue('0');
            }
            if ([...this.control.value.toString()].pop() === '.') {
                this.control.setValue(this.control.value.slice(0, -1));
            }
        }
        if (isInt(this.type)) {
            const parsedVal = parseInt(this.control.value);
            if (parsedVal !== NaN && (Math.abs(parsedVal) === 0)) {
                this.control.setValue('0');
            }
        }
        const numberType: boolean = this.type === DATA_TYPE.Float || this.type === DATA_TYPE.Int;
        const inputValue = numberType ? this.utils.parseFloatAchieve(this.control.value) : this.control.value;
        this.control.setValue(inputValue);
        this.control.markAsTouched();
        this.isValidEvent.emit(this.control.valid);
        let emitValue = ((this.toNumber && Number(this.control.value).toString() !== "NaN") ? Number(this.getPrecisionLimit(this.control.value)) : this.getPrecisionLimit(this.control.value))
        this.control.setValue(emitValue);
        this.setFloatValue();
        if (!this.emitInvalidValue && this.control.status === 'INVALID') return;
        this.blurEvent.emit(this.control.value);
    }

    public keyupEventHandler(event: any): void {
        const isNotPressEnter = event.keyCode !== 13;
        if (isNotPressEnter) return;
        this.control.markAsTouched();
        this.isValidEvent.emit(this.control.valid);
        this.pressEnterEvent.emit(((this.toNumber && Number(this.control.value).toString() !== "NaN") ? Number(this.control.value) : this.control.value));
    }

    public inputEventHandler({ target: { value } }): void {
        const numberType: boolean = this.type === DATA_TYPE.Float || this.type === DATA_TYPE.Int;
        let validValue = "";
        numberType ? validValue = getValidNumberString(this.control.value, this.type,this.isPositiveNum) : validValue=this.control.value;
        // const validValue = getValidNumberString(value, this.type,this.isPositiveNum);
        this.control.setValue(validValue);
        this.control.markAsTouched();
        this.isValidEvent.emit(this.control.valid);
        if (!this.emitInvalidValue && this.control.status === 'INVALID') return;
        this.valueChange.emit( (this.toNumber && Number(validValue).toString() !== "NaN")? Number(this.getPrecisionLimit(validValue)) : this.getPrecisionLimit(validValue));
    }

    public resetStatus(): void {
        this.control.reset();
    }

    public onSwipe(e): void {

    }

    public setDefaultValue(direction: string): void {
        let list = localStorage.getItem(CommandLocalType.CommandList);
        if(JSON.parse(list).length === 0 || !list) {
            return;
        }
        let value: string = "";
        if(direction === InputType.Top) {
            // Number(localStorage.getItem(CommandLocalType.CommandIndex)) === 0 ? localStorage.setItem(CommandLocalType.CommandIndex,JSON.parse(list).length.toString()) : "";
            // let index = Number(localStorage.getItem(CommandLocalType.CommandIndex))-1;
            // localStorage.setItem(CommandLocalType.CommandIndex,index.toString());
            // value = JSON.parse(list)[index];
            const obj  = this.terminal.up(this.lastCmdIndex,this.control.value);
            value = obj.cmd;
            this.lastCmdIndex = obj.index;
        }
        if(direction === InputType.Bottom) {

            // Number(localStorage.getItem(CommandLocalType.CommandIndex)) >= (JSON.parse(list).length-1) ? localStorage.setItem(CommandLocalType.CommandIndex,"-1") : "";
            // let index = Number(localStorage.getItem(CommandLocalType.CommandIndex))+1;
            // localStorage.setItem(CommandLocalType.CommandIndex,index.toString());
            // value = JSON.parse(list)[Number(localStorage.getItem(CommandLocalType.CommandIndex))];
            const obj  = this.terminal.down(this.lastCmdIndex,this.control.value);
            value = obj.cmd;
            this.lastCmdIndex = obj.index;
        }
        (this.value || this.value == 0) && this.control.setValue(value);
        this.control.value ? this.inputElement.setSelectionRange(this.control.value.length,this.control.value.length) : "";
        this.inputElement = this.numInput.nativeElement as HTMLInputElement;
        if (this.inputWidth < this.ckb.getCharWidth(this.control.value,this.password) && this.keyBoardDialog) {
            this.textIndent = this.inputWidth - this.ckb.getCharWidth(this.control.value,this.password);
        }else {
            this.textIndent = 0;
        }
    }

    public setControlValue(value: string | string){
        this.control.setValue(value);
    }

    private getPrecisionLimit(value: string | number): any {
        let returnValue: any = "";
        if(this.type === DATA_TYPE.Float && value.toString().indexOf(".") > -1) {
            let arrValue = value.toString().split(".");
            if(arrValue[1].length > this.precision) {
                arrValue[1] = arrValue[1].slice(0,6);
            }
            returnValue = arrValue[0] + "." + arrValue[1];
        }else {
            returnValue = value;
        }
        this.control.setValue(returnValue);
        this.control.markAsTouched();
        return returnValue;
    }


}
