import { Injectable } from '@angular/core';
import { WebsocketService, TpStatService } from '../../core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CSProgressComponent } from '../../../components/progress/progress.component';
import { Observable, Subscription, Subject } from 'rxjs';
import { PluginUnInStallIsReady, MCQueryResponse, PMINFO, DependList } from './plugin.manage.enum';
import { map, takeUntil } from 'rxjs/operators';
import { UtilsService } from '../../core/services/utils.service';

@Injectable()
export class PluginManageService {

    constructor(
        private ws: WebsocketService, private dialog: MatDialog,
        private utilsService: UtilsService,
        private tpStatService: TpStatService
    ) { }

    private progressInterval: any;
    private noticer: Subject<boolean> = new Subject();
    private processDialogRef: MatDialogRef<CSProgressComponent>;

    private refreshTip(e) {
        const tip = '刷新提示';
        e.returnValue = tip;
        return tip;
    }

    private refreshPrompt(refresh: boolean): void {
        refresh ? window.addEventListener("beforeunload", this.refreshTip) : window.removeEventListener("beforeunload", this.refreshTip);
    }

    public isConnected(): Observable<boolean> {
        return this.ws.isConnected;
    }

    public getPluginsList(): Observable<PMINFO[]> {
        return this.ws.observableQuery('?PLUG_GET_MNG_INFO')
            .pipe(map((res: MCQueryResponse) => {
                return JSON.parse(res.result);
            }));
    }

    public unInStallIsReady(): Observable<PluginUnInStallIsReady> {
        return this.ws.observableQuery('?PLUG_IsInstallReady')
            .pipe(map((res: MCQueryResponse) => +res.result));
    }

    public getUnstallPluginDepend(name: string): Observable<DependList[]> {
        return this.ws.observableQuery(`?PLUG_get_Dependency_List("${name}")`)
            .pipe(map((res: MCQueryResponse) => {
                return JSON.parse(res.result);
            }))
    }

    public startUninstallPlugin(name: string, callback: Function): void {
        this.refreshPrompt(true);
        this.processDialogRef = this.dialog.open(CSProgressComponent, {
            width: '500px',
            hasBackdrop: true,
            disableClose: true,
            closeOnNavigation: true,
            data: {
                title: 'pluginManage.progress.uninstallPlugin',
                value: 10, bufferValue: 2,
            }
        });
        this.uninstallPlugin(name).subscribe((result) => {
            if (result === "1") {
                this.processDialogRef.componentInstance.value = 30;
                this.processDialogRef.componentInstance.bufferValue = 30;
                this.reload(callback);
            } else {
                this.processDialogRef && this.processDialogRef.close();
                callback(false);
            }
        })
    }

    private uninstallPlugin(name: string): Observable<string> {
        return this.ws.observableQuery(`?PLUG_UNINSTALL_PLUGIN("${name}")`)
            .pipe(map((res: MCQueryResponse) => {
                return res.result;
            }))
    }

    public setUnPluginInstallResult(state: number): void {
        this.ws.observableQuery(`PLUG_SHOW_UNINSTALL_RESULT(${state})`).subscribe();
    }

    private reload(callback: Function): void {
        this.ws.observableQuery(`?PLUG_PRG_PRE_KILL`).subscribe(res => {
            this.utilsService.resetAll(true).then((resetRes) => {
                this.progressIncrease();
                this.processDialogRef.componentInstance.value = 50;
                this.processDialogRef.componentInstance.bufferValue = 50;
                this.processDialogRef.componentInstance.title = 'loading';
                this.watchSysState(callback);
            });
        })

    }

    private watchSysState(callback: Function): void {
        let watchOnlineSub: Subscription;
        watchOnlineSub = this.tpStatService.onlineStatus.pipe(takeUntil(this.noticer)).subscribe((status) => {
            if (!status) return;
            this.processDialogRef.componentInstance.value = 100;
            this.processDialogRef.componentInstance.bufferValue = 0;
            this.refreshPrompt(false);
            this.processDialogRef.componentInstance.title = 'loading';
            watchOnlineSub && watchOnlineSub.unsubscribe();
            this.progressInterval && clearInterval(this.progressInterval);
            this.processDialogRef && this.processDialogRef.close();
            callback(true);
        })
    }

    private progressIncrease() {
        this.progressInterval = setInterval(() => {
            if (this.processDialogRef.componentInstance.value < 90) {
                this.processDialogRef.componentInstance.value += 10;
                this.processDialogRef.componentInstance.bufferValue -= 10;
            }
        }, 1000)
    }

}
