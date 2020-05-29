import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, Input, OnDestroy, Optional, Self, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ControlValueAccessor, NgControl, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { isUndefined } from 'ramda-adjunct';
export class MyIp {
    constructor(public ip1: string, public ip2: string, public ip3: string, public ip4: string) { }
}


@Component({
    selector: 'app-ip-form-field',
    templateUrl: './ip-form-field.component.html',
    styleUrls: ['./ip-form-field.component.scss'],
    providers: [{ provide: MatFormFieldControl, useExisting: IpFormFieldComponent }],
    host: {
        '[class.example-floating]': 'shouldLabelFloat',
        '[id]': 'id',
        '[attr.aria-describedby]': 'describedBy',
    }
})
export class IpFormFieldComponent {

    @Output() changeIp: EventEmitter<string> = new EventEmitter<string>();
    @Input() ipInput: string;

    static nextId = 0;

    ipForm: FormGroup;
    public ip: FormControl = new FormControl("", [Validators.required, this.validIp()]);
    public ipValid: boolean = false;
    stateChanges = new Subject<void>();
    focused = false;
    errorState = false;
    controlType = 'example-tel-input';
    // id = `example-tel-input-${MyTelInput.nextId++}`;
    describedBy = '';
    onChange = (_: any) => {
    };
    onTouched = () => { };

    get empty() {
        const { value: { ip1, ip2, ip3, ip4 } } = this.ipForm;

        return !ip1 && !ip2 && !ip3 && !ip4;
    }

    get shouldLabelFloat() { return this.focused || !this.empty; }

    @Input()
    get placeholder(): string { return this._placeholder; }
    set placeholder(value: string) {
        this._placeholder = value;
        this.stateChanges.next();
    }
    private _placeholder: string;

    @Input()
    get required(): boolean { return this._required; }
    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
        this.stateChanges.next();
    }
    private _required = false;

    @Input()
    get disabled(): boolean { return this._disabled; }
    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
        this._disabled ? this.ipForm.disable() : this.ipForm.enable();
        this.stateChanges.next();
    }
    private _disabled = false;

    @Input()
    get value(): MyIp | null {
        if (this.ipForm.valid) {
            const { value: { ip1, ip2, ip3, ip4 } } = this.ipForm;
            return new MyIp(ip1, ip2, ip3, ip4);
        }
        return null;
    }
    set value(tel: MyIp | null) {
        const { ip1, ip2, ip3, ip4 } = tel || new MyIp('', '', '', '');
        this.ipForm.setValue({ ip1, ip2, ip3, ip4 });
        this.stateChanges.next();
    }

    constructor(
        formBuilder: FormBuilder,
        private _focusMonitor: FocusMonitor,
        private _elementRef: ElementRef<HTMLElement>,
        @Optional() @Self() public ngControl: NgControl) {

        this.ipForm = formBuilder.group({
            'ip1': ['', Validators.required],
            'ip2': ['', Validators.required],
            'ip3': ['', Validators.required],
            'ip4': ['', Validators.required],
        });

        _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
            if (this.focused && !origin) {
                this.onTouched();
            }
            this.focused = !!origin;
            this.stateChanges.next();
        });

        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        (({ ipInput }) => {
            if (isUndefined(ipInput)) return;
            let ipIndex: string[];
            if (this.ipInput) {
                ipIndex = this.ipInput.split(".");
            } else {
                ipIndex = ["", "", "", ""];
            }
            ipIndex.forEach((value: string, index: number) => {
                this.ipForm.value["ip" + (index + 1)] = value;
                this.ipForm.patchValue({ ...this.ipForm.value });
            })
        })(changes);
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this._focusMonitor.stopMonitoring(this._elementRef);
    }

    setDescribedByIds(ids: string[]) {
        this.describedBy = ids.join(' ');
    }

    onContainerClick(event: MouseEvent) {
        if ((event.target as Element).tagName.toLowerCase() != 'input') {
            this._elementRef.nativeElement.querySelector('input')!.focus();
        }
    }

    writeValue(tel: MyIp | null): void {
        this.value = tel;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    //IP输入规则
    validIp(): ValidatorFn {
        return ({ value }: AbstractControl) => {
            let reg = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
            return (reg.test(value) ? null : { "ip": "ip" })
        }

    }

    _handleInput(event: any, ipId: string, index: number): void {
        this.onChange(this.value);
        event.target.value = event.target.value.replace(/\D/g, '');
        this.ipForm.value[ipId] = event.target.value;
        this.ipForm.patchValue({ ...this.ipForm.value });
        let ip: string = "";
        Object.keys(this.ipForm.value).forEach((key) => {
            ip += this.ipForm.value[key] + '.';
        })
        this.ip.patchValue(ip.slice(0, ip.length - 1));
        this.ipValid = this.ip.hasError("ip");
        // 前一个输入完成后面主动获取焦点
        if (this.ipForm.value[ipId].length === 3 && ipId !== "ip4") {
            document.getElementById("ip" + (index + 1)).focus();
        }

    }

    setStationIp() {
        if (!this.ipValid && this.value) {
            const str = this.value.ip1 + "." + this.value.ip2 + "." + this.value.ip3 + "." + this.value.ip4;
            this.changeIp.emit(str);
        }
    }

    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ngAcceptInputType_required: boolean | string | null | undefined;

}
