import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SimulatorRoutingModule} from './simulator-routing.module';
import {SharedModule} from '../shared/shared.module';
import { SimulatorComponent } from './simulator/simulator.component';
import { ObjectPropertiesComponent } from './object-properties/object-properties.component';
import { ObjectsListComponent } from './objects-list/objects-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SimulatorRoutingModule
  ],
  declarations: [SimulatorComponent, ObjectPropertiesComponent, ObjectsListComponent]
})
export class SimulatorModule { }
