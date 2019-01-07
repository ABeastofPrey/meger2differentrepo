import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {HelpComponent} from './help.component';
import {HelpRoutingModule} from './help-routing.module';
import { ShortcutsComponent } from './components/shortcuts/shortcuts.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HelpRoutingModule
  ],
  declarations: [HelpComponent, ShortcutsComponent],
  exports: [HelpComponent],
  entryComponents:[ShortcutsComponent]
})
export class HelpModule { }
