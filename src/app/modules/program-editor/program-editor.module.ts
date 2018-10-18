import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProgramEditorComponent} from './components/program-editor/program-editor.component';
import {ProgramEditorSideMenuComponent} from './components/program-editor-side-menu/program-editor-side-menu.component';
import {ProgramEditorAceComponent} from './components/program-editor-ace/program-editor-ace.component';
import {NewProjectDialogComponent} from './components/new-project-dialog/new-project-dialog.component';
import {ProgramEditorService} from './services/program-editor.service';
import {SharedModule} from '../shared/shared.module';
import {ProgramEditorRouterModule} from './program-editor-router.module';
import {ProgramToolbarComponent} from './components/program-toolbar/program-toolbar.component';
import {ProgramEditMenuComponent} from './components/program-edit-menu/program-edit-menu.component';
import {LineParserService} from './services/line-parser.service';
import {DataScreenComponent} from './components/data-screen/data-screen.component';
import {AddVarComponent} from './components/add-var/add-var.component';
import {ProgramSettingsComponent} from './components/program-settings/program-settings.component';
import {OpenProjectDialogComponent} from './components/open-project-dialog/open-project-dialog.component';
import {NewAppDialogComponent} from './components/toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import {FramesComponent} from './components/frames/frames.component';
import {PalletizingModule} from '../palletizing/palletizing.module';
import {GripperScreenModule} from '../gripper-screen/gripper-screen.module';
import {SaveAsDialogComponent} from './components/toolbar-dialogs/save-as-dialog/save-as-dialog.component';
import {RenameDialogComponent} from './components/toolbar-dialogs/rename-dialog/rename-dialog.component';
import {NewLibDialogComponent} from './components/toolbar-dialogs/new-lib-dialog/new-lib-dialog.component';
import {AddFrameComponent} from './components/add-frame/add-frame.component';
import {FrameCalibrationDialogComponent} from './components/frame-calibration-dialog/frame-calibration-dialog.component';
import {ToolCalibrationDialogComponent} from './components/tool-calibration-dialog/tool-calibration-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProgramEditorRouterModule,
    PalletizingModule,
    GripperScreenModule
  ],
  declarations: [
    ProgramEditorComponent,
    ProgramEditorSideMenuComponent,
    ProgramEditorAceComponent,
    NewProjectDialogComponent,
    ProgramToolbarComponent,
    ProgramEditMenuComponent,
    DataScreenComponent,
    FramesComponent,
    AddVarComponent,
    ProgramSettingsComponent,
    OpenProjectDialogComponent,
    NewAppDialogComponent,
    NewLibDialogComponent,
    SaveAsDialogComponent,
    RenameDialogComponent,
    AddFrameComponent,
    ToolCalibrationDialogComponent,
    FrameCalibrationDialogComponent
  ],
  entryComponents:[
    NewProjectDialogComponent,
    AddVarComponent,
    OpenProjectDialogComponent,
    NewAppDialogComponent,
    SaveAsDialogComponent,
    RenameDialogComponent,
    NewLibDialogComponent,
    AddFrameComponent,
    ToolCalibrationDialogComponent,
    FrameCalibrationDialogComponent
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
