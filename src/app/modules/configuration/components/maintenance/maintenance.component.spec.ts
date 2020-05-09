import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceComponent } from './maintenance.component';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

@Component({ selector: 'app-maintenance-input', template: '' })
export class MaintenanceInputComponent { }

@Component({ selector: 'app-maintenance-history', template: '' })
export class MaintenanceHistoryComponent { }

@Component({ selector: 'app-maintenance-information', template: '' })
export class MaintenanceInformationComponent { }


describe('MaintenanceComponent', () => {
    let component: MaintenanceComponent;
    let fixture: ComponentFixture<MaintenanceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaintenanceComponent, MaintenanceInputComponent, MaintenanceHistoryComponent, MaintenanceInformationComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MaintenanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
