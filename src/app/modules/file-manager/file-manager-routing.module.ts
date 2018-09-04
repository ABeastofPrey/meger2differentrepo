import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FileMngrComponent} from './file-mngr.component';

const routes: Routes = [
  {
    path: '',
    component: FileMngrComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class FileManagerRoutingModule { }
