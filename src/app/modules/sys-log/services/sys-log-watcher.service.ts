import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { SystemLog } from '../enums/sys-log.model';
import { Observable, combineLatest, Subscription, Subject, merge, of } from 'rxjs';
import { takeUntil, debounceTime, map as rxjsMap, flatMap, filter as rxjsFilter, tap, mapTo } from 'rxjs/operators';
import { SysLogSnackBarService } from './sys-log-snack-bar.service';
import { SysLogFetchService } from './sys-log-fetch.service';
import { isUndefined, isNotUndefined } from 'ramda-adjunct';
import { LogUnconfirmDialogComponent } from '../components/log-unconfirm-dialog/log-unconfirm-dialog.component';
import { MatDialog } from '@angular/material';
import { filter, map, prop, compose, find, head, length, descend, sort } from 'ramda';
import { LogInfoComponent } from '../components/log-info/log-info.component';
import { NotificationService } from '../../core/services/notification.service';
import { LibAsyncMessageCode } from '../../core/notification.model';

const filterUnconfirmed = ([allLog, confirmedLogId]): SystemLog[] => {
    const findLog = log => confirmedLogId.find(x => x === log.id);
    const isNotConfirmed = compose(isUndefined, findLog);
    return filter(isNotConfirmed)(allLog);
};

export enum LogChangeSource {
    ErrHistory = 'errHistory',
    ErrHistoryDelta = 'errHistoryDelta',
    Maintenance = 'maintenance',
    OnStartListen = 'onInit',
    Ohter = 'other'
}

@Injectable({
    providedIn: 'root'
})
export class SysLogWatcherService {
    private fisrtPrompt = true;
    private subscribeClicks = true;
    private unconfirmedLog: SystemLog[] = [];
    private clickQuestionSubscription: Subscription;
    private clickContentSubcription: Subscription;
    private clickConfirmSubcription: Subscription;
    private clickConfirmAllSubcription: Subscription;
    private stopListen = new Subject<void>();
    private pauseListen = false;
    private confirmedLogId: string[] = [];
    public refreshLog = new EventEmitter<LogChangeSource>();

    constructor(
        private snackbarService: SysLogSnackBarService,
        private fetchLog: SysLogFetchService,
        private dialog: MatDialog,
        private notify: NotificationService,
        private ngZone: NgZone
    ) { }

    startListenSysLog(): void {
        this.subscribeClicks && this.subscribeEvents();
        const notifier = merge(
            this.notify.newMessage.pipe(debounceTime<any>(500), mapTo(LogChangeSource.ErrHistoryDelta)),
            this.notify.newLibAsyncMessage.pipe(
                rxjsFilter(({ code }) => code === LibAsyncMessageCode.MaitenanceNewLog),
                debounceTime<any>(500),
                mapTo(LogChangeSource.Maintenance)
            ),
            this.refreshLog.pipe(debounceTime<any>(200)),
        ).pipe(
            rxjsFilter(() => !this.pauseListen), takeUntil(this.stopListen),
            tap(x => {
                // console.log(x);
            })
        );
        const getUnconfimredLogs = flatMap((_source: LogChangeSource = LogChangeSource.Ohter) => this.getUnconfimredLogs(_source));
        const runInsideAngular: any = logs => this.promptLatestUnconfirmedLog.bind(this, [...logs]);
        const listener = logs => this.ngZone.run(runInsideAngular(logs));
        const listenOnNotifier = () => notifier.pipe(getUnconfimredLogs).subscribe(listener);
        this.ngZone.runOutsideAngular(listenOnNotifier);
        this.refreshLog.emit(LogChangeSource.OnStartListen);
    }

    public stopListenSysLog(): void {
        this.unsubscribeEvents();
        this.stopListen.next();
        !this.fisrtPrompt && this.snackbarService.closeLogSnackBar();
        this.fisrtPrompt = true;
        this.subscribeClicks = true;
    }

    public clearAllLog(unclearedLog: SystemLog[]): void {
        this.confirmedLogId = [];
        this.promptLatestUnconfirmedLog(unclearedLog);
    }

    private getUnconfimredLogs(source: LogChangeSource): Observable<SystemLog[]> {
        if (source === LogChangeSource.OnStartListen) {
            return this.getFromErrHistoryAndMaintenance();
        } else if (source === LogChangeSource.Maintenance) {
            return this.getUnconfirmMaintenaceAndLocal();
        } else if (source === LogChangeSource.ErrHistoryDelta) {
            return this.getFromLatestAndLocal();
        }  else {
            return of(this.unconfirmedLog);
        }
    }

