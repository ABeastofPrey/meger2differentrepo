import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VersionComponent } from './version.component';
import { MatDialog } from '@angular/material';
import { DataService } from '../../../core';
import { WebsocketService } from '../../../core/services/websocket.service';

const fakeDialog = {
  open: () => {},
};

const fakeData = {
  TPVersion: 'v1.0.1;2018-09-22',
  palletLibVer: 'v1.0.1;2018-09-12',
  gripperLibVer: 'v1.0.1;2018-09-12',
  payloadLibVer: 'v1.0.1;2018-09-12',
  LeadByNoseLibVer: 'v1.0.1;2018-09-12',
  iomapVer: 'v1.0.1;2018-09-12',
  mcuVer: 'v1.0.1;2018-09-12',
  WebServerInfo: ['v1.0.1', '2018-09-12'],
};

const spyWs = {
  query: para => {
        if (para === '?VI_getLibraryVersion') {
            const res = '[{"name":"TP Library","ver":"v1.3.9;2019-06-31","desc":"This library holds TP module specific data and functions"},{"name":"Pallet Library","ver":"v1.2.3;2019-06-31","desc":"This library holds PALLET module specific data and functions"},{"name":"Gripper Library","ver":"v1.2.0;2019-05-23","desc":"This library holds GRIPPER module specific data and functions"},{"name":"Payload Library","ver":"v1.1.0;2019-05-23","desc":"This library holds PAYLOAD module specific data and functions"},{"name":"Lead By Nose Library","ver":"v1.0.1;2019-03-11","desc":"This library holds LBN module specific data and functions"},{"name":"I/O Mapping Library","ver":"v1.0.1;2019-05-14","desc":"This library holds I/O module specific data and functions"},{"name":"MCU Library","ver":"v1.0.6;2019-05-22","desc":"This library holds MCU module specific data and functions"}]';
            return Promise.resolve({ result: res, cmd: 'This is cmd', err: null });
        }
    if (para === '?vi_getreleaseversion') {
      const res = {
        result: 'v1.0.1;2018-09-12',
        cmd: 'This is cmd',
        err: null,
      };
      return Promise.resolve(res);
    } else {
      return { result: 'This is result', cmd: 'This is cmd', err: null };
    }
  },
};

describe('VersionComponent', () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VersionComponent],
      imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
      providers: [
        {
          provide: MatDialog,
          useValue: fakeDialog,
        },
        {
          provide: DataService,
          useValue: fakeData,
        },
        {
          provide: WebsocketService,
          useValue: spyWs,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve and assemble data', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
            expect(component.libVer).toBe('2019-06-31');
    });
  }));

  it('should get relative item for spcific page index', async () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const pageEvent = { pageIndex: 0, pageSize: 10 } as any;
      component.pageChagne(pageEvent);
      expect(component.visableLibs.length).toBe(7);
    });
  });

  it('should click release note', () => {
    component.clickReleaseNote();
    expect(true).toBe(true);
  });

  it('should click license', () => {
    component.clickUserLicence();
    expect(true).toBe(true);
  });
});
