import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionCalibrationComponent } from './vision-calibration.component';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VisionService } from '../../services/vision.service';
import { DataService } from '../../../core';
import { Observable } from 'rxjs';

const fakeService = jasmine.createSpyObj('VisionService', ['search', 'createDialog', 'yesnoDialog', 'getCurrentCalStation', 'setCurrentCalStation']);
const datasService = jasmine.createSpyObj('DataService', ['refreshVision']);

const obser = new Observable((obser) => {
    obser.next("value");
})
const datasObservable = datasService.refreshVision.and.returnValue(obser);

const getDataSearch = fakeService.search.and.returnValue(Promise.resolve());
const getStationList = {
    cmd: "?getStationList",
    err: null,
    result: '["SLFHUOW","ADF"]'
}
const allPoints = {
    cmd: "",
    err: null,
    result: JSON.stringify({
        "1": [{ "isSaved": "0" }, { "Pixel_x": "" }, { "Pixel_y": "" }, { "Robot_x": "" }, { "Robot_y": "" }],
        "2": [{ "isSaved": "1" }, { "Pixel_x": "" }, { "Pixel_y": "" }, { "Robot_x": "" },
        { "Robot_y": "" }
        ]
    })
}
const getCalibrationErrorData0 = {
    cmd: "",
    err: null,
    result: "错误信息"
}
const getCalibrationErrorData1 = {
    cmd: "",
    err: null,
    result: ""
}

const commonData0 = {
    cmd: "",
    err: null,
    result: "0"
}

const commonData1 = {
    cmd: "",
    err: null,
    result: ""
}

const commonData2 = {
    cmd: "",
    err: null,
    result: "1"
}

describe('VisionCalibrationComponent', () => {
    let component: VisionCalibrationComponent;
    let fixture: ComponentFixture<VisionCalibrationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VisionCalibrationComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: VisionService, useValue: fakeService },
                { provide: DataService, useValue: datasService },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisionCalibrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getStationList', () => {
        const resultTrue = { "result": "stationA" };
        const searchReturn = { result: JSON.stringify(["stationA", "stationB"]) }
        const getDataSearch = fakeService.search.and.returnValue(Promise.resolve(searchReturn));
        const getcurStation = fakeService.getCurrentCalStation.and.returnValue(Promise.resolve(resultTrue));
        fixture.whenStable().then(() => {
            getDataSearch.then(() => {
                getcurStation.then(() => {
                    expect(component.stationName).toBe("stationA");
                })
            })
        });
    })

    it('getStationListElse', () => {
        const resultTrue = { "result": "stationD" };
        const searchReturn = { result: JSON.stringify(["stationA", "stationB"]) }
        const getDataSearch = fakeService.search.and.returnValue(Promise.resolve(searchReturn));
        const getcurStation = fakeService.getCurrentCalStation.and.returnValue(Promise.resolve(resultTrue));
        fixture.whenStable().then(() => {
            getDataSearch.then(() => {
                getcurStation.then(() => {
                    expect(component.stationName).toBe("");
                })
            })

        });
    })


    it('savePointStatus', () => {
        component.points = [
            { "color": "warn", value: "1", "point": [{ isSaved: "1" }, { Pixel_x: "1.00" }, { Pixel_y: "0.00" }, { Robot_x: "500.00" }, { Robot_y: "0.00" }] },
            { "color": "warn", value: "2", "point": [{ isSaved: "1" }, { Pixel_x: "1.00" }, { Pixel_y: "0.00" }, { Robot_x: "500.00" }, { Robot_y: "0.00" }] },
            { "color": "warn", value: "3", "point": [{ isSaved: "1" }, { Pixel_x: "" }, { Pixel_y: "" }, { Robot_x: "" }, { Robot_y: "" }] },
        ]
        component.lastTimeIndex = 0;
        fixture.whenStable().then(() => {
            component.lastTimeColor = "warn";
            component.savePointStatus(1);
            component.lastTimeColor = "";
            component.savePointStatus(1);
            component.savePointStatus(2);
        });
    })

    it('savePointValue', () => {
        component.points = [
            { "color": "warn", value: "1", "point": [{ isSaved: "1" }, { Pixel_x: "1.00" }, { Pixel_y: "0.00" }, { Robot_x: "500.00" }, { Robot_y: "0.00" }] },
            { "color": "warn", value: "2", "point": [{ isSaved: "1" }, { Pixel_x: "1.00" }, { Pixel_y: "0.00" }, { Robot_x: "500.00" }, { Robot_y: "0.00" }] },
            { "color": "warn", value: "3", "point": [{ isSaved: "1" }, { Pixel_x: "" }, { Pixel_y: "" }, { Robot_x: "" }, { Robot_y: "" }] },
        ]
        const saveReturnValue = {
            result: JSON.stringify({
                "2": [
                    { "isSaved": "1" },
                    { "Pixel_x": "2.00" },
                    { "Pixel_y": "0.00" },
                    { "Robot_x": "500.00" },
                    { "Robot_y": "0.00" }
                ]
            })
        }
        fakeService.search.and.returnValue(Promise.resolve(saveReturnValue));
        fixture.whenStable().then(() => {
            component.isSavedEle = ["1", "2"];
            component.lastTimeIndex = 0;
            component.savePointValue();
            fakeService.search.and.returnValue(Promise.resolve(saveReturnValue));
            component.lastTimeIndex = 3;
            component.savePointValue();
            fakeService.search.and.returnValue(Promise.resolve(commonData1));
            component.savePointValue();
        });
    })

    it('calibrationPoint', () => {
        fakeService.search.and.returnValue(Promise.resolve(commonData2));
        fixture.whenStable().then(() => {
            component.calibrationPoint();
            fakeService.search.and.returnValue(Promise.resolve(allPoints));
            component.calibrationPoint();
        });
    })

    it('calibrationPointElse', () => {
        fakeService.search.and.returnValue(Promise.resolve(commonData1));
        fixture.whenStable().then(() => {
            component.calibrationPoint();
        });
    })

    it('resetStationPoint', () => {
        fakeService.search.and.returnValue(Promise.resolve(commonData0));
        fixture.whenStable().then(() => {
            fakeService.search.and.returnValue(Promise.resolve(commonData0));
            component.resetStationPoint();
            fakeService.search.and.returnValue(Promise.resolve(commonData1));
            component.resetStationPoint();
        });
    })

    it('changeStation', () => {
        fakeService.search.and.returnValue(Promise.resolve({ result: '' }));
        component.changeStation();
        fakeService.search.and.returnValue(Promise.resolve({ result: '0' }));
        component.changeStation();

    })

});
