import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { SysLogBookService } from './services/sys-log-book.service';
import { SysLogFetchService } from './services/sys-log-fetch.service';
import { LogSnackBarComponent } from './components/log-snack-bar/log-snack-bar.component';
import { LogBookComponent } from './components/logbook/logbook.component';
import { LogProfileComponent } from './components/log-profile/log-profile.component';
import { LogDetailsComponent } from './components/log-details/log-details.component';
import { LogEffectComponent } from './components/log-effect/log-effect.component';
import { LogCauseComponent } from './components/log-cause/log-cause.component';
import { LogInfoComponent } from './components/log-info/log-info.component';
import { LogMCInfoComponent } from './components/log-mc-info/log-mc-info.component';
import { LogUnconfirmDialogComponent } from './components/log-unconfirm-dialog/log-unconfirm-dialog.component';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { WebsocketService } from '../../modules/core/services/websocket.service';
import { SysLogWatcherService } from './services/sys-log-watcher.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { pipe } from 'rxjs';

const routes: Routes = [{ path: '', component: LogBookComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LogBookRoutingModule { }


@NgModule({
    declarations: [
        LogBookComponent, LogSnackBarComponent, LogProfileComponent, LogDetailsComponent,
        LogCauseComponent, LogEffectComponent, LogInfoComponent, LogUnconfirmDialogComponent,
        LogMCInfoComponent,
    ],
    providers: [
        SysLogBookService, SysLogFetchService,
    ],
    imports: [
        CommonModule,
        SharedModule,
        LogBookRoutingModule,
        ScrollingModule,
    ],
    exports: [],
    bootstrap: [],
    entryComponents: [LogSnackBarComponent, LogInfoComponent, LogUnconfirmDialogComponent],
})
export class SystemLogModule {
    constructor(private ws: WebsocketService, private sysLogWatcher: SysLogWatcherService) {
        const observer = connected => connected ? this.sysLogWatcher.startListenSysLog() : this.sysLogWatcher.stopListenSysLog();
        const subscribePolicy = pipe(debounceTime(200), distinctUntilChanged());
        subscribePolicy(this.ws.isConnected).subscribe(observer);
    }
}
