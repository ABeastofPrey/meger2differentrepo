import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceInformationComponent } from './maintenance-information.component';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaintenanceService } from '../../services/maintenance.service';

const returnData = {
    cmd: "?mntn_get_info_page",
    err: null,
    result: '{"infoPage":[{"moduleName":"belt","info":[{"performTime":"2020-04-22","surplusLife":19990},{"performTime":"2020-04-22","surplusLife":19990}]},{"moduleName":"spline grease","info":[{"performTime":"2020-04-22","surplusLife":19990},{"performTime":"2020-04-22","surplusLife":19990}]}]}'
}
const fakeService = jasmine.createSpyObj('MaintenanceService', ['getData']);
const getDataSpy = fakeService.getData.and.returnValue(Promise.resolve(returnData));

describe('MaintenanceInformationComponent', () => {
    let component: MaintenanceInformationComponent;
    let fixture: ComponentFixture<MaintenanceInformationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaintenanceInformationComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: MaintenanceService, useValue: fakeService },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MaintenanceInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        fixture.whenStable().then(() => {
            expect(getDataSpy).toHaveBeenCalled();
            console.log(component.dataSource)
            expect(component.dataSource.length).toBe(4);
            expect(component.dataSource[0].row).toBe(2);
        });
    });

    it('getUnit', () => {
        let type = "";
        type = component.getUnit("Belt");
        expect(type).toBe("hours");
        type = component.getUnit("Spline grease");
        expect(type).toBe("km");
        type = component.getUnit("Encoder battery");
        expect(type).toBe("Ah");
    })

});
