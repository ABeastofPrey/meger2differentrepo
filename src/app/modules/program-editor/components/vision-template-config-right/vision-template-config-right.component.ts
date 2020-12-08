import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { VisionService } from '../../services/vision.service';
import { RespondDataTable, RespondData, RespondError, Respondstatus, ResDataList, List, TemplateRespondData, CustomRespondError, CustomRespondStatus, CustomRespondData, AddCustomRespondData } from '../../services/vision.enum';
import { isUndefined } from 'ramda-adjunct';



@Component({
    selector: 'app-vision-template-config-right',
    templateUrl: './vision-template-config-right.component.html',
    styleUrls: ['./vision-template-config-right.component.scss']
})
export class VisionTemplateConfigRightComponent implements OnInit {

    @ViewChild('respondDataTable') respondDataTable: MatTable<RespondDataTable>;

    @Input() stationName: string;
    @Input() typeList: string[];

    public templateName: string;
    public templateList: string[] = [];

    respondExist: string[] = [];

    public respondData: TemplateRespondData[] = [];
    public respondError: CustomRespondError[] = [];
    public respondStatus: CustomRespondStatus[] = [];

    public displayedColumnsData: string[] = ["dataName", "dataType", "operation"];
    public displayedColumnsError: string[] = ["dataName", "dataType"];
    public displayedColumnsStatus: string[] = ["dataName", "dataType"];

    constructor(public service: VisionService) { }

    ngOnInit(): void {

    }

