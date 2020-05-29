import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardWindowComponent } from './components/dashboard-window/dashboard-window.component';
import { NewDashboardParameterDialogComponent } from './components/new-dashboard-parameter-dialog/new-dashboard-parameter-dialog.component';
import { NewDashboardDialogComponent } from './components/new-dashboard-dialog/new-dashboard-dialog.component';
import { DashboardService } from './services/dashboard.service';
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardScreenComponent } from './components/dashboard-screen/dashboard-screen.component';
import { RecordingsScreenComponent } from './components/recordings-screen/recordings-screen.component';
import { TraceTabComponent } from './components/trace/trace-tab/trace-tab.component';
import { TraceChannelComponent } from './components/trace/trace-channel/trace-channel.component';
import { TraceCommonComponent } from './components/trace/trace-common/trace-common.component';
import { TraceTriggerComponent } from './components/trace/trace-trigger/trace-trigger.component';
// import { TraceNewComponent } from './components/trace/trace-new/trace-new.component';
import { TraceService } from './services/trace.service';

@NgModule({
  imports: [CommonModule, SharedModule, DashboardRoutingModule],
  declarations: [
    DashboardComponent,
    DashboardWindowComponent,
    NewDashboardDialogComponent,
    NewDashboardParameterDialogComponent,
    DashboardScreenComponent,
    RecordingsScreenComponent,
    TraceTabComponent,
    TraceChannelComponent,
    TraceCommonComponent,
    TraceTriggerComponent,
    // TraceNewComponent,
  ],
  exports: [DashboardComponent],
  entryComponents: [
    NewDashboardDialogComponent,
    NewDashboardParameterDialogComponent
  ],
  providers: [DashboardService, TraceService],
})
export class DashboardModule {}
