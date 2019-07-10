import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimulatorV2Component } from './simulator-v2/simulator-v2.component';

const routes: Routes = [{ path: '', component: SimulatorV2Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SimulatorRoutingModule {}
