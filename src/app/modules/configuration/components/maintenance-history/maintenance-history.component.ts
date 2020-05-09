import { Component, OnInit, ViewChild } from '@angular/core';
import { MainTable2List, MainTable2Data } from '../../services/maintenance.enum';
import { MaintenanceService } from '../../services/maintenance.service';
import { MatTable } from '@angular/material';
import { MCQueryResponse } from '../../../core/services/websocket.service';

@Component({
    selector: 'app-maintenance-history',
    templateUrl: './maintenance-history.component.html',
    styleUrls: ['./maintenance-history.component.scss']
})
export class MaintenanceHistoryComponent implements OnInit {

    constructor(private service: MaintenanceService) { }

    public displayedColumns: string[] = ['moduleName', 'date', 'person', 'orderNum', 'comment'];
    public dataSource: MainTable2List[] = [];
    @ViewChild('historyTable', { static: false })
    historyTable: MatTable<MainTable2List>;

    ngOnInit() {
        this.getHistoryData();
    }

    getHistoryData() {
        this.service.getData("?mntn_get_history_page").then((res: MCQueryResponse) => {
            this.dataSource = [];
            let tableData: MainTable2Data = JSON.parse(res.result);
            tableData.historyPage.forEach((value) => {
                let moduleName = value.moduleName;
                value.history.forEach((data, index) => {
                    index === 0 ? data.row = value.history.length : data.row = 0;
                    data.moduleName = moduleName;
                    this.dataSource.push(data);
                })
            })
            this.historyTable.renderRows();
        })
    }

    ngOnDestroy(): void {
        this.service.removeHistoryChild();

    }

}
