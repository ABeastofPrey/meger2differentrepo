import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DashboardScreenComponent } from './components/dashboard-screen/dashboard-screen.component';
import { RecordingsScreenComponent } from './components/recordings-screen/recordings-screen.component';
import { TraceTabComponent } from './components/trace/trace-tab/trace-tab.component';
import { DashboardRoutes } from './dashboard-routes';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: DashboardRoutes.Recording,
      }, {
        path: DashboardRoutes.Dashboard,
        component: DashboardScreenComponent
      }, {
        path: DashboardRoutes.Recording,
        component: RecordingsScreenComponent
      }, {
        path: DashboardRoutes.Trace,
        component: TraceTabComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
