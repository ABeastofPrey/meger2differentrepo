import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafetyConfiguratorComponent } from './safety-configurator/safety-configurator.component';
import { SharedModule } from '../shared/shared.module';
import { SafetyTableComponent } from './safety-table/safety-table.component';



@NgModule({
  declarations: [SafetyConfiguratorComponent, SafetyTableComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class SafetyConfiguratorModule { }
