import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskManagerRoutingModule } from './task-manager-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TaskMngrComponent } from './task-mngr.component';
import { TaskFilterPipe } from './task-filter.pipe';

@NgModule({
  imports: [CommonModule, SharedModule, TaskManagerRoutingModule],
  declarations: [TaskMngrComponent, TaskFilterPipe],
  exports: [TaskMngrComponent],
})
export class TaskManagerModule {}
