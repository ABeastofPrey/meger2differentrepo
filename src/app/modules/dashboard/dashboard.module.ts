import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardWindowComponent } from './components/dashboard-window/dashboard-window.component';
import { NewDashboardParameterDialogComponent } from './components/new-dashboard-parameter-dialog/new-dashboard-parameter-dialog.component';
import { NewDashboardDialogComponent } from './components/new-dashboard-dialog/new-dashboard-dialog.component';
import { ExternalGraphDialogComponent } from './components/external-graph-dialog/external-graph-dialog.component';
import { DashboardService } from './services/dashboard.service';
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardScreenComponent } from './components/dashboard-screen/dashboard-screen.component';
import { RecordingsScreenComponent } from './components/recordings-screen/recordings-screen.component';

@NgModule({
  imports: [CommonModule, SharedModule, DashboardRoutingModule],
  declarations: [
    DashboardComponent,
    DashboardWindowComponent,
    NewDashboardDialogComponent,
    NewDashboardParameterDialogComponent,
    ExternalGraphDialogComponent,
    DashboardScreenComponent,
    RecordingsScreenComponent,
  ],
  exports: [DashboardComponent],
  entryComponents: [
    NewDashboardDialogComponent,
    NewDashboardParameterDialogComponent,
    ExternalGraphDialogComponent,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
