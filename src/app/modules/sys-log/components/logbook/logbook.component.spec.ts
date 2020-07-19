import { Component, Input, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LogInfoComponent } from '../log-info/log-info.component';
import { LogMCInfoComponent } from '../log-mc-info/log-mc-info.component';
import { LogCauseComponent } from '../log-cause/log-cause.component';
import { LogEffectComponent } from '../log-effect/log-effect.component';
import { LogBookComponent } from './logbook.component';
import { SysLogBookService } from '../../services/sys-log-book.service';
import { LoginService, ScreenManagerService, WebsocketService } from '../../../core';
import { ProgramEditorService } from '../../../program-editor/services/program-editor.service';
import { SysLogWatcherService } from '../../services/sys-log-watcher.service';
import { SystemLog } from '../../enums/sys-log.model';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material';

@Component({selector: 'app-log-profile', template: ''})
export class LogProfileComponent {
  @Input() log: SystemLog;
}

@Component({
    selector: 'app-log-details',
    template: ''
})
export class LogDetailsComponent {
    @Input() log: SystemLog;
}

const fakeWatcher = { refreshLog: new EventEmitter() };

const fakeService = {
  getSysLogs: () => ({
    pipe: () => ({
      subscribe: cb => {
        cb(fakeLogs);
      }
    })
  }),
  clearAllLogHistory: () => ({
    pipe: () => ({
      subscribe: cb => {
        cb();
      }
    })
  })
};
const ws = jasmine.createSpyObj('WebsocketService', ['']);
ws.isConnected = {
  pipe: () => { 
    return {
      subscribe: cb => {
        cb(true);
      }
    };
  }
};

const fakeLogs = [
  { source: 'drive' },
  { source: 'firmware' },
  { source: 'lib' },
  { source: 'webServer' },
  { type: 'error' },
  { type: 'information' },
  { type: 'warning' }
] as SystemLog[];

describe('LogBookComponent', () => {
  let component: LogBookComponent;
  let fixture: ComponentFixture<LogBookComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LogBookComponent, LogInfoComponent, LogDetailsComponent, LogProfileComponent,
        LogMCInfoComponent, LogEffectComponent, LogCauseComponent
      ],
      providers: [
        { provide: SysLogBookService, useValue: fakeService },
        { provide: LoginService, useValue: {} },
        { provide: ProgramEditorService, useValue: {} },
        { provide: ScreenManagerService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: WebsocketService, useValue: ws },
        { provide: SysLogWatcherService, useValue: fakeWatcher },
        ChangeDetectorRef
      ],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter log with type and source', () => {
    component.showFirm = false;
    component.showLib = false;
    component.showDrive = false;
    component.showServe = false;
    component.showError = false;
    component.showWarn = false;
    component.showInfo = false;
    component.onFilter();
    expect(component.visiableLogs.length).toEqual(0);
  });

  it('should slice log with page index and page size', async(() => {
    component.pageChange({ pageIndex: 0, pageSize: 10 } as PageEvent);
    fixture.whenStable().then(() => {
      expect(component.visiableLogs.length).toEqual(6);
    });
  }));

  it('should clearAllLogHistory', async(() => {
    component.clearAllLogHistory();
    fixture.whenStable().then(() => {
      expect(component.pageIndex).toEqual(0);
    });
  }));
});
