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
import { ToolCalibrationResultDialogComponent } from './components/tool-calibration-result-dialog/tool-calibration-result-dialog.component';
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
import {NewDependencyDialogComponent} from './components/toolbar-dialogs/new-dependency-dialog/new-dependency-dialog.component';
import {PayloadsModule} from '../payloads/payloads.module';
import {GripperSelectorComponent} from './components/dialogs/gripper-selector/gripper-selector.component';
import {CallDialogComponent} from './components/dialogs/call-dialog/call-dialog.component';
import {WhileDialogComponent} from './components/dialogs/while-dialog/while-dialog.component';
import {SubDialogComponent} from './components/dialogs/sub-dialog/sub-dialog.component';
import {SleepDialogComponent} from './components/dialogs/sleep-dialog/sleep-dialog.component';
import {RobotSelectorDialogComponent} from './components/dialogs/robot-selector-dialog/robot-selector-dialog.component';
import {PalletPickerDialogComponent} from './components/dialogs/pallet-picker-dialog/pallet-picker-dialog.component';
import {PalletIndexDialogComponent} from './components/dialogs/pallet-index-dialog/pallet-index-dialog.component';
import {MoveDialogComponent} from './components/dialogs/move-dialog/move-dialog.component';
import {IoSelectorDialogComponent} from './components/dialogs/io-selector-dialog/io-selector-dialog.component';
import {IfDialogComponent} from './components/dialogs/if-dialog/if-dialog.component';
import {FunctionDialogComponent} from './components/dialogs/function-dialog/function-dialog.component';
import {DimDialogComponent} from './components/dialogs/dim-dialog/dim-dialog.component';
import {DelayDialogComponent} from './components/dialogs/delay-dialog/delay-dialog.component';
import {CircleDialogComponent} from './components/dialogs/circle-dialog/circle-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProgramEditorRouterModule,
    PalletizingModule,
    GripperScreenModule,
    PayloadsModule
  ],
  declarations: [
    ProgramEditorComponent,
    ProgramEditorSideMenuComponent,
    ProgramEditorAceComponent,
    NewProjectDialogComponent,
    ProgramToolbarComponent,
    ToolCalibrationResultDialogComponent,
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
    FrameCalibrationDialogComponent,
    NewDependencyDialogComponent,
    GripperSelectorComponent,
    CallDialogComponent,
    CircleDialogComponent,
    DelayDialogComponent,
    DimDialogComponent,
    FunctionDialogComponent,
    IfDialogComponent,
    IoSelectorDialogComponent,
    MoveDialogComponent,
    PalletIndexDialogComponent,
    PalletPickerDialogComponent,
    RobotSelectorDialogComponent,
    SleepDialogComponent,
    SubDialogComponent,
    WhileDialogComponent
  ],
  entryComponents: [
    NewProjectDialogComponent,
    ToolCalibrationResultDialogComponent,
    AddVarComponent,
    OpenProjectDialogComponent,
    NewAppDialogComponent,
    SaveAsDialogComponent,
    RenameDialogComponent,
    NewLibDialogComponent,
    AddFrameComponent,
    ToolCalibrationDialogComponent,
    FrameCalibrationDialogComponent,
    NewDependencyDialogComponent,
    GripperSelectorComponent,
    CallDialogComponent,
    CircleDialogComponent,
    DelayDialogComponent,
    DimDialogComponent,
    FunctionDialogComponent,
    IfDialogComponent,
    IoSelectorDialogComponent,
    MoveDialogComponent,
    PalletIndexDialogComponent,
    PalletPickerDialogComponent,
    RobotSelectorDialogComponent,
    SleepDialogComponent,
    SubDialogComponent,
    WhileDialogComponent
  ],
  exports: [
    ProgramEditorComponent
  ],
  providers: [
    ProgramEditorService
  ]
})
export class ProgramEditorModule { }
