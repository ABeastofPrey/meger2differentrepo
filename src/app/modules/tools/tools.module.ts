import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppsComponent } from './components/apps/apps.component';
import { SharedModule } from '../shared/shared.module';
import { ToolsRoutingModule } from './tools-routing.module';
import { FactoryRestoreComponent } from './components/factory-restore/factory-restore.component';
import { DiagnosisService } from './services/diagnosis.service';
import { DiagnosisComponent } from './components/diagnosis/diagnosis.component';
import { CabinetUpdateDialogComponent } from './components/cabinet-update-dialog/cabinet-update-dialog.component';

@NgModule({
  imports: [CommonModule, SharedModule, ToolsRoutingModule],
  declarations: [AppsComponent, FactoryRestoreComponent, DiagnosisComponent, CabinetUpdateDialogComponent],
  exports: [AppsComponent],
  providers: [DiagnosisService],
  entryComponents: [FactoryRestoreComponent, CabinetUpdateDialogComponent],
})
export class ToolsModule {}
