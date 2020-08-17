import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallPluginComponent } from './install-plugin/install-plugin.component';
import { SharedModule } from '../shared/shared.module';
import { PluginsService } from './plugins.service';


const declare_export_entry = [
  InstallPluginComponent
];

@NgModule({
  declarations: [
    ...declare_export_entry
  ],
  imports: [
    SharedModule, 
    CommonModule
  ],
  exports: [
    ...declare_export_entry
  ],
  entryComponents: [
    ...declare_export_entry
  ],
  providers: [PluginsService],
})
export class PluginsModule { }
