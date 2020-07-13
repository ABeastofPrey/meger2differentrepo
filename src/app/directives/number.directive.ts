import { Directive, ElementRef, HostListener, Input, EventEmitter, Renderer2 } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';

export type InputType = 'int' | 'float';

export const isFloat = (type: InputType) => type.toLocaleLowerCase() === 'float';

export const isInt = (type: InputType) => type.toLocaleLowerCase() === 'int';

export const getValidNumberString = (originalVal: string, type: InputType): string => {
    const firstOne = originalVal.trim()[0] === '-' ? '-' : '';
    if (isFloat(type)) {
        const validStr = originalVal.replace(/[^0-9|.]+/g, '').replace('.', '*').replace(/[.]/g, '').replace('*', '.');
        const indexOfNotZero = [...validStr].findIndex(n => n !== '0');
        const slicedString = validStr.slice(indexOfNotZero);
        const correctedStr = slicedString[0] === '.' ? `0${slicedString}` : slicedString;
        const finalString = `${firstOne}${correctedStr}`;
        return finalString;
    } else if (isInt(type)) {
        const validStr = originalVal.replace(/[^0-9]+/g, '');
        if (validStr !== '0') {
            const indexOfNotZero = [...validStr].findIndex(n => n !== '0');
            const slicedString = validStr.slice(indexOfNotZero);
            return `${firstOne}${slicedString}`;
        }
        return `${firstOne}${validStr}`;
    }
};

@Directive({
    selector: '[numberInput]'
})
export class NumberDirective {
    public onInputEvent: EventEmitter<void> = new EventEmitter<void>();
    public stopSubEvent: EventEmitter<void> = new EventEmitter<void>();
    private validValue: string = '';
    @Input('numberInput') numberInput: InputType;
    @Input('formGroup') formGroup: FormGroup;
    @Input('formControlName') formControlName: string;

    constructor(private el: ElementRef, private renderer: Renderer2) {
        this.el = el;
    }

    ngOnInit(): void {
        this.onInputEvent.pipe(debounceTime(20), takeUntil(this.stopSubEvent)).subscribe(this.onInputHandler.bind(this));
        this.renderer.listen(this.el.nativeElement, 'keyup', this.onPressEnter.bind(this));
    }

    ngOnDestroy(): void {
        this.stopSubEvent.emit();
    }

    @HostListener('input') onInput() {
        this.onInputEvent.emit();
    }

    @HostListener('blur') onBlur() {
        if (isFloat(this.numberInput)) {
            const parsedVal = parseFloat(this.validValue);
            if (parsedVal !== NaN && (Math.abs(parsedVal) === 0)) {
                this.setValue('0');
            }
            if ([...this.validValue.toString()].pop() === '.') {
                const val = this.validValue.slice(0, -1);
                this.setValue(val);
            }
        }
        if (isInt(this.numberInput)) {
            const parsedVal = parseInt(this.validValue);
            if (parsedVal !== NaN && (Math.abs(parsedVal) === 0)) {
                this.setValue('0');
            }
        }
    }

    private onPressEnter(event: any): void {
        const isNotPressEnter = event.keyCode !== 13;
        if (isNotPressEnter) return;
        this.el.nativeElement.blur();
    }

    private onInputHandler(): void {
        this.validValue = getValidNumberString(this.el.nativeElement.value, this.numberInput);
        this.setValue(this.validValue);
    }

    private setValue(validValue: string): void {
        if (this.formGroup && this.formControlName) {
            this.formGroup.patchValue({ [this.formControlName]: validValue });
        } else {
            this.el.nativeElement.value = validValue;
        }
    }
}
