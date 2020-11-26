import {
    Component, OnInit, OnDestroy, ViewChild, ElementRef,
    AfterViewInit, Output, EventEmitter, Input, OnChanges, SimpleChange, ChangeDetectionStrategy
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { MatButton } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Trace } from '../../../services/trace.service';

@Component({
    selector: 'app-trace-new',
    templateUrl: './trace-new.component.html',
    styleUrls: ['./trace-new.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraceNewComponent implements OnInit, OnDestroy, AfterViewInit {
    // @ViewChild('newTraceInput', { static: true }) newTraceInput: ElementRef;
    @ViewChild('createTraceBtn', { static: false }) createTraceBtn: MatButton;
    @Output() createTraceEvent: EventEmitter<string> = new EventEmitter<string>();
    @Input() traceList: Trace[] = [];
    @Input() label: string;
    @Input() placeholder: string;
    @Input() beginWithLetter: boolean = false;
    @Input() forTrace = true;
    @Input() existNameList: string[] = [];

    public validName: boolean = false;

    public existTraceList: string[] = [];

    private endSubscribe: Subject<boolean> = new Subject<boolean>();
    public control: FormControl = new FormControl('');
    constructor() { }


    ngOnInit(): void { }

    ngAfterViewInit(): void {
        // fromEvent(this.newTraceInput.nativeElement, 'input')
        //     .pipe(takeUntil(this.endSubscribe))
        //     .subscribe((input: any) => {
        //         const [validName] = input.target.value.match(/[a-zA-Z0-9_]*/g);
        //         const name = validName.slice(0, 32);
        //         this.control.patchValue(name);
        //         if (this.traceList.findIndex(x => (x.name === name || x === name.toUpperCase())) !== -1) {
        //             this.control.setErrors({ exist: {} });
        //             this.control.markAsTouched();
        //         }
        //         let reg = /^[a-zA-Z]/;
        //         if(this.beginWithLetter && !reg.test(name) && name !== ""){
        //             this.control.setErrors({ beginWithLetter: {} });
        //             this.control.markAsTouched();
        //         }
        //     });

        // fromEvent(this.newTraceInput.nativeElement, 'keydown')
        //     .pipe(takeUntil(this.endSubscribe))
        //     .subscribe((event: KeyboardEvent) => {
        //         // if press enter key.
        //         (event.keyCode === 13 && this.control.value.length !== 0) && this.createTraceEvent.emit(this.control.value);
        //         event.stopPropagation();
        //     });

        // fromEvent(this.createTraceBtn._elementRef.nativeElement, 'click')
        //     .pipe(takeUntil(this.endSubscribe))
        //     .subscribe(() => {
        //         this.createTraceEvent.emit(this.control.value);
        //     });
    }

    public getTraceName(traceList: Trace[]): string[] {
      return traceList ? traceList.map(t => t.name) : [];
    }

    ngOnDestroy(): void {
        this.endSubscribe.next(true);
        this.endSubscribe.unsubscribe();
    }

    sendValue(): void {
        this.createTraceEvent.emit(this.control.value);
    }

    change(value: string): void {
        this.control.setValue(value);
        this.control.markAsTouched();
    }


    onValidEvent(valid){
      this.validName = valid;
    }
}
