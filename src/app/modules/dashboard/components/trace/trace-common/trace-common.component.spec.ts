import { Component, Input, Output, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TraceCommonComponent } from './trace-common.component';
import { MaterialComponentsModule } from '../../../../material-components/material-components.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TraceService, Trace, TraceStatus } from '../../../services/trace.service';

@Component({ selector: 'custom-key-board', template: '' })
export class CustomKeyBoardComponent {
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
}

@Component({ selector: 'app-trace-new', template: '' })
export class TraceNewComponent {
    @Input() traceList: Trace[] = [];
    @Input() label: string;
    @Input() placeholder: string;
    @Input() beginWithLetter: boolean = false;
    @Output() createTraceEvent: EventEmitter<string> = new EventEmitter<string>();
}

const fakeDialog = {
    open: () => ({
        afterClosed: () => of(true)
    })
};

const traceService = jasmine.createSpyObj('TraceService', [
    'getSelectedTraceName', 'getTraceList', 'getRateList', 'startCheckTraceStatus',
    'getRunningTraceName', 'getSelectedConfig', 'createTrace', 'startTrigger', 'getTraceStatus',
    'traceOnOff', 'setTotalRecTime', 'setSamplingTime', 'deleteTrace', 'hasSelectedTrigger'
]);
traceService.getSelectedTraceName.and.returnValue(of('Trace A'));
traceService.getRunningTraceName.and.returnValue(of(''));
traceService.getTraceStatus.and.returnValue(of(TraceStatus.NOTREADY));
traceService.getRateList.and.returnValue(of([4, 8, 12]));
traceService.startCheckTraceStatus.and.returnValue(of(TraceStatus.NOTREADY));
traceService.getSelectedConfig.and.returnValue(of(true));
traceService.hasSelectedTrigger.and.returnValue(of(true));
const fakeTraces: Trace[] = [{
    name: 'Trace A',
    duration: 30,
    rate: 8,
}, {
    name: 'Trace B',
    duration: 20,
    rate: 4,
}];
traceService.getTraceList.and.returnValue(of(fakeTraces));

describe('TraceCommonComponent', () => {
    let component: TraceCommonComponent;
    let fixture: ComponentFixture<TraceCommonComponent>;
    let service: TraceService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TraceCommonComponent, CustomKeyBoardComponent, TraceNewComponent],
            providers: [
                { provide: TraceService, useValue: traceService },
                { provide: MatDialog, useValue: fakeDialog },
            ],
            imports: [FormsModule, HttpClientModule, MaterialComponentsModule, BrowserAnimationsModule, UnitTestModule,],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TraceCommonComponent);
        component = fixture.componentInstance;
        service = TestBed.get(TraceService);
        fixture.detectChanges();
    });

    it('should create', () => {
        traceService.getRunningTraceName.and.returnValue(of(''));
        traceService.getTraceList.and.returnValue(of(fakeTraces));
        expect(component).toBeTruthy();
    });

    it('should get no running trace', () => {
        traceService.getRunningTraceName.and.returnValue(of(''));
        traceService.startCheckTraceStatus.and.returnValue(of(TraceStatus.TRACEING));
        component.ngOnInit();
        service.getRunningTraceName().subscribe(runningTraceName => {
            expect(runningTraceName).toEqual('');
        });
    })

    // it('should get running trace is the same as select trace', () => {
    //     traceService.getRunningTraceName.and.returnValue(of('Trace A'));
    //     traceService.getTraceList.and.returnValue(of(fakeTraces));
    //     component.ngOnInit();
    //     service.getRunningTraceName().subscribe(runningTraceName => {
    //         expect(runningTraceName).toEqual(fakeTraces[0].name);
    //     });
    // });

    it('should get running trace is not the same as select trace', () => {
        traceService.getRunningTraceName.and.returnValue(of('Trace B'));
        traceService.getTraceList.and.returnValue(of(fakeTraces));
        component.ngOnInit();
        service.getRunningTraceName().subscribe(runningTraceName => {
            expect(runningTraceName).toEqual(fakeTraces[1].name);
        });
    });

    it('should deleteTrace', () => {
        traceService.deleteTrace.and.returnValue(of(true));
        component.traceList.subscribe(res => {
            expect(res.length).toEqual(2);
        });
        component.ngOnInit();
        component.deleteTrace(new MouseEvent('click'), { name: 'Trace D'} as any);
    });

    it('should deleteTrace with no selectedTrace', () => {
        traceService.deleteTrace.and.returnValue(of(true));
        component.ngOnInit();
        component.traceList.subscribe(res => {
            expect(res.length).toEqual(2);
        });
        component.selectedTrace = undefined;
        component.deleteTrace(new MouseEvent('click'), { name: 'Trace D'} as any);
    });

    it('should addTrace', () => {
        const preValue = component.addingNewTrace;
        component.addTrace(new MouseEvent('click'));
        let curValue = component.addingNewTrace;
        expect(preValue).not.toEqual(curValue);
    });

    it('should createTrace', () => {
        traceService.createTrace.and.returnValue(of(true));
        const trace: Trace = { name: 'Trace D', duration: 30, rate: 4 };
        component.createTrace('Trace D');
        service.createTrace(trace).subscribe(() => {
            expect(component.addingNewTrace).toEqual(false);
        });
    });

    it('should startTrigger', () => {
        traceService.startTrigger.and.returnValue(of(true));
        component.startTrigger();
        expect(true).toBe(true);
    });

    it('should changeTraceStatus', () => {
        traceService.traceOnOff.and.returnValue(of(true));
        component.changeTraceStatus();
        expect(true).toBe(true);
    });

    it('should changeDuration', () => {
        component.isValid = false;
        traceService.setTotalRecTime.and.returnValue(of(true));
        component.changeDuration();
        expect(traceService.setTotalRecTime).not.toHaveBeenCalled();
        component.isValid = true;
        component.changeDuration();
        expect(traceService.setTotalRecTime).toHaveBeenCalled();
    });

    it('should changeRate', () => {
        traceService.setSamplingTime.and.returnValue(of(true));
        component.changeRate();
        expect(true).toBe(true);
    });

    it('should checkIsValid', () => {
        component.checkIsValid(true);
        expect(component.isValid).toBe(true);
        component.checkIsValid(false);
        expect(component.isValid).toBe(false);
    });
});
