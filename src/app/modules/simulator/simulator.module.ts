import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorRoutingModule } from './simulator-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ObjectPropertiesComponent } from './object-properties/object-properties.component';
import { ObjectsListComponent } from './objects-list/objects-list.component';
import { StxsimNgModule } from 'stxsim-ng';
import { SimulatorV2Component } from './simulator-v2/simulator-v2.component';

@NgModule({
  imports: [CommonModule, SharedModule, SimulatorRoutingModule, StxsimNgModule],
  declarations: [
    ObjectPropertiesComponent,
    ObjectsListComponent,
    SimulatorV2Component,
  ],
})
export class SimulatorModule {}