    private getJobListByStaion(): void {
        if (this.stationName) {
            let api: string = `?getJobListByStaion("${this.stationName}")`;
            this.service.search(api).then((result: List) => {
                this.templateList = JSON.parse(result.result);
                this.service.getCurrentJob(this.stationName).then((result: List) => {
                    if (result.result && this.templateList.includes(result.result)) {
                        this.templateName = result.result;
                        this.selectedTemplate(this.templateName);
                    }
                })
            })
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        (({ stationName }) => {
            if (isUndefined(stationName)) return;
            this.getJobListByStaion();
        })(changes);
    }

    public selectedTemplate(selectList: string): void {
        this.templateName = selectList;
        this.service.setCurrentJob(this.stationName, this.templateName);
        const api = `?getResDataListByStationJob("${this.stationName}","${selectList}")`;
        this.service.search(api).then((result: List) => {
            [this.respondData, this.respondError, this.respondStatus] = [[], [], []];
            let tableList: ResDataList = JSON.parse(result.result);
            tableList.respondData.forEach((res: RespondData) => {
                let respondData: CustomRespondData = { "dataName": new FormControl(res.dataName, [Validators.required, this.validFirstLetter(), this.validExist()]), "dataType": res.dataType, "operation": "", "originalName": res.dataName }
                this.respondData.push(respondData);
            })
            tableList.respondError.forEach((res: RespondError) => {
                let respondError: CustomRespondError = { "dataName": new FormControl(res.dataName, [Validators.required, this.validFirstLetter()]), "dataType": res.dataType, "originalName": res.dataName };
                this.respondError.push(respondError);
            })
            tableList.respondStatus.forEach((res: Respondstatus) => {
                let respondstatus: CustomRespondStatus = { "dataName": new FormControl(res.dataName, [Validators.required, this.validFirstLetter()]), "dataType": res.dataType, "originalName": res.dataName };
                this.respondStatus.push(respondstatus);
            })
        })
    }

    public selectedDataType(index: number): void {
        const api: string = `?modifyResDataType("${this.stationName}","${this.templateName}","${this.respondData[index].dataName.value}","${this.respondData[index].dataType}")`;
        this.service.search(api);
    }

    public blurReapondData(index: number): void {
        let inputValid: boolean = this.respondData[index].dataName.valid;
        let originNameValid: string = this.respondData[index].originalName;

        if (!inputValid && originNameValid) {
            this.respondData[index].dataName.patchValue(this.respondData[index].originalName);
        }

        if (!inputValid && !originNameValid) {
            this.respondData.splice(index, 1);
            this.respondDataTable.renderRows();
        }

        if (inputValid && originNameValid) {
            this.modifyResData(index);
        }

        if (inputValid && !originNameValid) {
            this.addResData(index);
        }
    }

    public addJob(name: string): void {
        const api: string = `?addJob("${this.stationName}","${name}")`;
        this.service.search(api).then((result: List) => {
            if (result.result === "0") {
                this.templateName = name.toUpperCase();
                this.templateList.push(this.templateName);
                this.selectedTemplate(name.toUpperCase());
                this.service.setCurrentJob(this.stationName, this.templateName);
            }
        })
    }

    public deleteJob(list: string): void {
        const api: string = `?deleteJob("${this.stationName}","${list}")`;
        this.service.search(api).then((result: List) => {
            let successFail: boolean = result.result === "0";
            successFail ? this.getJobListByStaion() : "";
            if (successFail && this.templateName === list) {
                this.initTableData();
            }
        })
    }

    private initTableData(): void {
        this.templateName = "";
        this.respondData = [];
        this.respondError = [];
        this.respondStatus = [];
    }

    public addRespondDataList(): void {
        let respondData: AddCustomRespondData = { "dataName": new FormControl("", [Validators.required, this.validFirstLetter(), this.validExist()]), "dataType": 'Float', "operation": "" };
        this.respondData.push(respondData);
        this.respondDataTable.renderRows();
        let addInputElement: any = document.getElementsByClassName("inputElementName")[this.respondData.length - 1];
        // addInputElement.focus();
        setTimeout(() => {
            addInputElement.getElementsByTagName("input")[0].click();
            this.changeInput({target:{value:""}},this.respondData.length - 1,"respondData");
        }, 0);
    }

    private addResData(index: number): void {
        const api: string = `?addResData("${this.stationName}","${this.templateName}","${this.respondData[index].dataName.value}","${this.respondData[index].dataType}")`;
        const respondDataNameValue = this.respondData[index].dataName.value;
        this.service.search(api).then((result) => {
            if (result.result === "0") {
                this.respondData[index].originalName = respondDataNameValue;
            }
        })
    }

    private modifyResData(index: number): void {
        const api: string = `?modifyResDataName("${this.stationName}","${this.templateName}","${this.respondData[index].originalName}","${this.respondData[index].dataName.value}")`;
        const respondDataNameValue: string = this.respondData[index].dataName.value;
        this.service.search(api).then((result) => {
            if (result.result === "0") {
                this.respondData[index].originalName = respondDataNameValue;
            }
        })
    }

    public deleteRespondData(index: number): void {
        const api: string = `?deleteResData("${this.stationName}","${this.templateName}","${this.respondData[index].dataName.value}")`;
        this.service.search(api).then((result: List) => {
            if (result.result === "0") {
                this.respondData.splice(index, 1);
                this.respondDataTable.renderRows();
            }
        })
    }

    public setResErrorName(index: number): void {
        if (this.respondError[index].dataName.valid) {
            let api: string = `?setResErrorName("${this.stationName}","${this.templateName}","${this.respondError[index].dataName.value}")`;
            const respondErrorNameValue: string = this.respondError[index].dataName.value;
            this.service.search(api).then((result: List) => {
                if (result.result === "0") {
                    this.respondError[index].originalName = respondErrorNameValue;
                }
            })
        } else {
            this.respondError[index].dataName.patchValue(this.respondError[index].originalName);
        }
    }

    public selectedError(index: number): void {
        const api: string = `?modifyResErrorType("${this.stationName}","${this.templateName}","${this.respondError[index].dataType}")`;
        this.service.search(api);
    }

    public setResStatusName(index: number): void {
        if (this.respondStatus[index].dataName.valid) {
            let api: string = `?setResStatusName("${this.stationName}","${this.templateName}","${this.respondStatus[index].dataName.value}")`;
            const respondStatusNameValue: string = this.respondStatus[index].dataName.value;
            this.service.search(api).then((result) => {
                if (result.result === "0") {
                    this.respondStatus[index].originalName = respondStatusNameValue;
                }
            })
        } else {
            this.respondStatus[index].dataName.patchValue(this.respondStatus[index].originalName);
        }
    }

    public selectedStatus(index: number): void {
        const api: string = `?modifyResStatusType("${this.stationName}","${this.templateName}","${this.respondStatus[index].dataType}")`;
        this.service.search(api);
    }

    private validFirstLetter(): ValidatorFn {
        return ({ value }: AbstractControl) => {
            let reg = /^[a-zA-Z]/;
            return (reg.test(value) ? null : { "letter": "letter" })
        };
    }

    private validExist(): ValidatorFn {
        return ({ value }: AbstractControl) => {
            let existList = this.respondExist.filter((data) => {
                return data === value
            })
            return ((existList.length === 0) ? null : { "exist": "exist" })
        };
    }

    public changeInput(e: any, faIndex: number, type: string,ref?: any): void {
      this.respondExist && this.respondExist.splice(0,this.respondExist.length);
        this.respondData.forEach((value: TemplateRespondData, index: number) => {
            if (faIndex !== index) {
                this.respondExist.push(value.dataName.value);
            }
        })
        const [validName] = e.target.value.match(/[a-zA-Z0-9_]*/g);
        const dataName = validName.slice(0, 32);
        this[type][faIndex].dataName.patchValue(dataName);
        this[type][faIndex].dataName.markAsTouched();
        ref && ref.setControlValue(validName);
    }


}
