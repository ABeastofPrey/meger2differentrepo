import { Component, OnInit, Input, Inject } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';


@Component({
    selector: 'app-log-info',
    templateUrl: './log-info.component.html',
    styleUrls: ['./log-info.component.scss']
})
export class LogInfoComponent implements OnInit {
    public log: SystemLog;
    constructor(@Inject(MAT_DIALOG_DATA) public data: { log: SystemLog }) { }

    ngOnInit(): void {
        this.log = { ...this.data.log };
    }
}
