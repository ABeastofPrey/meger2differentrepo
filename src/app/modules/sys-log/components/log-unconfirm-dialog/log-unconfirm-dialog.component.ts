import { Component, OnInit, Inject, AfterViewInit, EventEmitter } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { SysLogFetchService } from '../../services/sys-log-fetch.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { remove, map, prop, compose, find, filter } from 'ramda';
import { isNotUndefined } from 'ramda-adjunct';
import { debounceTime } from 'rxjs/operators';
import { MatTooltip } from '@angular/material';

@Component({
    selector: 'app-log-unconfirm-dialog',
    templateUrl: './log-unconfirm-dialog.component.html',
    styleUrls: ['./log-unconfirm-dialog.component.scss']
})
export class LogUnconfirmDialogComponent implements OnInit, AfterViewInit {
    public unconfirmLog: SystemLog[] = [];
    public errCount: number = 0;
    public warnCount: number = 0;
    public infoCount: number = 0;
    public canExpand = false;

    private confirmEvent: EventEmitter<SystemLog> = new EventEmitter<SystemLog>();

    constructor(
        private fetchLogService: SysLogFetchService,
        private ref: MatDialogRef<void>,
        @Inject(MAT_DIALOG_DATA)
        public data: { unconfirmLog: SystemLog[] }) { }

    ngOnInit(): void {
        this.unconfirmLog = this.data.unconfirmLog;
        this.caculateCount();
        setTimeout(() => {
            this.canExpand = true;
        }, 20);
    }

    ngAfterViewInit(): void {
        this.confirmEvent.pipe(debounceTime(300)).subscribe((log) => {
            const needConfirmErr = log.source !== 'webServer';
            this.fetchLogService.setConfirmId(log.id, needConfirmErr).subscribe(success => {
                if (!success) return;
                const index = this.unconfirmLog.findIndex(_log => _log.id === log.id);
                this.unconfirmLog = remove(index, 1)(this.unconfirmLog);
                this.caculateCount();
                if (this.unconfirmLog.length === 0) {
                    this.ref.close();
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.confirmEvent.unsubscribe();
    }

    public confirm(event: MouseEvent, log: SystemLog): void {
        event.stopPropagation();
        log.canConfirm && this.confirmEvent.next(log);
    }

    public confirmAll(): void {
        const confirmId = compose(map(prop('id')), filter((x: SystemLog) => x.canConfirm))(this.unconfirmLog);
        const isNotAllWebLog = compose(isNotUndefined, find(x => x.source !== 'webServer'))(this.unconfirmLog);
        this.fetchLogService.setConfirmIdList(confirmId, isNotAllWebLog).subscribe(success => {
            if (!success) return;
            if (confirmId.length === this.unconfirmLog.length) {
                this.unconfirmLog = [];
                this.ref.close();
            } else {
                this.unconfirmLog = filter((x: SystemLog) => !x.canConfirm, this.unconfirmLog);
            }
        });
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
