import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppsComponent } from './components/apps/apps.component';
import { SharedModule } from '../shared/shared.module';
import { ToolsRoutingModule } from './tools-routing.module';
import { FactoryRestoreComponent } from './components/factory-restore/factory-restore.component';

@NgModule({
  imports: [CommonModule, SharedModule, ToolsRoutingModule],
  declarations: [AppsComponent, FactoryRestoreComponent],
  exports: [AppsComponent],
  entryComponents: [FactoryRestoreComponent],
})
export class ToolsModule {}
