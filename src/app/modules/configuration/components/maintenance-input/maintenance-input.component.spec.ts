import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceInputComponent } from './maintenance-input.component';
import { HttpClientModule } from '@angular/common/http';


import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaintenanceService } from '../../services/maintenance.service';
import { of } from 'rxjs';
import { LoginService } from '../../../core';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MaterialComponentsModule } from '../../../material-components/material-components.module';
import { SysLogWatcherService } from '../../../sys-log/services/sys-log-watcher.service';


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

const fakeService = jasmine.createSpyObj('MaintenanceService', ['save', 'saveMatDialog']);
const saveDataSpy = fakeService.save.and.returnValue(Promise.resolve());
const getDataSpy = fakeService.saveMatDialog.and.returnValue(of(true));

const fakeloginService = jasmine.createSpyObj('LoginService', ['isAdmin']);
const SysLogService = jasmine.createSpyObj('SysLogWatcherService', ['refreshLog']);


describe('MaintenanceInputComponent', () => {
    let component: MaintenanceInputComponent;
    let fixture: ComponentFixture<MaintenanceInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaintenanceInputComponent, NumberInputComponent],
            imports: [FormsModule, ReactiveFormsModule, HttpClientModule, MaterialComponentsModule, BrowserAnimationsModule, UnitTestModule],
            providers: [
                { provide: MaintenanceService, useValue: fakeService },
                { provide: LoginService, useValue: fakeloginService },
                { provide: SysLogWatcherService, useValue: SysLogService },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MaintenanceInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('limitNum', () => {
        const convertToNumber = {
            target: {
                value: "123"
            }
        }
        component.limitNum(convertToNumber);
        component.limitNum(convertToNumber);
        expect(component.inputForm.value.orderNum).toBe('123');
        component.limitNum(convertToNumber);
        expect(convertToNumber.target.value).toBe('123');
        const limitNum = {
            target: {
                value: "200"
            }
        }
        component.limitNum(limitNum);
        expect(limitNum.target.value).toBe('200');
        const limitNum2 = {
            target: {
                value: "20abc"
            }
        }
        component.limitNum(limitNum2);
        expect(limitNum2.target.value).toBe('20');
    })

    it('checkedList', () => {
        component.checkedList();
        component.dataSourceCheck.forEach((value) => {
            expect(value.apply).toBe(true);
        })
        expect(component.dataSourceCheck.length).not.toBeGreaterThan(component.dataSource.length);
        component.dataSource = [
            { moduleName: "Belt", usedLife: { unit: "hours", max: 20000, index: 0, vaild: true, control: new FormControl(200) }, apply: false },
            { moduleName: "Spline grease", usedLife: { unit: "km", max: 400, index: 1, vaild: false, control: new FormControl(392) }, apply: true },
            { moduleName: "Encoder battery", usedLife: { unit: "Ah", max: 15, index: 2, vaild: true, control: new FormControl(100) }, apply: false },
        ];
        component.checkedList();
    })

    it('save', () => {
        expect(component).toBeTruthy();
        fixture.whenStable().then(() => {
            component.dataSourceCheck = [{ moduleName: "Encoder battery", usedLife: { unit: "Ah", max: 15, index: 2, vaild: true, control: new FormControl(100) }, apply: false }];

            component.save();
            fakeService.saveMatDialog.and.returnValue(of(false));
            component.save();
            fakeService.saveMatDialog.and.returnValue(of(true));
            component.save();
            expect(component.person.length).toBe(3);
        });
    })

    it('stringCut', () => {
        const strLess: string = "abdhufo";
        const strEqual: string = "abcdeabcdeabcdeabcdeabcde";
        const strGreat: string = "dfhahfuowdlfhuosdfhahfuowdlfhuos";
        component.stringCut(strLess, "person");
        expect(component.person).toBe('+"abdhufo"');
        component.stringCut(strEqual, "comment");
        expect(component.comment).toBe('+"abcdeabcdeabcdeabcdeabcde"');
        component.stringCut(strGreat, "person");
        expect(component.person).toBe('+"abdhufo"+"dfhahfuowdlfhuosdfhahfuow"+"dlfhuos"');
    })

    it('isValidEvent', () => {
        component.isValidEvent(true, 0);
        expect(component.dataSource[0].usedLife.vaild).toBe(true);
    })

});
