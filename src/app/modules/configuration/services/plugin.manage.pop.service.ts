import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { PluginManagePopComponent } from '../components/plugin-manage-pop/plugin-manage-pop.component';

@Injectable()
export class PluginManagePopService {
    constructor(private dialog: MatDialog) { }

    public unInstallPop(name: string) {
        return this.dialog.open(PluginManagePopComponent, {
            data: name,
            width: '540px',
            minHeight: '400px',
            height: "400px",
            hasBackdrop: true,
        }).afterClosed()
    }

}
