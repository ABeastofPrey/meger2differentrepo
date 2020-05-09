import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { MaintenanceHistoryComponent } from './maintenance-history.component';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaintenanceService } from '../../services/maintenance.service';

const result = {
    "historyPage": [
        { "moduleName": "belt", "history": [{ "date": "2020-04-22", "person": "1", "orderNum": "2", "comment": "评论" }, { "date": "2020-04-22", "person": "2", "orderNum": "2", "comment": "评论2" }] },
        { "moduleName": "spline grease", "history": [{ "date": "2020-04-22", "person": "1", "orderNum": "2", "comment": "评论" }, { "date": "2020-04-22", "person": "2", "orderNum": "2", "comment": "评论2" }] },
        { "moduleName": "encoder battery", "history": [{ "date": "2020-04-22", "person": "1", "orderNum": "2", "comment": "评论" }, { "date": "2020-04-22", "person": "2", "orderNum": "2", "comment": "评论2" }] },
    ]
}

const returnData = {
    cmd: "?mntn_get_history_page",
    err: null,
    result: JSON.stringify(result)
    // result: '{"historyPage":[{"moduleName":"belt","history":[{"date":"2020-04-22","person":"1","orderNum":"2","comment":"评论"},{"date":"2020-04-22","person":"2","orderNum":"2","comment":"评论2"}]}]}'
}
const fakeService = jasmine.createSpyObj('MaintenanceService', ['getData']);
const getDataSpy = fakeService.getData.and.returnValue(Promise.resolve(returnData));

describe('MaintenanceHistoryComponent', () => {
    let component: MaintenanceHistoryComponent;
    let fixture: ComponentFixture<MaintenanceHistoryComponent>;
    let service: MaintenanceService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaintenanceHistoryComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: MaintenanceService, useValue: fakeService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MaintenanceHistoryComponent);
        component = fixture.componentInstance;
        service = fixture.debugElement.injector.get(MaintenanceService);
        console.log(service)
        fixture.detectChanges();
    });

    it('should create', async(() => {
        expect(component).toBeTruthy();
        fixture.whenStable().then(() => {
            expect(getDataSpy).toHaveBeenCalled();
            expect(component.dataSource.length).toBe(6);
            expect(component.dataSource[0].row).toBe(2);
        });
    }));

});
