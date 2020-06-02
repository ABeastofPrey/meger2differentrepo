import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PalletizingComponent } from './components/palletizing-screen/palletizing.component';
import { CanDeactivateGuard } from './can-deactivate.guard';

const routes: Routes = [
  {
    path: '',
    component: PalletizingComponent,
    canDeactivate: [CanDeactivateGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PalletizingRoutingModule {}