import { NgModule } from '@angular/core';
import { SimulatorRoutingModule } from './simulator-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ObjectPropertiesComponent } from './object-properties/object-properties.component';
import { ObjectsListComponent } from './objects-list/objects-list.component';
import { SimulatorV2Component } from './simulator-v2/simulator-v2.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { StxsimNgModule } from 'stxsim-ng';

@NgModule({
  imports: [
    SharedModule,
    SimulatorRoutingModule,
    ColorPickerModule,
    StxsimNgModule,
  ],
  declarations: [
    ObjectPropertiesComponent,
    ObjectsListComponent,
    SimulatorV2Component,
  ],
})
export class SimulatorModule {}
