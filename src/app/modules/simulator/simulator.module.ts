import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SimulatorRoutingModule} from './simulator-routing.module';
import {SharedModule} from '../shared/shared.module';
import { SimulatorComponent } from './simulator/simulator.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SimulatorRoutingModule
  ],
  declarations: [SimulatorComponent]
})
export class SimulatorModule { }
