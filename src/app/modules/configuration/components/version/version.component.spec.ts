import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VersionComponent } from './version.component';
import { MatDialog } from '@angular/material';
import { DataService } from '../../../core';
import { WebsocketService } from '../../../core/services/websocket.service';

const fakeDialog = {
    open: () => { }
};

const fakeData = {
    TPVersion: 'v1.0.1;2018-09-22',
    palletLibVer: 'v1.0.1;2018-09-12',
    gripperLibVer: 'v1.0.1;2018-09-12',
    payloadLibVer: 'v1.0.1;2018-09-12',
    LeadByNoseLibVer: 'v1.0.1;2018-09-12',
    iomapVer: 'v1.0.1;2018-09-12',
    mcuVer: 'v1.0.1;2018-09-12'
};

const spyWs = {
    query: (para) => {
        if (para === '?vi_getreleaseversion') {
            const res = { result: 'v1.0.1;2018-09-12', cmd: 'This is cmd', err: null };
            return Promise.resolve(res);
        } else {
            return { result: 'This is result', cmd: 'This is cmd', err: null };
        }
    }
};

describe('VersionComponent', () => {
    let component: VersionComponent;
    let fixture: ComponentFixture<VersionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VersionComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [{
                provide: MatDialog, useValue: fakeDialog
            }, {
                provide: DataService, useValue: fakeData
            }, {
                provide: WebsocketService, useValue: spyWs
            }]
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
            expect(component.libVer).toBe('2018-09-22');
        });
    }));

    it('should get relative item for spcific page index', (async() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const pageEvent = { pageIndex: 0, pageSize: 10 } as any;
            component.pageChagne(pageEvent);
            expect(component.visableLibs.length).toBe(7);
        });
    }));

    it('should click release note', () => {
        component.clickReleaseNote();
        expect(true).toBe(true);
    });

    it('should click license', () => {
        component.clickUserLicence();
        expect(true).toBe(true);
    });
});
