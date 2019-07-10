import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskMngrComponent } from './task-mngr.component';

const routes: Routes = [
  {
    path: '',
    component: TaskMngrComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskManagerRoutingModule {}
