import { Injectable } from '@angular/core';
import { SystemLog } from '../enums/sys-log.model';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { SysLogOverlayService } from './sys-log-overlay.service';
import { SysLogFetchService } from './sys-log-fetch.service';
import { isUndefined, isNotUndefined } from 'ramda-adjunct';
import { LogUnconfirmDialogComponent } from '../components/log-unconfirm-dialog/log-unconfirm-dialog.component';
import { MatDialog } from '@angular/material';
import { filter, map, prop, compose, find } from 'ramda';
import { LogInfoComponent } from '../components/log-info/log-info.component';

@Injectable()
export class SysLogBarService {
    private unconfirmedLog: SystemLog[] = [];
    private preLatestUnconfirmedLogId: string;
    private preLatestUnconfirmedLogCount: number;

    private pausePrompt = false;
    private fetchLogInterval;
    private popupLOgInterval;
    private clickQuestionSubscription: Subscription;
    private clickContentSubcription: Subscription;
    private clickConfirmSubcription: Subscription;
    private clickConfirmAllSubcription: Subscription;

    constructor(
        private overlaySerivce: SysLogOverlayService,
        private fetchLog: SysLogFetchService,
        private dialog: MatDialog,
    ) { 
        this.autoRetrieveLog();
        this.subscribeEvents();
    }

    public startListenSysLog(): void {
        if (this.fetchLogInterval === undefined) {
            this.autoRetrieveLog();
            this.subscribeEvents();
        }
    }

    public stopListenSysLog(): void {
        this.fetchLogInterval = clearInterval(this.fetchLogInterval);
        this.popupLOgInterval = clearInterval(this.popupLOgInterval);
        this.clickQuestionSubscription.unsubscribe();
        this.clickContentSubcription.unsubscribe();
        this.clickConfirmSubcription.unsubscribe();
        this.clickConfirmAllSubcription.unsubscribe();
        this.overlaySerivce.closeLogSnakbar();
    }

    private pauseListenSysLog(): void {
        this.fetchLogInterval = clearInterval(this.fetchLogInterval);
        this.popupLOgInterval = clearInterval(this.popupLOgInterval);
        this.clickQuestionSubscription.unsubscribe();
        this.clickContentSubcription.unsubscribe();
        this.clickConfirmSubcription.unsubscribe();
        this.clickConfirmAllSubcription.unsubscribe();
    }

    private autoRetrieveLog(): void {
        const getUnconfirmed = (allLog: SystemLog[], confirmedLog: string[]): SystemLog[] => {
            const notInConfirmed = (log: SystemLog) => {
                const findLog = confirmedLog.find(x => x === log.id);
                const finded = isUndefined(findLog) ? true : false;
                return finded;
            };
            return filter(notInConfirmed)(allLog);
        };
        this.fetchLogInterval = setInterval(() => {
            combineLatest([this.getLatestLogs(), this.getConfirmedLog()])
                .subscribe(([allLog, _confirmedLog]) => {
                    this.unconfirmedLog = getUnconfirmed(allLog, _confirmedLog);
                });
        }, 500);
        setTimeout(() => {
            this.promptLatestUnconfirmedLog();
            this.autoPromptLatestUnconfirmedLog();
        }, 1000);
    }

    private getConfirmedLog(): Observable<string[]> {
        return this.fetchLog.fetchConfirmedIds();
    }

    private getLatestLogs(): Observable<SystemLog[]> {
        return this.fetchLog.fetchSysLog();
    }

    private promptLatestUnconfirmedLog(): void {
        if (this.pausePrompt) return;
        const latestUnconfirmedLog = this.unconfirmedLog[0];
        if (isNotUndefined(latestUnconfirmedLog)) {
            this.overlaySerivce.closeLogSnakbar();
            this.overlaySerivce.showLogSnakbar(latestUnconfirmedLog, this.unconfirmedLog.length);
            this.preLatestUnconfirmedLogId = latestUnconfirmedLog.id;
            this.preLatestUnconfirmedLogCount = this.unconfirmedLog.length;
        } else {
            this.overlaySerivce.closeLogSnakbar();
        }
    }

    private autoPromptLatestUnconfirmedLog(): void {
        this.popupLOgInterval = setInterval(() => {
            const curLatestUnconfirmedLog = this.unconfirmedLog[0];
            const curLatestUnconfirmedLogId = !!curLatestUnconfirmedLog ? curLatestUnconfirmedLog.id : null;
            const hasCountChanged = this.unconfirmedLog.length !== this.preLatestUnconfirmedLogCount;
            const hasConfirmed = !!curLatestUnconfirmedLog && curLatestUnconfirmedLogId !== this.preLatestUnconfirmedLogId;
            if (curLatestUnconfirmedLog === undefined || hasConfirmed || hasCountChanged) {
                this.promptLatestUnconfirmedLog();
            }
        }, 500);
    }

    private subscribeEvents(): void {
        this.clickContentSubcription = this.overlaySerivce.clickContent.subscribe(id => {
            this.pausePrompt = true;
            this.pauseListenSysLog();
            this.dialog.open(LogUnconfirmDialogComponent, {
                width: '800px',
                disableClose: true,
                data: { unconfirmLog: [...this.unconfirmedLog] }
            }).afterClosed().subscribe((allConfirmed) => {
                this.pausePrompt = false;
                if (isUndefined(allConfirmed)) return;
                this.startListenSysLog();
                if (allConfirmed) {
                    this.overlaySerivce.closeLogSnakbar();
                }
            });
        });
        this.clickQuestionSubscription = this.overlaySerivce.clickQuestion.subscribe(log => {
            this.pausePrompt = true;
            this.pauseListenSysLog();
            this.dialog.open(LogInfoComponent, {
                width: '600px',
                disableClose: true,
                data: { log }
            }).afterClosed().subscribe(() => {
                this.pausePrompt = false;
                this.startListenSysLog();
            });
        });
        this.clickConfirmSubcription = this.overlaySerivce.clickConfirm.subscribe((log: SystemLog) => {
            const needConfirmErr = log.source !== 'webServer';
            this.fetchLog.setConfirmId(log.id, needConfirmErr);
            this.overlaySerivce.closeLogSnakbar();
            this.unconfirmedLog.shift();
            this.promptLatestUnconfirmedLog();
        });
        this.clickConfirmAllSubcription = this.overlaySerivce.clickConfirmAll.subscribe(() => {
            this.overlaySerivce.closeLogSnakbar();
            const idList = map(prop('id'))(this.unconfirmedLog);
            const isNotAllWebLog = compose(isNotUndefined, find(x => x.source !== 'webServer'))(this.unconfirmedLog);
            this.fetchLog.setConfirmId(idList, isNotAllWebLog);
            this.unconfirmedLog.length = 0;
            this.promptLatestUnconfirmedLog();
        });
    }
}
