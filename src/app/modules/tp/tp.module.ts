import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TpComponent } from './tp.component';
import { TpRoutingModule } from './tp-routing.module';
import { SharedModule } from '../shared/shared.module';
import { JogScreenComponent } from './components/jogscreen/jogscreen.component';
import { LeadByNoseScreenComponent } from './components/lead-by-nose-screen/lead-by-nose-screen.component';
import { HandGuidingComponent } from './components/hand-guiding/hand-guiding.component';

@NgModule({
  imports: [SharedModule, CommonModule, TpRoutingModule],
  declarations: [
    TpComponent,
    JogScreenComponent,
    LeadByNoseScreenComponent,
    HandGuidingComponent,
  ],
})
export class TpModule {}
