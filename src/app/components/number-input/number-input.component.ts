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
export class NumberInputComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input() required: boolean = false;
    @Input() appearance: Appearance = 'standard';
    @Input() label: string | number;
    @Input() prefix: string | number;
    @Input() suffix: string | number;
    @Input() hint: string;
    @Input() placeHolder: string | number;
    @Input() type: InputType;
    @Input() disabled: boolean = false;
    @Input() min: number;
    @Input() max: number;
    @Input() leftClosedInterval = true;
    @Input() rightClosedInterval = true;
    @Input() value: string;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() blur: EventEmitter<string> = new EventEmitter<string>();
    @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('numInput', { static: true }) numInput: ElementRef<FromEventTarget<{ target: HTMLInputElement }>>;

    private stopSubscribe: Subject<null> = new Subject<null>();

    public control: FormControl = new FormControl();

    constructor(private utils: UtilsService) { }

    ngOnInit(): void {
        if (isNotNumber(this.min) && isNotNumber(this.max)) return;
        const validator = this.utils.limitValidator(this.min, this.max, this.type === 'float', this.leftClosedInterval, this.rightClosedInterval);
        const validators = [validator];
        if (this.required) {
            validators.push(Validators.required);
        }
        this.control.setValidators(validators);
    }

    ngAfterViewInit(): void {
        fromEvent<{ target: HTMLInputElement }>(this.numInput.nativeElement, 'input')
            .pipe(takeUntil(this.stopSubscribe))
            .subscribe(input => {
                const curStr = input.target.value.trim();
                if (this.type.toLowerCase() === 'float') {
                    const [validStr] = curStr.match(/[-]?[0-9]*[\.]?[0-9]*/g);
                    const lastIsPoint = [...validStr].pop() === '.';
                    const floatNumver = parseFloat(validStr);
                    const finalNumber = lastIsPoint ? `${floatNumver}.` : floatNumver.toString();
                    const finalString = isNotNaN(floatNumver) ? finalNumber : '';
                    input.target.value = (validStr === '.' || validStr === '-') ? validStr : finalString;
                } else if (this.type.toLowerCase() === 'int') {
                    const [validStr] = curStr.match(/[-]?[0-9]*/g);
                    const intNumber = parseInt(validStr);
                    const finalString = isNotNaN(intNumber) ? intNumber.toString() : '';
                    input.target.value = (validStr === '-') ? validStr : finalString;
                }
                this.control.markAsTouched();
                this.valueChange.emit(input.target.value);
                this.isValidEvent.emit(this.control.valid);
            });

        fromEvent<{ target: HTMLInputElement }>(this.numInput.nativeElement, 'blur')
            .pipe(takeUntil(this.stopSubscribe))
            .subscribe(input => {
                this.control.markAsTouched();
                this.blur.emit(input.target.value);
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

    ngOnDestroy(): void {
        this.stopSubscribe.next(null);
        this.stopSubscribe.unsubscribe();
    }
}
