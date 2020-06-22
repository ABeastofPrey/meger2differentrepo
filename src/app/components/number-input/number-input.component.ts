import {
    Component, OnInit, Input, Output, ViewChild, ElementRef, OnChanges, SimpleChanges,
    EventEmitter, AfterViewInit, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';
import { fromEvent, Subject } from 'rxjs';
import { isNotNaN, isNotNumber, isUndefined, isNull } from 'ramda-adjunct';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { UtilsService } from '../../modules/core/services/utils.service';

export type Appearance = 'standard' | 'legacy' | 'legacy' | 'outline';

export type InputType = 'int' | 'float';

@Component({
    selector: 'cs-number-input',
    templateUrl: './number-input.component.html',
    styleUrls: ['./number-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberInputComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    @Input() type: InputType;
    @Input() min: number;
    @Input() max: number;
    @Input() leftClosedInterval = true;
    @Input() rightClosedInterval = true;
    @Input() required: boolean = false;
    @Input() requiredErrMsg: string;
    @Input() disabled: boolean = false;
    @Input() appearance: Appearance = 'standard';
    @Input() label: string | number;
    @Input() prefix: string | number;
    @Input() suffix: string | number;
    @Input() hint: string;
    @Input() placeHolder: string | number;
    @Input() value: string;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() blurEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() pressEnterEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('numInput', { static: true }) numInput: ElementRef<FromEventTarget<{ target: HTMLInputElement }>>;

    private stopSubscribe: Subject<void> = new Subject<null>();
    
    public control: FormControl = new FormControl();

    constructor(private utils: UtilsService) { }

    ngOnInit(): void {
        if (isNotNumber(this.min) && isNotNumber(this.max)) return;
        const validator = this.utils.limitValidator(this.min, this.max, this.type === 'float', this.leftClosedInterval, this.rightClosedInterval);
        const validators = [validator];
        this.required && validators.push(Validators.required);
        this.control.setValidators(validators);
    }

    ngAfterViewInit(): void {
        const inputEvent = fromEvent<{ target: HTMLInputElement }>(this.numInput.nativeElement, 'input');
        const bulrEvent = fromEvent<{ target: HTMLInputElement }>(this.numInput.nativeElement, 'blur');
        const keyupEvent = fromEvent<{ target: HTMLInputElement }>(this.numInput.nativeElement, 'keyup');
        inputEvent.pipe(takeUntil(this.stopSubscribe)).subscribe(input => {
            const curStr = input.target.value.trim();
            let validValue = null;
            if (this.type.toLowerCase() === 'float') {
                const [validStr] = curStr.match(/[-]?[0-9]*[\.]?[0-9]*/g);
                const lastIsPoint = [...validStr].pop() === '.';
                const floatNumver = parseFloat(validStr);
                const finalNumber = lastIsPoint ? `${floatNumver}.` : floatNumver.toString();
                const finalString = isNotNaN(floatNumver) ? finalNumber : '';
                validValue = (validStr === '.' || validStr === '-') ? validStr : finalString;
            } else if (this.type.toLowerCase() === 'int') {
                const [validStr] = curStr.match(/[-]?[0-9]*/g);
                const intNumber = parseInt(validStr);
                const finalString = isNotNaN(intNumber) ? intNumber.toString() : '';
                validValue = (validStr === '-') ? validStr : finalString;
            }
            this.control.setValue(validValue);
            this.control.markAsTouched();
            this.valueChange.emit(validValue);
            this.isValidEvent.emit(this.control.valid);
        });

        bulrEvent.pipe(takeUntil(this.stopSubscribe)).subscribe(() => {
            this.control.markAsTouched();
            this.blurEvent.emit(this.control.value);
            this.isValidEvent.emit(this.control.valid);
        });

        keyupEvent.pipe(takeUntil(this.stopSubscribe)).subscribe((event: any) => {
            const isNotPressEnter = event.keyCode !== 13;
            if (isNotPressEnter) return;
            this.control.markAsTouched();
            this.pressEnterEvent.emit(this.control.value);
            this.isValidEvent.emit(this.control.valid);
        });
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

    resetStatus(): void {
        this.control.reset();
    }

    ngOnDestroy(): void {
        this.stopSubscribe.next();
        this.stopSubscribe.unsubscribe();
    }
}
