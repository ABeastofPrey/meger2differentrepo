import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import {DashboardScreenComponent} from './components/dashboard-screen/dashboard-screen.component';
import {RecordingsScreenComponent} from './components/recordings-screen/recordings-screen.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboards',
      },
      {
        path: 'dashboards',
        component: DashboardScreenComponent
      },
      {
        path: 'recordings',
        component: RecordingsScreenComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
