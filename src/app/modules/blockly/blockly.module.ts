import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import { BlocklyEditorComponent } from './components/blockly-editor/blockly-editor.component';
import {BlocklyRoutingModule} from './blockly-routing.module';

@NgModule({
  declarations: [BlocklyEditorComponent],
  imports: [
    CommonModule,
    SharedModule,
    BlocklyRoutingModule
  ],
  schemas:[ NO_ERRORS_SCHEMA ]
})
export class BlocklyModule { }
