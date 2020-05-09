import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { SysLogBookService } from './services/sys-log-book.service';
// import { SysLogBarService } from './services/sys-log-bar.service';
import { SysLogOverlayService } from './services/sys-log-overlay.service';
import { SysLogFetchService } from './services/sys-log-fetch.service';
import { LogSnackbarComponent } from './components/log-snackbar/log-snackbar.component';
import { LogBookComponent } from './components/logbook/logbook.component';
import { LogProfileComponent } from './components/log-profile/log-profile.component';
import { LogDetailsComponent } from './components/log-details/log-details.component';
import { LogEffectComponent } from './components/log-effect/log-effect.component';
import { LogCauseComponent } from './components/log-cause/log-cause.component';
import { LogInfoComponent } from './components/log-info/log-info.component';
import { LogMCInfoComponent } from './components/log-mc-info/log-mc-info.component';
import { LogUnconfirmDialogComponent } from './components/log-unconfirm-dialog/log-unconfirm-dialog.component';
// import { LibLogMsgTranslatorPipe } from './pipes/lib-log-msg-translator.pipe';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

const routes: Routes = [{ path: '', component: LogBookComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogBookRoutingModule { }


@NgModule({
    declarations: [
        LogBookComponent, LogSnackbarComponent, LogProfileComponent, LogDetailsComponent,
        LogCauseComponent, LogEffectComponent, LogInfoComponent, LogUnconfirmDialogComponent,
        LogMCInfoComponent,
    ],
    providers: [
        SysLogOverlayService, SysLogBookService, SysLogFetchService,
    ],
    imports: [
        CommonModule,
        SharedModule,
        LogBookRoutingModule,
        ScrollingModule,
    ],
    exports: [],
    bootstrap: [],
    entryComponents: [LogSnackbarComponent, LogInfoComponent, LogUnconfirmDialogComponent],
})
export class SystemLogModule {
    constructor() { }
}
