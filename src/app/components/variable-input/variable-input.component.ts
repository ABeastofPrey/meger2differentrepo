import {
    Component, OnInit, Input, Output, ViewChild, ElementRef, OnChanges, SimpleChanges,
    EventEmitter, AfterViewInit, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';
import { fromEvent, Subject } from 'rxjs';
import { isUndefined, isNull } from 'ramda-adjunct';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';

export type Appearance = 'standard' | 'legacy' | 'legacy' | 'outline';

@Component({
    selector: 'cs-variable-input',
    templateUrl: './variable-input.component.html',
    styleUrls: ['./variable-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariableInputComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    @Input() letterStart: boolean = true;
    @Input() maxLength: number = 32;
    @Input() required: boolean = false;
    @Input() requiredErrMsg: string;
    @Input() disabled: boolean = false;
    @Input() appearance: Appearance = 'standard';
    @Input() prefix: string | number;
    @Input() suffix: string | number;
    @Input() label: string;
    @Input() placeHolder: string;
    @Input() hint: string;
    @Input() value: string;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() blurEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() pressEnterEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('varInput', { static: true }) varInput: ElementRef<FromEventTarget<{ target: HTMLInputElement }>>;

    private stopSubscribe: Subject<void> = new Subject<null>();
    
    public control: FormControl = new FormControl();

    constructor() { }

    ngOnInit(): void {
        this.required && this.control.setValidators([Validators.required]);
    }

    ngAfterViewInit(): void {
        const inputEvent = fromEvent<{ target: HTMLInputElement }>(this.varInput.nativeElement, 'input');
        const bulrEvent = fromEvent<{ target: HTMLInputElement }>(this.varInput.nativeElement, 'blur');
        const keyupEvent = fromEvent<{ target: HTMLInputElement }>(this.varInput.nativeElement, 'keyup');
        inputEvent.pipe(takeUntil(this.stopSubscribe)).subscribe(input => {
            const curStr = input.target.value.trim();
            const regExp = this.letterStart ? /[a-zA-Z]+[0-9a-zA-Z_]*/g : /[0-9a-zA-Z_]+/g;
            const matchVal = curStr.match(regExp);
            const [validStr] = matchVal === null ? [''] : matchVal;
            this.control.setValue(validStr);
            this.control.markAsTouched();
            this.valueChange.emit(validStr);
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

    ngOnDestroy(): void {
        this.stopSubscribe.next();
        this.stopSubscribe.unsubscribe();
    }
}
