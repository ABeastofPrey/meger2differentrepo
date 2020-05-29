import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionTemplateConfigComponent } from './vision-template-config.component';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VisionService } from '../../services/vision.service';
import { of, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DataService } from '../../../core';


@Component({ selector: 'app-vision-template-config-right', template: '' })
export class VisionTemplateConfigRightComponent {
    @Input() stationName: string = "stationName";
    @Input() typeList: string[] = ["Float", "String"];
}

@Component({ selector: 'cs-number-input', template: '' })
export class NumberInputComponent {
    @Input() required: boolean = true;
    @Input() appearance: any = 'standard';
    @Input() label: string | number;
    @Input() prefix: string | number;
    @Input() suffix: string | number;
    @Input() hint: string;
    @Input() placeHolder: string | number;
    @Input() type: any;
    @Input() disabled: boolean = false;
    @Input() min: number;
    @Input() max: number;
    @Input() leftClosedInterval = true;
    @Input() rightClosedInterval = true;
    @Input() value: string;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() blur: EventEmitter<string> = new EventEmitter<string>();
    @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
}

const fakeService = jasmine.createSpyObj('VisionService', ['search', 'createDialog', 'yesnoDialog', 'setCurrentStation', 'getCurrentStation', '']);
const datasService = jasmine.createSpyObj('DataService', ['refreshVision']);
const getDataSearch = fakeService.search.and.returnValue(Promise.resolve());
const obser = new Observable((obser) => {
    obser.next("value");
})
const datasObservable = datasService.refreshVision.and.returnValue(obser);

describe('VisionTemplateConfigComponent', () => {
    let component: VisionTemplateConfigComponent;
    let fixture: ComponentFixture<VisionTemplateConfigComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VisionTemplateConfigComponent, VisionTemplateConfigRightComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: VisionService, useValue: fakeService },
                { provide: DataService, useValue: datasService },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        let input = '<input type="text" id="ip2"/>'
        document.body.insertAdjacentHTML('afterbegin', input);
        fixture = TestBed.createComponent(VisionTemplateConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getStationList', () => {
        const resultTrue = { "result": "stationA" };
        const searchReturn = { result: JSON.stringify(["stationA", "stationB"]) }
        const getDataSearch = fakeService.search.and.returnValue(Promise.resolve(searchReturn));
        const getcurStation = fakeService.getCurrentStation.and.returnValue(Promise.resolve(resultTrue));
        fixture.whenStable().then(() => {
            getDataSearch.then(() => {
                getcurStation.then(() => {
                    expect(component.stationName).toBe("stationA");
                })
            })

        });
    })

    it('getStationListElse', () => {
        const resultTrue = { "result": "stationD" };
        const searchReturn = { result: JSON.stringify(["stationA", "stationB"]) }
        const getDataSearch = fakeService.search.and.returnValue(Promise.resolve(searchReturn));
        const getcurStation = fakeService.getCurrentStation.and.returnValue(Promise.resolve(resultTrue));
        fixture.whenStable().then(() => {
            getDataSearch.then(() => {
                getcurStation.then(() => {
                    expect(component.stationName).toBe("");
                })
            })

        });
    })

    it("create", () => {
        const createReturnValue = new Observable((obser) => {
            const createDialog = {
                status: true,
                name: "stationA"
            }
            obser.next(createDialog);
        })
        const create = fakeService.createDialog.and.returnValue(createReturnValue);
        component.create();
        expect(component.stationList.includes("STATIONA")).toBe(true);
    })

    it("createElse", () => {
        const createReturnValue = new Observable((obser) => {
            const createDialog = {
                status: false,
                name: "stationA"
            }
            obser.next(createDialog);
        })
        const create = fakeService.createDialog.and.returnValue(createReturnValue);
        component.create();
        expect(component.stationName).toBe("");
    })


    it("createElseIf", () => {
        const createReturnValue = new Observable((obser) => {
            const createDialog = {
                status: false,
                name: ""
            }
            obser.next(createDialog);
        })
        const create = fakeService.createDialog.and.returnValue(createReturnValue);
        component.create();
    })

    it("selectedStation", () => {
        const data = [
            { "IP": "192.168.1.1" },
            { "Port": "8000" },
            { "Terminator": "\r\n" },
            { "Encording": "UTF8" }
        ]
        const searchTrue = fakeService.search.and.returnValue(Promise.resolve(data));
        fixture.whenStable().then(() => {
            component.selectedStation();
            searchTrue.then(() => {
                expect(component.port.value).toBe("8000")
            })
        });
    })

    it('confirmDelete', () => {
        const dataTrue = { result: "0" }
        const searchTrue = fakeService.search.and.returnValue(Promise.resolve(dataTrue));
        fixture.whenStable().then(() => {
            fakeService.yesnoDialog.and.returnValue(of(true));
            component.confirmDelete();
            fakeService.yesnoDialog.and.returnValue(of(false));
            component.confirmDelete();
            searchTrue.then(() => {
                expect(component.stationName).toBe("");
            })
        });
    })

    it('deleteElse', () => {
        const dataTrue = { result: "1" }
        const searchTrue = fakeService.search.and.returnValue(Promise.resolve(dataTrue));
        fixture.whenStable().then(() => {
            fakeService.yesnoDialog.and.returnValue(of(true));
            component.confirmDelete();
        });
    })

    it('changeIp', () => {
        component.changeIp("192.168.1.1");
        expect(component.ip).toBe("192.168.1.1");
    })

    it(('changePort'), () => {
        component.changePort(true);
        component.portBlur();
        component.changePort(false);
        component.portBlur();
    })

    it('selectedTerminator', () => {
        component.selectedTerminator();
    })

    it('selectEncode', () => {
        component.selectEncode();
    })

});
