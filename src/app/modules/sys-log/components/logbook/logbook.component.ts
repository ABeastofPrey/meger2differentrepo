import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { SysLogBookService } from '../../services/sys-log-book.service';
import { SysLogWatcherService } from '../../services/sys-log-watcher.service';
import { PageEvent } from '@angular/material';
import { slice, filter } from 'ramda';
import { WebsocketService } from '../../../core/services/websocket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-logbook',
    templateUrl: './logbook.component.html',
    styleUrls: ['./logbook.component.scss']
})
export class LogBookComponent implements OnInit {

    public allLogs: SystemLog[] = [];
    public filteredLogs: SystemLog[] = [];
    public visiableLogs: SystemLog[] = [];
    public dirveLogs: SystemLog[] = [];
    public showFirm = true;
    public showLib = true;
    public showDrive = true;
    public showServe = true;
    public showError = true;
    public showWarn = true;
    public showInfo = true;
    public pageSize = 10;
    public pageIndex = 0;

    private notifier: Subject<boolean> = new Subject();

    constructor(
        private service: SysLogBookService,
        private sysLogWatcher: SysLogWatcherService,
        private ws: WebsocketService,
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(stat=>{
            if (!stat) return;
            this.fetchLog();
        });
    }

    ngOnDestroy() {
        this.notifier.next(true);
        this.notifier.unsubscribe();
    }

    private fetchLog(): void {
        this.service.getSysLogs().pipe(takeUntil(this.notifier)).subscribe(_logs => {
            this.allLogs = _logs;
            this.filteredLogs = _logs;
            this.dirveLogs = filter((x: SystemLog) => x.source === 'drive')(_logs);
            this.visiableLogs = slice(0, this.pageSize)(_logs);
            this.onFilter();
            this.cdRef.detectChanges();
        });
    }

    public onFilter(): void {
        const filterLogs = filter((x: SystemLog) => {
            if (this.showFirm === false && x.source === 'firmware') {
                return false;
            }
            if (this.showLib === false && x.source === 'lib') {
                return false;
            }
            if (this.showDrive === false && x.source === 'drive') {
                return false;
            }
            if (this.showServe === false && x.source === 'webServer') {
                return false;
            }
            if (this.showError === false && x.type === 'error') {
                return false;
            }
            if (this.showWarn === false && x.type === 'warning') {
                return false;
            }
            if (this.showInfo === false && x.type === 'information') {
                return false;
            }
            return true;
        });
        this.filteredLogs = filterLogs(this.allLogs);
        this.visiableLogs = slice(0, this.pageSize)(this.filteredLogs);
        this.pageIndex = 0;
    }

    public pageChange({ pageIndex, pageSize }: PageEvent): void {
        this.pageIndex = pageIndex;
        const strIndex = pageIndex * pageSize;
        const endIndex = strIndex + pageSize;
        this.visiableLogs = slice(strIndex, endIndex)(this.filteredLogs);
    }

    public clearAllLogHistory(): void {
        this.service.clearAllLogHistory().pipe(takeUntil(this.notifier)).subscribe(() => {
            this.fetchLog();
            this.sysLogWatcher.refreshLog.next();
        });
    }

    public clearAllDriveFault(): void {
        this.service.clearAllDriveFault().then(() => {
            this.fetchLog();
            this.sysLogWatcher.refreshLog.next();
        });
    }
}
