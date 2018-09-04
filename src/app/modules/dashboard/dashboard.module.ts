import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {DashboardWindowComponent} from './components/dashboard-window/dashboard-window.component';
import {NewDashboardParameterDialogComponent} from './components/new-dashboard-parameter-dialog/new-dashboard-parameter-dialog.component';
import {NewDashboardDialogComponent} from './components/new-dashboard-dialog/new-dashboard-dialog.component';
import {RecordDialogComponent} from './components/record-dialog/record-dialog.component';
import {RecordGraphComponent} from './components/record-graph/record-graph.component';
import {ExternalGraphDialogComponent} from './components/external-graph-dialog/external-graph-dialog.component';
import {DashboardService} from './services/dashboard.service';
import {SharedModule} from '../shared/shared.module';
import {DashboardRoutingModule} from './dashboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    DashboardComponent,
    DashboardWindowComponent,
    NewDashboardDialogComponent,
    NewDashboardParameterDialogComponent,
    RecordDialogComponent,
    RecordGraphComponent,
    ExternalGraphDialogComponent,
  ],
  exports: [
    DashboardComponent
  ],
  entryComponents: [
    NewDashboardDialogComponent,
    NewDashboardParameterDialogComponent,
    RecordDialogComponent,
    RecordGraphComponent,
    ExternalGraphDialogComponent,
  ],
  providers:[
    DashboardService
  ]
})
export class DashboardModule { }
