import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MainTable1List } from '../../services/maintenance.enum';
import { MatDialog } from '@angular/material';
import { MaintenanceService } from '../../services/maintenance.service';
import { LoginService } from '../../../core';
import { SysLogWatcherService, LogChangeSource } from '../../../../modules/sys-log/services/sys-log-watcher.service';


@Component({
    selector: 'app-maintenance-input',
    templateUrl: './maintenance-input.component.html',
    styleUrls: ['./maintenance-input.component.scss']
})
export class MaintenanceInputComponent implements OnInit {

    constructor(private fb: FormBuilder, private dialog: MatDialog, private service: MaintenanceService, private login: LoginService, private sys: SysLogWatcherService) { }

    public inputForm: FormGroup;
    public displayedColumns: string[] = ['moduleName', 'usedLife', 'apply'];
    public dataSource: MainTable1List[];
    public dataSourceCheck: MainTable1List[] = [];
    public saveBtn: boolean = true;
    public savePrevStr: string = "";
    public person: string = "";
    public orderNum: string = "";
    public comment: string = "";
    public isAdmin: boolean;
    public checkInvaild: boolean = true;

    ngOnInit() {
        this.isAdmin = this.login.isAdmin;
        const dataSource: MainTable1List[] = [
            { moduleName: "Belt", usedLife: { unit: "hours", max: 20000, index: 0, vaild: true, control: new FormControl(0) }, apply: false },
            { moduleName: "Spline grease", usedLife: { unit: "km", max: 400, index: 1, vaild: true, control: new FormControl(0) }, apply: false },
            { moduleName: "Encoder battery", usedLife: { unit: "Ah", max: 15, index: 2, vaild: true, control: new FormControl(0) }, apply: false },
        ];

        this.dataSource = dataSource;
        this.inputForm = this.fb.group({
            'person': [{ value: '', disabled: !this.isAdmin }, Validators.required],
            'orderNum': [{ value: '', disabled: !this.isAdmin }, Validators.required],
            'comment': [{ value: '', disabled: !this.isAdmin }, Validators.required],
        });
    }

    // limitNum(value): void {
    //     // event.target.value = event.target.value.replace(/\D/g, '');
    //     this.inputForm.value.orderNum = value;
    //     this.inputForm.patchValue({ ...this.inputForm.value });

    // }

    isValidEvent(e, index) {
        this.dataSource[index].usedLife.vaild = e;
        this.checkedList();
    }

    checkedList() {
        this.checkInvaild = true;
        this.dataSourceCheck = this.dataSource.filter((value) => {
            let apply = (value.usedLife.control.value || value.usedLife.control.value === 0) && value.apply;
            let vaild = value.usedLife.vaild;
            let checked = apply && vaild;
            (value.apply && !vaild) ? this.checkInvaild = false : "";
            return checked;
        })
    }

    preventEnter(e: any){
        if(e.keyCode == 13){
            return false;
        }
    }

    save() {
        this.service.saveMatDialog().subscribe(res => {
            if (res === true) {
                this.tableFormat();
                this.formFormat();
                const saveModule = `mntn_save_modulelist(${this.savePrevStr.slice(1)})`;
                const save_person_ordernum = `mntn_save_person_and_ordernum(${this.person.slice(1)},${this.orderNum.slice(1)})`;
                const save_comment = `mntn_save_comment(${this.comment.slice(1)})`;
                this.init();
                this.service.save(saveModule).then(() => {
                    this.service.save(save_person_ordernum).then(() => {
                        this.service.save(save_comment).then((res) => {
                            console.log(res);
                            this.sys.refreshLog.next(LogChangeSource.Maintenance);
                        })
                    })
                })
            }
        })
    }

    stringCut(str: string, type) {
        str = str.replace(/"/g, "'");   //Replace double quotes with single quotes and pass to Lib
        if (str.length >= 25) {
            this[type] += `+"${str.slice(0, 25)}"`;
            str.slice(25).length > 0 ? this.stringCut(str.slice(25), type) : '';
        } else {
            this[type] += `+"${str.slice(0, 25)}"`;
        }
    }

    tableFormat() {
        let savePrev = { 'moduleList': [] };
        this.dataSourceCheck.forEach((value) => {
            savePrev.moduleList.push({ 'moduleName': value.moduleName, 'usedLife': value.usedLife.control.value });
        })
        let savePrevStr = "";
        this.savePrevStr = "";
        savePrev.moduleList.forEach((value) => {
            savePrevStr += "{"
            Object.keys(value).forEach((key) => {
                savePrevStr += "'" + key + "':" + "'" + value[key] + "'"
            })
            savePrevStr += "},"
        })
        savePrevStr = savePrevStr.slice(0, savePrevStr.length - 1);
        savePrevStr = "{'moduleList':[" + savePrevStr + "]}";
        this.stringCut(savePrevStr, "savePrevStr");
    }

    formFormat() {
        this.person = "";
        this.orderNum = "";
        this.comment = "";
        Object.keys(this.inputForm.value).forEach((key) => {
            this.stringCut(this.inputForm.value[key], key);
        });
    }

    init() {
        // All States return to default
        this.saveBtn = false;
        this.ngOnInit();
        this.dataSourceCheck = [];
        setTimeout(() => {
            this.saveBtn = true;
        }, 0);
    }

}
