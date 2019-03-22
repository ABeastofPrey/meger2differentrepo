import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {HelpComponent} from './help.component';
import {HelpRoutingModule} from './help-routing.module';
import { ShortcutsComponent } from './components/shortcuts/shortcuts.component';
import { ActivationComponent } from './components/activation/activation.component';
import { QRCodeModule } from 'angularx-qrcode';
import { ActivationService } from './components/activation/activation.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    QRCodeModule,
    HelpRoutingModule
  ],
  declarations: [HelpComponent, ShortcutsComponent, ActivationComponent],
  exports: [HelpComponent],
  providers: [ActivationService],
  entryComponents: [ShortcutsComponent, ActivationComponent]
})
export class HelpModule { }
