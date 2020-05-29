import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionTemplateConfigRightComponent } from './vision-template-config-right.component';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VisionService } from '../../services/vision.service';
import { FormControl, Validators } from '@angular/forms';

@Component({ selector: 'app-drop-down-add', template: '' })
export class NumberInputComponent {
    @Input() lists: string[] = ["list1", "list2"];
    @Input() selected: string = "list1";
    @Input() placeholder: string = "placeholder";
    @Input() title: string = "title";
    @Input() msg: string = "msg";
    @Input() maxLimit: number = 10;
    @Input() label: string = "label";
    @Output() deleteEmit: EventEmitter<string> = new EventEmitter<string>();
    @Output() addEmit: EventEmitter<string> = new EventEmitter<string>();
    @Output() selectEmit: EventEmitter<string> = new EventEmitter<string>();
}

const fakeService = jasmine.createSpyObj('VisionService', ['search', 'createDialog', 'yesnoDialog', 'getCurrentJob', 'setCurrentJob']);
const getDataSearch = fakeService.search.and.returnValue(Promise.resolve());
const templateList1 = {
    cmd: "",
    err: null,
    result: JSON.stringify(["template1", "template2"])
}

const templateList2 = {
    cmd: "",
    err: null,
    result: JSON.stringify([])
}

const templateList3 = {
    cmd: "",
    err: null,
    result: JSON.stringify(["TEMPLATEJOB"])
}

const data = {
    "respondData": [
        { "dataName": "s", "dataType": "Float" },
        { "dataName": "Y", "dataType": "Float" },
        { "dataName": "A", "dataType": "Float" }],
    "respondError": [
        { "dataName": "Error", "dataType": "String" }],
    "respondStatus": [
        { "dataName": "Status", "dataType": "Boolean" }]
}


const templateData = {
    cmd: "",
    err: null,
    result: JSON.stringify(data)
}

const addJobData0 = {
    cmd: "",
    err: null,
    result: "0"
}

const addJobData1 = {
    cmd: "",
    err: null,
    result: "1"
}

describe('VisionTemplateConfigRightComponent', () => {
    let component: VisionTemplateConfigRightComponent;
    let fixture: ComponentFixture<VisionTemplateConfigRightComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VisionTemplateConfigRightComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: VisionService, useValue: fakeService },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisionTemplateConfigRightComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnChanges', () => {
        component.stationName = "s"
        const templateLists = fakeService.search.and.returnValue(Promise.resolve(templateList1));
        const currentJob = fakeService.getCurrentJob.and.returnValue(Promise.resolve({ result: "template1" }));
        fixture.whenStable().then(() => {
            // component.ngOnChanges();
            templateLists.then(() => {
                expect(component.templateList.length).toBe(2);
            })
        });
    })

    it('getJobListByStaionElse', () => {
        component.stationName = "s"
        const templateLists = fakeService.search.and.returnValue(Promise.resolve(templateList1));
        const currentJob = fakeService.getCurrentJob.and.returnValue(Promise.resolve({ result: "" }));
        fixture.whenStable().then(() => {
            // component.ngOnChanges();
            templateLists.then(() => {
                expect(component.templateName).toBe("");
            })
        });
    })

    it('selectedTemplate', () => {
        const searchValue = fakeService.search.and.returnValue(Promise.resolve(templateData));
        component.selectedTemplate("template1");
        fixture.whenStable().then(() => {
            fakeService.search.and.returnValue(Promise.resolve({ result: "0" }));
            component.selectedDataType(0);
            component.changeInput({ target: { value: "A" } }, 0, 'respondData');
            component.blurReapondData(0);
            component.respondData[0].dataName = new FormControl("abc");
            component.blurReapondData(0);
            component.respondData[0].originalName = "";
            component.blurReapondData(0);
            fakeService.search.and.returnValue(Promise.resolve({ result: "1" }));
            component.respondData[0].originalName = "origin";
            component.respondData[0].dataName = new FormControl("abc");
            component.blurReapondData(0);
            component.respondData[0].originalName = "";
            component.blurReapondData(0);
            searchValue.then(() => {
                expect(component.respondData.length).toBe(3);

            })
        });
    });

    it('blurReapondData', () => {
        const searchValue = fakeService.search.and.returnValue(Promise.resolve(templateData));
        component.selectedTemplate("template1");
        fixture.whenStable().then(() => {
            component.selectedDataType(0);
            component.changeInput({ target: { value: "A" } }, 0, 'respondData');
            component.respondData[0].originalName = "";
            component.blurReapondData(0);
            component.addRespondDataList();
            component.stationName = "stationA";
            component.templateName = "templateA";
            searchValue.then(() => {
                expect(component.respondData.length).toBe(3);

            })
        });
    });

    it('addJob', () => {
        fixture.whenStable().then(() => {
            fakeService.search.and.returnValue(Promise.resolve(addJobData1));
            component.addJob("asd");
            const returnTrue = fakeService.search.and.returnValue(Promise.resolve(addJobData0));
            component.addJob("abc");
            returnTrue.then(() => {
                expect(component.templateName).toBe("ABC");
            })
        });
    });

    it('deleteJob', () => {
        fixture.whenStable().then(() => {
            const returnTrue = fakeService.search.and.returnValue(Promise.resolve(addJobData0));
            component.templateName = "abc";
            component.deleteJob("abc")
            fakeService.search.and.returnValue(Promise.resolve(addJobData1));
            component.deleteJob("asd");
            returnTrue.then(() => {
                expect(component.templateName).toBe("");
            })
        });
    });

    it('deleteRespondData', () => {
        const searchValue = fakeService.search.and.returnValue(Promise.resolve(templateData));
        component.selectedTemplate("template1");
        fixture.whenStable().then(() => {
            fakeService.search.and.returnValue(Promise.resolve({ result: "0" }));
            component.deleteRespondData(0);
            fakeService.search.and.returnValue(Promise.resolve({ result: "1" }));
            component.deleteRespondData(0);
        })
    })

    it('setResErrorName', () => {
        const searchValue = fakeService.search.and.returnValue(Promise.resolve(templateData));
        component.selectedTemplate("template1");
        fixture.whenStable().then(() => {
            fakeService.search.and.returnValue(Promise.resolve({ result: "0" }));
            component.setResErrorName(0);
            fakeService.search.and.returnValue(Promise.resolve({ result: "1" }));
            component.setResErrorName(0);
            component.respondError[0].dataName = new FormControl("", [Validators.required]);
            component.setResErrorName(0);
        })
    });

    it('selectedError', () => {
        const searchValue = fakeService.search.and.returnValue(Promise.resolve(templateData));
        component.selectedTemplate("template1");
        fixture.whenStable().then(() => {
            component.selectedError(0);
        })
    });

    it('setResStatusName', () => {
        const searchValue = fakeService.search.and.returnValue(Promise.resolve(templateData));
        component.selectedTemplate("template1");
        fixture.whenStable().then(() => {
            fakeService.search.and.returnValue(Promise.resolve({ result: "0" }));
            component.setResStatusName(0);
            fakeService.search.and.returnValue(Promise.resolve({ result: "1" }));
            component.setResStatusName(0);
            component.respondStatus[0].dataName = new FormControl("", [Validators.required]);
            component.setResStatusName(0);
        })
    });

    it('selectedStatus', () => {
        const searchValue = fakeService.search.and.returnValue(Promise.resolve(templateData));
        component.selectedTemplate("template1");
        fixture.whenStable().then(() => {
            component.selectedStatus(0);
        })
    });


});