    private getFromErrHistoryAndMaintenance(): Observable<SystemLog[]> {
        const fetchData = [
            this.fetchLog.fetchErrHistoryAndMaintenaceLogs(),
            this.fetchLog.fetchConfirmedIds().pipe(
                tap(ids => this.confirmedLogId = ids) // cache confirmed log id
            )
        ];
        return combineLatest(fetchData).pipe(rxjsMap(filterUnconfirmed));
    }

    private getFromLatestAndLocal(): Observable<SystemLog[]> {
        return this.fetchLog.fetchFromErrHistory('?errorhistorydelta$(1)').pipe(
            rxjsMap(delta => [...this.unconfirmedLog, ...delta]),
            rxjsMap(delta => filterUnconfirmed([delta, this.confirmedLogId])),
            rxjsMap(sort(descend(prop('timestamp'))))
        );
    }

    private getUnconfirmMaintenaceAndLocal(): Observable<SystemLog[]> {
        const fetchData = [
            this.fetchLog.fetchFromLibMaintenance(),
            this.fetchLog.fetchMaintenceConfirmedIds()
        ];
        return combineLatest(fetchData).pipe(
            rxjsMap(filterUnconfirmed),
            rxjsMap(unconfirmMaintenacne => this.unconfirmedLog.filter(x => x.isNotMaintenance).concat(unconfirmMaintenacne)),
            rxjsMap(sort(descend(prop('timestamp'))))
        );
    }

    private promptLatestUnconfirmedLog(unconfirmedLog: SystemLog[]): void {
        this.unconfirmedLog = unconfirmedLog;
        const latestUnconfirmedLog = head(this.unconfirmedLog);
        const unconfirmedLogCount = length(this.unconfirmedLog);
        const hasNoCanConfirm = this.unconfirmedLog.every(x => x.isNotMaintenance === false);
        if (isNotUndefined(latestUnconfirmedLog)) {
            if (this.fisrtPrompt) {
                this.snackbarService.openLogSnackbar(latestUnconfirmedLog, unconfirmedLogCount, hasNoCanConfirm);
                this.fisrtPrompt = false;
            } else {
                this.snackbarService.refreshSnackBar(latestUnconfirmedLog, unconfirmedLogCount, hasNoCanConfirm);
            }
        } else {
            if (this.fisrtPrompt) return;
            this.snackbarService.closeLogSnackBar();
            this.fisrtPrompt = true;
        }
    }

    private subscribeEvents(): void {
        this.clickContentSubcription = this.snackbarService.clickContent.subscribe(id => {
            this.pauseListen = true;
            this.dialog.open(LogUnconfirmDialogComponent, {
                width: '800px',
                disableClose: true,
                data: { unconfirmLog: [...this.unconfirmedLog] }
            }).afterClosed().subscribe(confirmedIds => {
                this.confirmedLogId = this.confirmedLogId.concat(confirmedIds);
                this.pauseListen = false;
                this.refreshLog.next(LogChangeSource.ErrHistoryDelta);
            });
        });
        this.clickQuestionSubscription = this.snackbarService.clickQuestion.subscribe(log => {
            // this.pauseListen = true;
            this.dialog.open(LogInfoComponent, {
                width: '600px',
                disableClose: true,
                data: { log }
            }).afterClosed().subscribe(() => {
                // this.pauseListen = false;
                // this.refreshLog.next(LogChangeSource.ErrHistoryDelta);
            });
        });
        this.clickConfirmSubcription = this.snackbarService.clickConfirm.subscribe((log: SystemLog) => {
            const needConfirmErr = log.source !== 'webServer';
            this.fetchLog.setConfirmId(log.id, needConfirmErr).subscribe(success => {
                if (!success) return;
                this.unconfirmedLog.shift();
                this.promptLatestUnconfirmedLog(this.unconfirmedLog);
            });
        });
        this.clickConfirmAllSubcription = this.snackbarService.clickConfirmAll.subscribe(() => {
            const getIdList = compose(map(prop('id')), filter((x: SystemLog) => x.isNotMaintenance));
            const isNotAllWebLog = compose(isNotUndefined, find(x => x.source !== 'webServer'))(this.unconfirmedLog);
            const allIdList = getIdList(this.unconfirmedLog);
            this.fetchLog.setConfirmIdList(allIdList, isNotAllWebLog).subscribe(success => {
                if (!success) return;
                this.unconfirmedLog = this.unconfirmedLog.filter(x => !x.isNotMaintenance);
                this.promptLatestUnconfirmedLog(this.unconfirmedLog);
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
