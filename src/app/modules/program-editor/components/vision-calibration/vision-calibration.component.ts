import { Component, OnInit } from '@angular/core';
import { List } from '../../services/vision.enum';
import { VisionService } from '../../services/vision.service';
import { DataService } from '../../../core';


@Component({
    selector: 'app-vision-calibration',
    templateUrl: './vision-calibration.component.html',
    styleUrls: ['./vision-calibration.component.scss']
})
export class VisionCalibrationComponent implements OnInit {

    public stationName: string = '';
    public stationList: string[] = [];

    public Pixel_x: string = "-";
    public Pixel_y: string = "-";
    public Robot_x: string = "-";
    public Robot_y: string = "-";

    public errorResult: string;

    public lastTimeIndex: number;
    public lastTimeColor: string;
    public isSaved: boolean = false;
    public isReset: boolean = false;
    public isSavedEle: string[] = [];

    // primary: Selection, accent: not saved, warn: saved
    public points: any[] = [];
    public visionStationCalibration: string = "visionStationCalibration";
    constructor(private service: VisionService, private data: DataService) {
        let refresh = this.data.refreshVision();
        refresh.subscribe((value) => {
            this.ngOnInit();
        })
    }

    ngOnInit(): void {
        this.getStationList();
    }

    private getStationList(): void {
        const api: string = '?getStationList';
        this.service.search(api).then((result: List) => {
            this.stationList = JSON.parse(result.result);
            this.service.getCurrentCalStation().then((result: List) => {
                if (result.result && this.stationList.includes(result.result)) {
                    this.stationName = result.result;
                    this.changeStation();
                } else {
                    this.stationName = "";
                }
            })
        })
    }

    private getAllPointValue(): void {
        const api: string = `?getAllPointValue("${this.stationName}")`;
        this.service.search(api).then((result: any) => {
            let res: any = JSON.parse(result.result);
            let points: string[] = Object.keys(res);
            this.points = [];
            this.isSavedEle = [];
            points.forEach((value) => {
                (res[value][0].isSaved === "1") ? this.isReset = true : "";
                if (res[value][0].isSaved === "1") {
                    this.isReset = true;
                    this.isSavedEle.push(value);
                }
                let point = { value: value, color: (res[value][0].isSaved === "1") ? "warn" : "accent", point: res[value] };
                this.points.push(point);
            })
        })
    }

    private getCalibrationError(): void {
        const api: string = `?getCalibrationError("${this.stationName}")`;
        this.service.search(api).then((result: List) => {
            this.errorResult = result.result || "-";
        })
    }

    public savePointStatus(index: number): void {
        this.isSaved = true;
        if (this.lastTimeColor) {
            this.points[this.lastTimeIndex].color = this.lastTimeColor;
        }
        this.lastTimeIndex = index;
        this.lastTimeColor = this.points[index].color;
        this.points[index].color = "primary";
        let pixRobot = [...this.points[index].point];
        [this.Pixel_x, this.Pixel_y, this.Robot_x, this.Robot_y] = [pixRobot[1].Pixel_x || "-", pixRobot[2].Pixel_y || "-", pixRobot[3].Robot_x || "-", pixRobot[4].Robot_y || "-"];
    }

    public savePointValue(): void {
        const api: string = `?savePointValue("${this.stationName}",${String(this.lastTimeIndex + 1)})`;
        this.service.search(api).then((result) => {
            if (result.result) {
                this.isSaved = true;
                this.lastTimeColor = "warn";
                this.isReset = true;
                let exist = this.isSavedEle.find((value) => {
                    return value == String((this.lastTimeIndex + 1));
                })
                exist ? "" : this.isSavedEle.push(String((this.lastTimeIndex + 1)));
                this.points[this.lastTimeIndex].point = JSON.parse(result.result)[this.lastTimeIndex + 1];
                this.savePointStatus(this.lastTimeIndex);
            }
        })
    }

    public calibrationPoint(): void {
        const api: string = `?VCaliCalcMatrix("${this.stationName}")`;
        this.service.search(api).then((result: List) => {
            if (result.result) {
                this.initState();
                this.errorResult = result.result;
            }
        })
    }

    public resetStationPoint(): void {
        const api: string = `?resetStationPoint("${this.stationName}")`;
        this.service.search(api).then((result) => {
            if (result.result === "0") {
                this.initState();
                this.getAllPointValue();
            }
        })
    }

    private initState(): void {
        [this.Pixel_x, this.Pixel_y, this.Robot_x, this.Robot_y] = ["-", "-", "-", "-"];
        this.lastTimeIndex = -1;
        this.lastTimeColor = "";
        this.isSaved = false;
        this.isReset = false;
        this.getAllPointValue();
    }

    public changeStation(): void {
        this.service.setCurrentCalStation(this.stationName);
        this.isReset = false;
        this.isSaved = false;
        [this.Pixel_x, this.Pixel_y, this.Robot_x, this.Robot_y] = ["-", "-", "-", "-"];
        this.getAllPointValue();
        this.getCalibrationError();
    }

}
