import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { VisionService } from '../../services/vision.service';
import { List, CreateDialog, CreateDialogReturn, ConfirmDialog } from '../../services/vision.enum';
import { DataService } from '../../../core';

@Component({
    selector: 'app-vision-template-config',
    templateUrl: './vision-template-config.component.html',
    styleUrls: ['./vision-template-config.component.scss']
})
export class VisionTemplateConfigComponent implements OnInit {

    @ViewChild('numInput', { static: true }) numInput: any;

    constructor(private service: VisionService, private data: DataService) {
        let refresh = this.data.refreshVision();
        refresh.subscribe((value) => {
            this.ngOnInit();
        })
    }

    public stationName: string = '';
    public stationList: string[] = [];

    public ip: string = "";
    public port: FormControl = new FormControl();
    private portValid: boolean;

    public terminatorName: string = "";
    public terminatorList: string[] = [];

    public encodingName: string = "";
    public encodingList: string[] = [];

    public typeList: string[];

    ngOnInit(): void {
        this.getStationList();
        this.getTerminatorList();
        this.getEncodingList();
        this.getDataTypeList();
    }

    private getStationList(): void {
        const api: string = '?getStationList';
        this.service.search(api).then((result: List) => {
            this.stationList = JSON.parse(result.result);
            this.service.getCurrentStation().then((result: List) => {
                if (result.result && this.stationList.includes(result.result)) {
                    this.stationName = result.result;
                    this.edit();
                } else {
                    this.stationName = "";
                }
            })
        })
    }

    private getTerminatorList(): void {
        const api: string = '?getTerminatorList';
        this.service.search(api).then((result: List) => {
            result.result = result.result.replace(/\\/g, '\\\\');
            this.terminatorList = JSON.parse(result.result);
        })
    }

    private getEncodingList(): void {
        const api: string = '?getEncodingList';
        this.service.search(api).then((result: List) => {
            this.encodingList = JSON.parse(result.result);
        })
    }

    private getDataTypeList(): void {
        const api: string = '?getDataTypeList';
        this.service.search(api).then((result: List) => {
            this.typeList = JSON.parse(result.result);
        })
    }

    public create(): void {
        let data: CreateDialog = {
            "data": {
                "title": "vision.templateConfig.createStationTitle",
                "placeholder": "",
                "label": "vision.templateConfig.createStationPlacehold",
                "checkbox": false,
                "stationList": this.stationList
            }
        }
        this.service.createDialog(data).subscribe((nameDialog: CreateDialogReturn) => {
            if (nameDialog.status) {
                this.stationList.push(nameDialog.name.toUpperCase());
                this.stationName = nameDialog.name.toUpperCase();
                this.selectedStation();
            } else if (nameDialog.name) {
                this.stationName = "";
            }
        });
    }

    public selectedStation(): void {
        this.service.setCurrentStation(this.stationName);
        this.edit();
    }

    private edit(): void {
        this.numInput.resetStatus();
        this.getStationBasicInfo();
    }

    public confirmDelete(): void {
        let dialogMsg: ConfirmDialog = {
            title: 'vision.templateConfig.dialogStationTitle',
            titlePara: this.stationName,
            msg: 'vision.templateConfig.deleteStation',
            yes: 'button.delete', no: 'button.cancel',
        }
        this.service.yesnoDialog(dialogMsg).subscribe((res: boolean) => {
            if (res === true) {
                this.delete();
            }
        });
    }

    private delete(): void {
        const api: string = `?deleteStation("${this.stationName}")`;
        this.service.search(api).then((result: List) => {
            if (result.result === "0") {
                this.stationName = "";
                this.getStationList();
            }
        })
    }

    private getStationBasicInfo(): void {
        const api: string = `?getStationBasicInfo("${this.stationName}")`;
        this.ip = "...";
        this.service.search(api).then((result: List) => {
            result.result = result.result.replace(/\\/g, '\\\\');
            let basicInfo: Array<any> = JSON.parse(result.result);
            let ip: string = basicInfo[0].IP;
            this.ip = ip;
            this.port.patchValue(basicInfo[1].Port);
            [this.terminatorName, this.encodingName] = [basicInfo[2].Terminator, basicInfo[3].Encording]
        })
    }

    public changeIp(event: string): void {
        this.ip = event;
        this.setStationIP(event);
    }

    private setStationIP(ip: string): void {
        const api: string = `?setStationIP("${this.stationName}","${ip}")`;
        this.service.search(api);
    }

    public changePort(vaild: boolean): void {
        this.portValid = vaild;
    }

    public portBlur(): void {
        this.portValid ? this.setPortNumber(this.port.value) : "";
    }

    private setPortNumber(port: string) {
        const api: string = `?setPortNumber("${this.stationName}","${port}")`;
        this.service.search(api);
    }

    public selectedTerminator(): void {
        const api: string = `?setTerminator("${this.stationName}","${this.terminatorName}")`;
        this.service.search(api);
    }

    public selectEncode(): void {
        const api: string = `?setEncoding("${this.stationName}","${this.encodingName}")`;
        this.service.search(api);
    }

    ngOnDestroy(): void {
        const api: string = `VLoadStationBookDefault()`;
        this.service.debounceVload(api);
    }

}
