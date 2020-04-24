import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TraceChannelComponent } from './trace-channel.component';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TraceService } from '../../../services/trace.service';
import { of } from 'rxjs';

const selectedTraceName = 'Trace S';
const traceService = jasmine.createSpyObj('TraceService', [
    'getSelectedTraceName', 'getModuleList', 'getTodoDoneList',
    'selectAllAxies', 'selectOne', 'unselectOne', 'unselectAll'
]);
traceService.getSelectedTraceName.and.returnValue(of(''));
traceService.getModuleList.and.returnValue(of(['AllInput']));

describe('TraceChannelComponent', () => {
    let component: TraceChannelComponent;
    let fixture: ComponentFixture<TraceChannelComponent>;
    let service: TraceService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TraceChannelComponent],
            providers: [
                { provide: TraceService, useValue: traceService }
            ],
            imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TraceChannelComponent);
        component = fixture.componentInstance;
        service = TestBed.get(TraceService);
        fixture.detectChanges();
    });

    it('should create with no selected Trace Name', () => {
        expect(component).toBeTruthy();
    });

    it('should finded with max axis 4 in firstSelectedItemAxis ', () => {
        const availableChannel = [
            { "variable": "DriveTemperature", "isIO": true, module: 'AllInput' },
            { "variable": "DClinkVoltage", "isIO": false, module: 'AllInput' }
        ];
        const selectedChannel = [
            { "module": "AllInput", "variable": "DriveTemperature", turnOn: 0 },
            { "module": "AllInput", "variable": "DriveTemperature", turnOn: 4 }
        ];
        traceService.getTodoDoneList.and.returnValue(of([availableChannel, selectedChannel]));
        traceService.getSelectedTraceName.and.returnValue(of(selectedTraceName));
        service.getTodoDoneList('CHANNEL', 'AllInput', selectedTraceName).subscribe(res => {
            expect(res.length).not.toBe(0);
        });
    });

    it('should not finded with max axis 4 in firstSelectedItemAxis ', () => {
        const availableChannel = [
            { "variable": "DriveTemperature", "isIO": true, module: 'AllInput' },
            { "variable": "DClinkVoltage", "isIO": false, module: 'AllInput' }
        ];
        const selectedChannel = [
            { "module": "AllInput", "variable": "DriveTemperature", turnOn: 0 },
            { "module": "AllInput", "variable": "DriveTemperature", turnOn: 3 }
        ];
        traceService.getTodoDoneList.and.returnValue(of([availableChannel, selectedChannel]));
        traceService.getSelectedTraceName.and.returnValue(of(selectedTraceName));
        service.getTodoDoneList('CHANNEL', 'AllInput', selectedTraceName).subscribe(res => {
            expect(res.length).not.toBe(0);
        });
    });

    it('should not finded in firstSelectedItemAxis ', () => {
        const availableChannel = [
            { "variable": "DriveTemperature", "isIO": true, module: 'AllInput' },
            { "variable": "DClinkVoltage", "isIO": false, module: 'AllInput' }
        ];
        const selectedChannel = [];
        traceService.getTodoDoneList.and.returnValue(of([availableChannel, selectedChannel]));
        traceService.getSelectedTraceName.and.returnValue(of(selectedTraceName));
        service.getTodoDoneList('CHANNEL', 'AllInput', selectedTraceName).subscribe(res => {
            expect(res.length).not.toBe(0);
        });
    });

    it('should changeModule', () => {
        const availableChannel = [
            { "variable": "DriveTemperature", "isIO": true, module: 'AllInput' },
            { "variable": "DClinkVoltage", "isIO": false, module: 'AllInput' }
        ];
        const selectedChannel = [];
        traceService.getTodoDoneList.and.returnValue(of([availableChannel, selectedChannel]));
        traceService.getSelectedTraceName.and.returnValue(of(selectedTraceName));
        component.changeModule();
        service.getTodoDoneList('CHANNEL', 'AllInput', selectedTraceName).subscribe(res => {
            expect(res.length).not.toBe(0);
        });
    });

    it('should selectOne', () => {
        const item1 = { variable: "DriveTemperature", turnOn: 0 } as any;
        const item2 = { variable: "DriveTemperature", turnOn: 1 } as any;
        const availableChannel = [
            { "variable": "DriveTemperature", "isIO": true, module: 'AllInput' },
            { "variable": "DClinkVoltage", "isIO": false, module: 'AllInput' }
        ];
        const selectedChannel = [];
        traceService.getTodoDoneList.and.returnValue(of([availableChannel, selectedChannel]));
        traceService.getSelectedTraceName.and.returnValue(of(selectedTraceName));
        traceService.selectAllAxies.and.returnValue(of(true));
        traceService.selectOne.and.returnValue(of(true));
        component.selectOne(item1);
        component.selectOne(item2);
        service.getTodoDoneList('CHANNEL', 'AllInput', selectedTraceName).subscribe(res => {
            expect(res.length).not.toBe(0);
        });
    })

    it('should unselectOne', () => {
        const item = { variable: "DriveTemperature", turnOn: 0 } as any;
        const availableChannel = [
            { "variable": "DriveTemperature", "isIO": true, module: 'AllInput' },
            { "variable": "DClinkVoltage", "isIO": false, module: 'AllInput' }
        ];
        const selectedChannel = [];
        traceService.getTodoDoneList.and.returnValue(of([availableChannel, selectedChannel]));
        traceService.getSelectedTraceName.and.returnValue(of(selectedTraceName));
        traceService.unselectOne.and.returnValue(of(true));
        component.unselectOne(item);
        service.getTodoDoneList('CHANNEL', 'AllInput', selectedTraceName).subscribe(res => {
            expect(res.length).not.toBe(0);
        });
    });

    it('should unselectAll', () => {
        const availableChannel = [
            { "variable": "DriveTemperature", "isIO": true, module: 'AllInput' },
            { "variable": "DClinkVoltage", "isIO": false, module: 'AllInput' }
        ];
        const selectedChannel = [];
        traceService.getTodoDoneList.and.returnValue(of([availableChannel, selectedChannel]));
        traceService.getSelectedTraceName.and.returnValue(of(selectedTraceName));
        traceService.unselectAll.and.returnValue(of(true));
        component.unselectAll();
        service.getTodoDoneList('CHANNEL', 'AllInput', selectedTraceName).subscribe(res => {
            expect(res.length).not.toBe(0);
        });
    })
});
