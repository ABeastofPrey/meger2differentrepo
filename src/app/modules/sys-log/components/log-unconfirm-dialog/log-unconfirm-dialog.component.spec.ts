import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog, SystemLog } from '../../enums/sys-log.model';
import { LogInfoComponent } from '../log-info/log-info.component';
import { LogDetailsComponent, LogProfileComponent } from '../logbook/logbook.component.spec';
import { LogMCInfoComponent } from '../log-mc-info/log-mc-info.component';
import { LogCauseComponent } from '../log-cause/log-cause.component';
import { LogEffectComponent } from '../log-effect/log-effect.component';
import { LogUnconfirmDialogComponent } from './log-unconfirm-dialog.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SysLogFetchService } from '../../services/sys-log-fetch.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

describe('LogUnconfirmDialogComponent', () => {
  let component: LogUnconfirmDialogComponent;
  let fixture: ComponentFixture<LogUnconfirmDialogComponent>;
  const fakeDialog = jasmine.createSpyObj('MatDialogRef', ['close']);
  const closeSpy = fakeDialog.close;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LogUnconfirmDialogComponent, LogInfoComponent, LogDetailsComponent, LogProfileComponent,
        LogMCInfoComponent, LogEffectComponent, LogCauseComponent
      ],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule, ScrollingModule],
      providers: [
        { provide: SysLogFetchService, useValue: { setConfirmId: id => { } } },
        { provide: MatDialogRef, useValue: fakeDialog },
        { provide: MAT_DIALOG_DATA, useValue: { unconfirmLog: [fakeLog] } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogUnconfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm', () => {
    component.unconfirmLog = [fakeLog, { type: 'warning' }, { type: 'information' }, { type: 'unknow' }] as SystemLog[];
    const event = { stopImmediatePropagation: () => { } } as MouseEvent;
    component.confirm(event, fakeLog);
    component.unconfirmLog = [];
    component.confirm(event, fakeLog);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    component.unconfirmLog = [fakeLog];
    closeSpy.calls.reset();
  });

  it('should confirm all', () => {
    expect(component).toBeTruthy();
    component.confirmAll(undefined);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    closeSpy.calls.reset();
  });

  it('should get viewPortHeight', () => {
    component.unconfirmLog = [];
    const height = component.viewPortHeight();
    expect(height).toEqual('0');
    component.unconfirmLog = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}] as any;
    const height1 = component.viewPortHeight();
    expect(height1).toEqual('512px');
  });
});
