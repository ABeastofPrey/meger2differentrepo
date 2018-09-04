import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppsComponent} from './components/apps/apps.component';
import {SharedModule} from '../shared/shared.module';
import {ToolsRoutingModule} from './tools-routing.module';
import {FirmwareUpdateComponent} from './components/firmware-update/firmware-update.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ToolsRoutingModule
  ],
  declarations: [AppsComponent, FirmwareUpdateComponent],
  exports: [AppsComponent],
  entryComponents: [FirmwareUpdateComponent]
})
export class ToolsModule { }
