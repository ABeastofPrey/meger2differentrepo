import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog } from '../../enums/sys-log.model';
import { LogDetailsComponent } from './log-details.component';
import { LogMCInfoComponent } from '../log-mc-info/log-mc-info.component';
import { LogCauseComponent } from '../log-cause/log-cause.component';
import { LogEffectComponent } from '../log-effect/log-effect.component';
import { LoginService, ScreenManagerService } from '../../../core';
import { ProgramEditorService } from '../../../program-editor/services/program-editor.service';
import { Router } from '@angular/router';

const loginService = {};
const screenManagerService = {};
const programEditorService = {};

describe('LogDetailsComponent', () => {
  let component: LogDetailsComponent;
  let fixture: ComponentFixture<LogDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogDetailsComponent, LogMCInfoComponent, LogCauseComponent, LogEffectComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
      providers: [
        { provide: LoginService, useValue: loginService },
        { provide: ScreenManagerService, useValue: screenManagerService },
        { provide: ProgramEditorService, useValue: programEditorService },
        { provide: Router, useValue: {} },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogDetailsComponent);
    component = fixture.componentInstance;
    component.log = fakeLog;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
