import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PayloadWizardComponent} from './components/payload-wizard/payload-wizard.component';
import {SharedModule} from '../shared/shared.module';
import { NewPayloadDialogComponent } from './components/new-payload-dialog/new-payload-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    PayloadWizardComponent,
    NewPayloadDialogComponent
  ],
  entryComponents:[
    PayloadWizardComponent,
    NewPayloadDialogComponent
  ],
  exports: [
    PayloadWizardComponent
  ]
})
export class PayloadsModule { }
