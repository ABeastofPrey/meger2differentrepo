import { FormControl } from '@angular/forms';

export interface List {
    "result": string;
    "cmd": string;
    "err": any;
}

export interface CreateDialogData {
    "title": string,
    "placeholder": string,
    "label": string,
    "checkbox": boolean,
    "stationList": string[]
}

export interface CreateDialog {
    "data": CreateDialogData
}

export interface CreateDialogReturn {
    "name": string,
    // "dialog": boolean,
    "status": boolean
}

export interface ConfirmDialog {
    "title": string,
    "titlePara": string,
    "msg": String,
    "yes": string,
    "no": string
}

export interface SuccessFail {
    "result": string;
    "cmd": string;
    "err": any;
}


export interface RespondDataTable {
    "dataName": FormControl;
    "dataType": string;
    "operation": string;
}

export interface BasicInfo {
    "IP": string;
    "Port": string;
    "Terminator": string;
    "Encording": string;
}

export interface RespondData {
    "dataName": string;
    "dataType": string;
}

export interface RespondError {
    "dataName": string;
    "dataType": string;
}

export interface Respondstatus {
    "dataName": string;
    "dataType": string;
}

export interface ResDataList {
    "respondData": RespondData[];
    "respondError": RespondError[];
    "respondStatus": Respondstatus[];
}

export interface CustomRespondData {
    "dataName": FormControl;
    "dataType": string;
    "operation": string;
    "originalName": string;
}

export interface AddCustomRespondData{
    "dataName": FormControl;
    "dataType": string;
    "operation": string;
}

export interface CustomRespondError {
    "dataName": FormControl;
    "dataType": string;
    "originalName": string;
}

export interface CustomRespondStatus {
    "dataName": FormControl;
    "dataType": string;
    "originalName": string;
}

export interface PointInit {
    "isSaved": string;
    "Pixel_x": string;
    "Pixel_y": string;
    "Robot_x": string;
    "Robot_y": string;
}

export interface DialogValue {
    "name": string;
    // "dialog": boolean;
    "status": boolean;
}

export interface TemplateRespondData {
    "dataName": FormControl;
    "dataType": string;
    "operation"?: string;
    "originalName"?: string;
}