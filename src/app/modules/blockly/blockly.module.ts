import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {GraphicEditorComponent} from './components/graphic-editor/graphic-editor.component';
import {GraphicEditorSideMenuComponent} from './components/graphic-editor-side-menu/graphic-editor-side-menu.component';
import {BlocklyComponent} from './components/blockly/blockly.component';
import {BlocklyService} from './services/blockly.service';
import {NO_ERRORS_SCHEMA} from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    GraphicEditorComponent,
    GraphicEditorSideMenuComponent,
    BlocklyComponent,
  ],
  exports: [
    GraphicEditorComponent
  ],
  providers: [
    BlocklyService
  ],
  schemas:[NO_ERRORS_SCHEMA]
})
export class BlocklyModule { }
