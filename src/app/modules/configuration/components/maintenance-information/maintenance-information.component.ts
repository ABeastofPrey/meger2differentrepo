import { Component, OnInit, ViewChild } from '@angular/core';
import { MainTable3List, MainTable3Data } from '../../services/maintenance.enum';
import { MaintenanceService } from '../../services/maintenance.service';
import { MCQueryResponse } from '../../../core/services/websocket.service';
import { MatTable } from '@angular/material';

@Component({
    selector: 'app-maintenance-information',
    templateUrl: './maintenance-information.component.html',
    styleUrls: ['./maintenance-information.component.scss']
})
export class MaintenanceInformationComponent implements OnInit {

    constructor(private service: MaintenanceService) { }

    public displayedColumns: string[] = ['moduleName', 'performTime', 'surplus'];
    public dataSource: MainTable3List[] = [];

    @ViewChild('inforTable', { static: false })
    inforTable: MatTable<MainTable3List>;

    ngOnInit() {
        this.getInfoData();
    }

    getInfoData() {
        this.service.getData("?mntn_get_info_page").then((res: MCQueryResponse) => {
            this.dataSource = [];
            let tableData: MainTable3Data = JSON.parse(res.result);
            tableData.infoPage.forEach((value) => {
                let moduleName = value.moduleName;
                value.info.forEach((data, index) => {
                    index === 0 ? data.row = value.info.length : data.row = 0;
                    let unit = this.getUnit(moduleName);
                    data.surplus = { num: data.surplusLife, unitName: unit };
                    data.moduleName = moduleName;
                    this.dataSource.push(data);
                })
            })
            this.inforTable.renderRows();
        })
    }

    getUnit(type) {
        switch (type) {
            case "Belt":
                return "hours";

            case "Spline grease":
                return "km";

            case "Encoder battery":
                return "Ah";
        }
    }

}
