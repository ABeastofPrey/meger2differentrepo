import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AppsComponent} from './components/apps/apps.component';

const routes : Routes = [
  {
    path: '',
    component: AppsComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ToolsRoutingModule { }
