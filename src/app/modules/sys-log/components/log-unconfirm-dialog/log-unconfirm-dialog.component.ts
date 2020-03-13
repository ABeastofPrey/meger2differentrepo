import { Component, OnInit, Inject } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { SysLogFetchService } from '../../services/sys-log-fetch.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { remove, map, prop, compose, find } from 'ramda';
import { isNotUndefined } from 'ramda-adjunct';

@Component({
    selector: 'app-log-unconfirm-dialog',
    templateUrl: './log-unconfirm-dialog.component.html',
    styleUrls: ['./log-unconfirm-dialog.component.scss']
})
export class LogUnconfirmDialogComponent implements OnInit {
    public unconfirmLog: SystemLog[] = [];
    public errCount: number = 0;
    public warnCount: number = 0;
    public infoCount: number = 0;
    public canExpand = false;

    constructor(
        private fetchLogService: SysLogFetchService,
        private ref: MatDialogRef<boolean>,
        @Inject(MAT_DIALOG_DATA)
        public data: { unconfirmLog: SystemLog[] }) { }

    ngOnInit(): void {
        this.unconfirmLog = this.data.unconfirmLog;
        this.caculateCount();
        setTimeout(() => {
            this.canExpand = true;
        }, 20);
    }

    public confirm(event: MouseEvent, log: SystemLog): void {
        const needConfirmErr = log.source !== 'webServer';
        this.fetchLogService.setConfirmId(log.id, needConfirmErr);
        const index = this.unconfirmLog.findIndex(_log => _log.id === log.id);
        this.unconfirmLog = remove(index, 1)(this.unconfirmLog);
        this.caculateCount();
        event.stopImmediatePropagation();
        if (this.unconfirmLog.length === 0) {
            this.ref.close(true);
        }
    }

    public confirmAll(event: any): void {
        const idList = map(prop('id'))(this.unconfirmLog);
        const isNotAllWebLog = compose(isNotUndefined, find(x => x.source !== 'webServer'))(this.unconfirmLog);
        this.fetchLogService.setConfirmId(idList, isNotAllWebLog);
        this.unconfirmLog = [];
        this.ref.close(true);
    }

    public viewPortHeight(): string {
        if (this.unconfirmLog.length === 0) return '0';
        const max = (this.unconfirmLog.length < 10) ? this.unconfirmLog.length : 10;
        return 48 * max + 32 + 'px';
    }

    private caculateCount(): void {
        this.errCount = 0;
        this.warnCount = 0;
        this.infoCount = 0;
        this.unconfirmLog.forEach(log => {
            if (log.type === 'error') {
                this.errCount++;
            } else if (log.type === 'warning') {
                this.warnCount++;
            } else if (log.type === 'information') {
                this.infoCount++;
            } else {
                console.warn('Get unknow type of log.');
            }
        });
    }

}
