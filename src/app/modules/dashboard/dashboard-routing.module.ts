import { NgModule } from '@angular/core';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {Routes} from '@angular/router';
import {RouterModule} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
