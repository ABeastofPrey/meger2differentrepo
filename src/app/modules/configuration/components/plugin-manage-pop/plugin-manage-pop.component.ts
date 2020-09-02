import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PluginManageService } from '../../services/plugin.manage.service';
import { DependList } from '../../services/plugin.manage.enum';

@Component({
    selector: 'app-plugin-manage-pop',
    templateUrl: './plugin-manage-pop.component.html',
    styleUrls: ['./plugin-manage-pop.component.scss']
})
export class PluginManagePopComponent implements OnInit {

    constructor(
        @Inject(MAT_DIALOG_DATA) public pluginName: string,
        public dialogRef: MatDialogRef<PluginManagePopComponent, boolean>,
        public pms: PluginManageService
    ) { }

    public dataSource: DependList[] = [];
    public displayedColumns: string[] = ['Name', 'Version'];

    ngOnInit() {
        this.pms.getUnstallPluginDepend(this.pluginName).subscribe((dependList: DependList[]) => {
            this.dataSource = dependList;
        })
    }

    public onCancel(): void {
        this.dialogRef.close(false);
    }

    public onConfirm(): void {
        this.dialogRef.close(true);

    }

}
