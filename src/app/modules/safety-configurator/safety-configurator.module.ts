import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafetyConfiguratorComponent } from './safety-configurator/safety-configurator.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [SafetyConfiguratorComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class SafetyConfiguratorModule { }
