import { Injectable } from '@angular/core';
import { SystemLog } from '../enums/sys-log.model';
import { SysLogFetchService } from './sys-log-fetch.service';
import { Observable } from 'rxjs';

@Injectable()
export class SysLogBookService {
    constructor(private fetchLog: SysLogFetchService) { }

    public getSysLogs(): Observable<SystemLog[]> {
        return this.fetchLog.fetchSysLog();
    }

    public clearAllLogHistory(): Observable<boolean> {
        return this.fetchLog.clearSysLog();
    }

    public clearAllDriveFault(): void {
        this.fetchLog.clearDriveFault();
    }
}
