import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {HelpComponent} from './help.component';
import {HelpRoutingModule} from './help-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HelpRoutingModule
  ],
  declarations: [HelpComponent],
  exports: [HelpComponent]
})
export class HelpModule { }
