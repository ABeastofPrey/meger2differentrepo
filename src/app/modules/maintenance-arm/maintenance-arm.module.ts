import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceDialogComponent } from './maintenance-dialog/maintenance-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { MaintenanceArmService } from './maintenance-arm.service';
import { MaintenanceArmCommonService } from './maintenance-arm-common.service';

@NgModule({
  imports: [
    SharedModule,
    CommonModule
  ],
  declarations: [
    MaintenanceDialogComponent
  ],
  entryComponents: [
    MaintenanceDialogComponent
  ],
  providers: [MaintenanceArmCommonService, MaintenanceArmService]
})
export class MaintenanceArmModule { }

