import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { GripperScreenComponent } from './components/gripper-screen/gripper-screen.component';
import { GripperTestDialogComponent } from './components/gripper-test-dialog/gripper-test-dialog.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  exports: [GripperScreenComponent],
  declarations: [GripperScreenComponent, GripperTestDialogComponent],
  entryComponents: [GripperTestDialogComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class GripperScreenModule {}
