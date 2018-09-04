import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProgramEditorComponent} from './components/program-editor/program-editor.component';
import {ProgramEditorSideMenuComponent} from './components/program-editor-side-menu/program-editor-side-menu.component';
import {ProgramEditorAceComponent} from './components/program-editor-ace/program-editor-ace.component';
import {NewProjectDialogComponent} from './components/new-project-dialog/new-project-dialog.component';
import {NewProjectFileDialogComponent} from './components/new-project-file-dialog/new-project-file-dialog.component';
import {ProgramEditorService} from './services/program-editor.service';
import {SharedModule} from '../shared/shared.module';
import {ProgramEditorRouterModule} from './program-editor-router.module';
import {ProgramToolbarComponent} from './components/program-toolbar/program-toolbar.component';
import {ProgramEditMenuComponent} from './components/program-edit-menu/program-edit-menu.component';
import {LineParserService} from './services/line-parser.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProgramEditorRouterModule
  ],
  declarations: [
    ProgramEditorComponent,
    ProgramEditorSideMenuComponent,
    ProgramEditorAceComponent,
    NewProjectDialogComponent,
    NewProjectFileDialogComponent,
    ProgramToolbarComponent,
    ProgramEditMenuComponent
  ],
  entryComponents:[
    NewProjectDialogComponent,
    NewProjectFileDialogComponent
  ],
  exports: [
    ProgramEditorComponent
  ],
  providers: [
    ProgramEditorService,
    LineParserService
  ]
})
export class ProgramEditorModule { }
