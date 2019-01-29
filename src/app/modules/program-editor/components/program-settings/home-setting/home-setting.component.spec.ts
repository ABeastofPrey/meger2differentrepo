import { MatSnackBar, MatDialog } from '@angular/material';
import { SharedModule } from '../../../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { HomeSettingComponent } from './home-setting.component';
import { HomeSettingService } from '../../../services/home-setting.service';

describe('PositionTriggerComponent', () => {
    let fixture: ComponentFixture<HomeSettingComponent>;
    let comp: HomeSettingComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HomeSettingComponent],
            imports: [SharedModule, BrowserAnimationsModule],
            providers: [
                {provide: HomeSettingService, useValue: {}}
            ],
            schemas: [NO_ERRORS_SCHEMA]
        });
    });

    beforeEach(async(() => {
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(HomeSettingComponent);
            comp = fixture.componentInstance;
        });
    }));
    it('should create', () => {
        fixture.detectChanges();
        expect(comp).toBeTruthy();
    });
});
