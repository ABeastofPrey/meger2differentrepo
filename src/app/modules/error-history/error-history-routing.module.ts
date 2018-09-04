import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ErrorHistoryComponent} from './error-history.component';

const routes : Routes = [
  { path: '', component: ErrorHistoryComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ErrorHistoryRoutingModule { }
