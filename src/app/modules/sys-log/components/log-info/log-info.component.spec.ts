import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LogInfoComponent } from './log-info.component';
import { LogDetailsComponent } from '../log-details/log-details.component';
import { LogProfileComponent } from '../log-profile/log-profile.component';
import { LogMCInfoComponent } from '../log-mc-info/log-mc-info.component';
import { LogCauseComponent } from '../log-cause/log-cause.component';
import { LogEffectComponent } from '../log-effect/log-effect.component';
import { MAT_DIALOG_DATA } from '@angular/material';
import { LoginService, ScreenManagerService } from '../../../core';
import { ProgramEditorService } from '../../../program-editor/services/program-editor.service';
import { Router } from '@angular/router';

describe('LogInfoComponent', () => {
  let component: LogInfoComponent;
  let fixture: ComponentFixture<LogInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LogInfoComponent, LogDetailsComponent, LogProfileComponent,
        LogMCInfoComponent, LogEffectComponent, LogCauseComponent
      ],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LoginService, useValue: {} },
        { provide: ScreenManagerService, useValue: {} },
        { provide: ProgramEditorService, useValue: {} },
        { provide: Router, useValue: {} },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
