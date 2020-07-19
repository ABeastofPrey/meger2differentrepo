import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayloadWizardComponent } from './components/payload-wizard/payload-wizard.component';
import { SharedModule } from '../shared/shared.module';
import { NewPayloadDialogComponent } from './components/new-payload-dialog/new-payload-dialog.component';
import { IdentDialogComponent } from './components/ident-dialog/ident-dialog.component';
import {StxsimNgModule} from 'stxsim-ng';
import { PayloadResultsComponent } from './components/payload-results/payload-results.component';

@NgModule({
  imports: [CommonModule, SharedModule, StxsimNgModule],
  declarations: [
    PayloadWizardComponent,
    NewPayloadDialogComponent,
    IdentDialogComponent,
    PayloadResultsComponent,
  ],
  entryComponents: [NewPayloadDialogComponent, IdentDialogComponent, PayloadResultsComponent],
  exports: [PayloadWizardComponent],
})
export class PayloadsModule {}
