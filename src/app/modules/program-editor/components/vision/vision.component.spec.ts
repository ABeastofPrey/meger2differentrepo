import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionComponent } from './vision.component';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

@Component({ selector: 'app-vision-template-config', template: '' })
export class VisionTemplateConfigComponent { }

@Component({ selector: 'app-vision-calibration', template: '' })
export class VisionCalibrationComponent { }


describe('VisionComponent', () => {
    let component: VisionComponent;
    let fixture: ComponentFixture<VisionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VisionComponent, VisionTemplateConfigComponent, VisionCalibrationComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
