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
import {IoMappingModule} from './modules/io-mapping/io-mapping.module';
import { ArchSettingComponent } from './components/program-settings/arch-setting/arch-setting.component';
import { ArchSettingService } from './services/arch-setting.service';
import { JumpDialogComponent } from './components/dialogs/jump-dialog/jump-dialog.component';
import { DataNotArrayPipe } from './components/dialogs/jump-dialog/jump-dialog.pipe';
import { Jump3DialogComponent } from './components/dialogs/jump3-dialog/jump3-dialog.component';
import { Jump3DialogService } from './services/jump3-dialog.service';
import { PositionTriggerComponent } from './components/program-settings/position-trigger/position-trigger.component';
import { NewPositionTriggerComponent } from './components/program-settings/new-position-trigger/new-position-trigger.component';
import { PositionTriggerService } from './services/position-trigger.service';
import { StopDialogComponent } from './components/dialogs/stop-dialog/stop-dialog.component';
import { PayloadSelectorComponent } from './components/dialogs/payload-selector/payload-selector.component';
import { HomeSettingComponent } from './components/program-settings/home-setting/home-setting.component';
import { HomeSettingService } from './services/home-setting.service';
import { HomeDialogComponent } from './components/dialogs/home-dialog/home-dialog.component';
import { HomeDialogService } from './services/home-dialog.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProgramEditorRouterModule,
    PalletizingModule,
    GripperScreenModule,
    PayloadsModule,
    IoMappingModule
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
    ArchSettingComponent,
    WhileDialogComponent,
    JumpDialogComponent,
    DataNotArrayPipe,
    WhileDialogComponent,
    JumpDialogComponent,
    Jump3DialogComponent,
    HomeDialogComponent,
    PositionTriggerComponent,
    NewPositionTriggerComponent,
    DataNotArrayPipe,
    StopDialogComponent,
    PayloadSelectorComponent,
    HomeSettingComponent
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
    WhileDialogComponent,
    JumpDialogComponent,
    Jump3DialogComponent,
    HomeDialogComponent,
    PositionTriggerComponent,
    NewPositionTriggerComponent,
    StopDialogComponent,
    PayloadSelectorComponent
  ],
  exports: [
    ProgramEditorComponent
  ],
  providers: [
    ProgramEditorService,
    ArchSettingService,
    Jump3DialogService,
    HomeDialogService,
    PositionTriggerService,
    HomeSettingService
  ]
})
export class ProgramEditorModule { }
