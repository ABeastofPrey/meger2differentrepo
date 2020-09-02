import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginManageComponent } from './plugin-manage.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { SharedModule } from '../../../shared/shared.module';
import { PluginManageService } from '../../services/plugin.manage.service';
import { LoginService, WebsocketService } from '../../../../modules/core';
import { LangService } from '../../../core/services/lang.service';
import { of } from 'rxjs';
import { PluginManagePopService } from '../../services/plugin.manage.pop.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';
import { ChangeDetectorRef } from '@angular/core';

const fakePluginManageService = jasmine.createSpyObj('PluginManageService', ['isConnected', 'getPluginsList', 'unInStallIsReady', 'getUnstallPluginDepend', 'startUninstallPlugin', 'setUnPluginInstallResult']);
let fakeLoginService = jasmine.createSpyObj('LoginService', ['isAdmin']);
const fakeWebSocketService = jasmine.createSpyObj('WebsocketService', ['isConnected']);
const fakeLangService = jasmine.createSpyObj('LangService', ['getLang']);
const fakePluginManagePopService = jasmine.createSpyObj('PluginManagePopService', ['unInstallPop']);
const fakeSysLogSnackBarService = jasmine.createSpyObj('SysLogSnackBarService', ['openTipSnackBar']);

fakePluginManageService.isConnected.and.returnValue(of(true));
fakePluginManageService.unInStallIsReady.and.returnValue(of(1));
fakePluginManageService.getPluginsList.and.returnValue(of([
    { "Name": "plugin1", "Version": "1.1", "Date": "2020-08-10", "State": 1, "EnglishDes": "English", "ChineseDes": "中文描述" }
]))
fakePluginManagePopService.unInstallPop.and.returnValue(of(true));
describe('PluginManageComponent', () => {
    let component: PluginManageComponent;
    let fixture: ComponentFixture<PluginManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PluginManageComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: PluginManageService, useValue: fakePluginManageService },
                { provide: LoginService, useValue: fakeLoginService },
                { provide: WebsocketService, useValue: fakeWebSocketService },
                { provide: LangService, useValue: fakeLangService },
                { provide: PluginManagePopService, useValue: fakePluginManagePopService },
                { provide: SysLogSnackBarService, useValue: fakeSysLogSnackBarService },
                ChangeDetectorRef
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PluginManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit', () => {
        expect(component.tableData.length).toBe(1);
        fakePluginManageService.isConnected.and.returnValue(of(false));
        fakeLoginService = {};
        fixture.detectChanges();
        component.ngOnInit();
    });

    it('ngAfterViewInit', () => {
        component.sort.sortChange.emit({ active: "version", direction: "desc" });
        component.ngAfterViewInit();
        expect(component.defaultSort.active).toBe("version");
    });

    it('changePage', () => {
        component.changePage({ pageIndex: 0, pageSize: 10, length: 1 });
        expect(component.tableData.length).toBeLessThan(10);
    });

    it('tableDataSort', () => {
        component.defaultSort = { active: "version", direction: "" };
        component.changePage({ pageIndex: 0, pageSize: 10, length: 1 });
        component.tableData = [
            { "Name": "plugin1", "Version": "1.1", "Date": "2020-08-10", "State": 1, "EnglishDes": "English", "ChineseDes": "中文描述" },
            { "Name": "plugin3", "Version": "1.3", "Date": "2020-08-13", "State": 0, "EnglishDes": "English", "ChineseDes": "中文描述" },
            { "Name": "plugin2", "Version": "1.2", "Date": "2020-08-12", "State": 0, "EnglishDes": "English", "ChineseDes": "中文描述" },
            { "Name": "plugin2", "Version": "1.2", "Date": "2020-08-12", "State": 0, "EnglishDes": "English", "ChineseDes": "中文描述" }
        ]
        fixture.detectChanges();
        expect(component.tableData.length).toBe(4);
        component.tableDataSort("Name", "asc");
        component.tableData = [
            { "Name": "plugin1", "Version": "1.1", "Date": "2020-08-10", "State": 1, "EnglishDes": "English", "ChineseDes": "中文描述" },
            { "Name": "plugin3", "Version": "1.3", "Date": "2020-08-13", "State": 0, "EnglishDes": "English", "ChineseDes": "中文描述" },
            { "Name": "plugin2", "Version": "1.2", "Date": "2020-08-12", "State": 0, "EnglishDes": "English", "ChineseDes": "中文描述" }
        ]
        fixture.detectChanges();
        component.tableDataSort("Name", "desc");
        expect(component.tableData.length).toBe(3);
    });

    it('uninstall', () => {
        component.uninstall({ stopPropagation: function () { } } as Event, "plugin1");
        fakePluginManageService.unInStallIsReady.and.returnValue(of(0));
        fixture.detectChanges();
        component.uninstall({ stopPropagation: function () { } } as Event, "plugin1");
        expect(component.tableData.length).toBeLessThan(10);
    });

    it('unInstallPop', () => {
        component.unInstallPop("plugin1");
        fakePluginManagePopService.unInstallPop.and.returnValue(of(false));
        fixture.detectChanges();
        component.unInstallPop("plugin2");
        expect(component.tableData.length).toBeLessThan(10);
    });

    it('unLoadResult', () => {
        component.tableData = [
            { "Name": "plugin1", "Version": "1.1", "Date": "2020-08-10", "State": 1, "EnglishDes": "English", "ChineseDes": "中文描述" }
        ]
        fixture.detectChanges();
        expect(component.tableData.length).toBeLessThan(10);
        component.unLoadResult(true);
        component.unLoadResult(false);
    });

});
