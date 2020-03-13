import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog } from '../../enums/sys-log.model';
import { LogMCInfoComponent } from './log-mc-info.component';
import { LoginService, ScreenManagerService } from '../../../core';
import { ProgramEditorService } from '../../../program-editor/services/program-editor.service';
import { Router } from '@angular/router';

describe('LogMCInfoComponent', () => {
  let component: LogMCInfoComponent;
  let fixture: ComponentFixture<LogMCInfoComponent>;
  const fakeRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
  const navigateByUrlSyp = fakeRouter.navigateByUrl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogMCInfoComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
      providers: [
        { provide: LoginService, useValue: {} },
        { provide: ScreenManagerService, useValue: { screens: [{}, {}] } },
        { provide: ProgramEditorService, useValue: { setFile: () => {} } },
        { provide: Router, useValue: fakeRouter },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogMCInfoComponent);
    component = fixture.componentInstance;
    component.log = fakeLog;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go to error', () => {
    const err = 'STRINGS.LIB';
    component.goToError(err);
    expect(navigateByUrlSyp).toHaveBeenCalled();
  })
});
