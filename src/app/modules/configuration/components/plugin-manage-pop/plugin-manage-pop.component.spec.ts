import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginManagePopComponent } from './plugin-manage-pop.component';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PluginManageService } from '../../services/plugin.manage.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { of } from 'rxjs';

const fakePluginManageService = jasmine.createSpyObj('PluginManageService', ['getUnstallPluginDepend']);
fakePluginManageService.getUnstallPluginDepend.and.returnValue(of([{ "Name": "plugin1", "Version": "1.1" }]))

describe('PluginManagePopComponent', () => {
    let component: PluginManagePopComponent;
    let fixture: ComponentFixture<PluginManagePopComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PluginManagePopComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: PluginManageService, useValue: fakePluginManageService },
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                { provide: MAT_DIALOG_DATA, useValue: { pluginName: "pluginName" } },
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PluginManagePopComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onCancel', () => {
        component.onCancel();
    });

    it('onConfirm', () => {
        component.onConfirm();
    });
});
