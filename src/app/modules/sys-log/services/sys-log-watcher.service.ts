import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { SystemLog } from '../enums/sys-log.model';
import { Observable, combineLatest, Subscription, Subject, merge } from 'rxjs';
import { takeUntil, debounceTime, map as rxjsMap, flatMap } from 'rxjs/operators';
import { SysLogOverlayService } from './sys-log-overlay.service';
import { SysLogFetchService } from './sys-log-fetch.service';
import { isUndefined, isNotUndefined } from 'ramda-adjunct';
import { LogUnconfirmDialogComponent } from '../components/log-unconfirm-dialog/log-unconfirm-dialog.component';
import { MatDialog } from '@angular/material';
import { filter, map, prop, compose, find, head, length } from 'ramda';
import { LogInfoComponent } from '../components/log-info/log-info.component';
import { NotificationService } from '../../core/services/notification.service';

@Injectable({
    providedIn: 'root'
})
export class SysLogWatcherService {
    private onListening = false;
    private fisrtPrompt = true;
    private subscribeClicks = true;
    private unconfirmedLog: SystemLog[] = [];
    private clickQuestionSubscription: Subscription;
    private clickContentSubcription: Subscription;
    private clickConfirmSubcription: Subscription;
    private clickConfirmAllSubcription: Subscription;
    private stopListen = new Subject<void>();
    public refreshLog = new EventEmitter<void>();

    constructor(
        private overlaySerivce: SysLogOverlayService,
        private fetchLog: SysLogFetchService,
        private dialog: MatDialog,
        private notify: NotificationService,
        private ngZone: NgZone
    ) {
        const listenOnRefresh = setInterval(() => {
            const isLoginPage = window.location.href.slice(-6) === '/login';
            (this.onListening || isLoginPage) ? clearInterval(listenOnRefresh) : this.startListenSysLog();
        }, 1000);
    }

    public startListenSysLog(): void {
        console.log('Start Listening');
        this.onListening = true;
        
        // Just for test, should remove in production env.
        this.notify.newMessage.subscribe(() => {
            console.log('new Message');
        });
        this.notify.newWebserverMessage.subscribe(() => {
            console.log('new Webserver Message');
        });
        this.notify.newLibAsyncMessage.subscribe(() => {
            console.log('new Lib Async Message');
        });

        this.subscribeClicks && this.subscribeEvents();
        const notifier = merge(
            this.notify.newMessage.pipe(debounceTime<any>(500)),
            this.notify.newWebserverMessage.pipe(debounceTime<any>(500)),
            this.notify.newLibAsyncMessage.pipe(debounceTime<any>(500)),
            this.refreshLog.pipe(debounceTime<any>(200))
        ).pipe(takeUntil(this.stopListen));
        const getUnconfimredLogs = flatMap(() => this.getUnconfimredLogs())
        const runInsideAngular: any = logs => this.promptLatestUnconfirmedLog.bind(this, [...logs]);
        const listener = logs => this.ngZone.run(runInsideAngular(logs));
        const listenOnNotifier = () => notifier.pipe(getUnconfimredLogs).subscribe(listener);
        this.ngZone.runOutsideAngular(listenOnNotifier);
        this.refreshLog.next();
    }

    public stopListenSysLog(): void {
        console.log('Stop Listening');
        this.unsubscribeEvents();
        this.stopListen.next();
        this.overlaySerivce.closeLogSnakbar();
        this.fisrtPrompt = true;
        this.subscribeClicks = true;
    }

    private pauseListenSysLog(): void {
        console.log('Pause Listening');
        this.stopListen.next();
    }

    private getUnconfimredLogs(): Observable<SystemLog[]> {
        const fetchData = [this.fetchLog.fetchSysLog(), this.fetchLog.fetchConfirmedIds()];
        const filterUnconfirmed = ([allLog, confirmedLog]): SystemLog[] => {
            const findLog = log => confirmedLog.find(x => x === log.id);
            const isNotConfirmed = compose(isUndefined, findLog);
            return filter(isNotConfirmed)(allLog);
        };
        return combineLatest(fetchData).pipe(rxjsMap(filterUnconfirmed));
    }

    private promptLatestUnconfirmedLog(unconfirmedLog: SystemLog[]): void {
        this.unconfirmedLog = unconfirmedLog;
        const latestUnconfirmedLog = head(unconfirmedLog);
        const unconfirmedLogCount = length(unconfirmedLog);
        if (isNotUndefined(latestUnconfirmedLog)) {
            if (this.fisrtPrompt) {
                this.overlaySerivce.openLogSnakbar(latestUnconfirmedLog, unconfirmedLogCount);
                this.fisrtPrompt = false;
            } else {
                this.overlaySerivce.refreshSnakbar(latestUnconfirmedLog, unconfirmedLogCount);
            }
        } else {
            this.overlaySerivce.closeLogSnakbar();
            this.fisrtPrompt = true;
        }
    }

    private subscribeEvents(): void {
        this.clickContentSubcription = this.overlaySerivce.clickContent.subscribe(id => {
            this.pauseListenSysLog();
            this.dialog.open(LogUnconfirmDialogComponent, {
                width: '800px',
                disableClose: true,
                data: { unconfirmLog: [...this.unconfirmedLog] }
            }).afterClosed().subscribe(() => {
                this.startListenSysLog();
            });
        });
        this.clickQuestionSubscription = this.overlaySerivce.clickQuestion.subscribe(log => {
            this.pauseListenSysLog();
            this.dialog.open(LogInfoComponent, {
                width: '600px',
                disableClose: true,
                data: { log }
            }).afterClosed().subscribe(() => {
                this.startListenSysLog();
            });
        });
        this.clickConfirmSubcription = this.overlaySerivce.clickConfirm.subscribe((log: SystemLog) => {
            const needConfirmErr = log.source !== 'webServer';
            this.fetchLog.setConfirmId(log.id, needConfirmErr).subscribe(success => {
                if (!success) return;
                this.refreshLog.next();
            });
        });
        this.clickConfirmAllSubcription = this.overlaySerivce.clickConfirmAll.subscribe(() => {
            const getIdList = compose(map(prop('id')), filter((x: SystemLog) => x.canConfirm));
            const isNotAllWebLog = compose(isNotUndefined, find(x => x.source !== 'webServer'))(this.unconfirmedLog);
            this.fetchLog.setConfirmIdList(getIdList(this.unconfirmedLog), isNotAllWebLog).subscribe(success => {
                if (!success) return;
                this.refreshLog.next();
            });
        });
        this.subscribeClicks = false;
    }

    private unsubscribeEvents(): void {
        this.clickQuestionSubscription && this.clickQuestionSubscription.unsubscribe();
        this.clickContentSubcription && this.clickContentSubcription.unsubscribe();
        this.clickConfirmSubcription && this.clickConfirmSubcription.unsubscribe();
        this.clickConfirmAllSubcription && this.clickConfirmAllSubcription.unsubscribe();
    }
}
