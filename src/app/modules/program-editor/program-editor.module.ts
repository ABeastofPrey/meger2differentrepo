import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramEditorComponent } from './components/program-editor/program-editor.component';
import { ProgramEditorSideMenuComponent } from './components/program-editor-side-menu/program-editor-side-menu.component';
import { ProgramEditorAceComponent } from './components/program-editor-ace/program-editor-ace.component';
import { NewProjectDialogComponent } from './components/new-project-dialog/new-project-dialog.component';
import { ProgramEditorService } from './services/program-editor.service';
import { SharedModule } from '../shared/shared.module';
import { ProgramEditorRouterModule } from './program-editor-router.module';
import { ProgramToolbarComponent } from './components/program-toolbar/program-toolbar.component';
import { ProgramEditMenuComponent } from './components/program-edit-menu/program-edit-menu.component';
import { ToolCalibrationResultDialogComponent } from './components/tool-calibration-result-dialog/tool-calibration-result-dialog.component';
import { DataScreenComponent } from './components/data-screen/data-screen.component';
import { AddVarComponent } from './components/add-var/add-var.component';
import { ProgramSettingsComponent } from './components/program-settings/program-settings.component';
import { OpenProjectDialogComponent } from './components/open-project-dialog/open-project-dialog.component';
import { NewAppDialogComponent } from './components/toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import { FramesComponent } from './components/frames/frames.component';
import { PalletizingModule } from '../palletizing/palletizing.module';
import { GripperScreenModule } from '../gripper-screen/gripper-screen.module';
import { SaveAsDialogComponent } from './components/toolbar-dialogs/save-as-dialog/save-as-dialog.component';
import { RenameDialogComponent } from './components/toolbar-dialogs/rename-dialog/rename-dialog.component';
import { NewLibDialogComponent } from './components/toolbar-dialogs/new-lib-dialog/new-lib-dialog.component';
import { AddFrameComponent } from './components/add-frame/add-frame.component';
import { FrameCalibrationDialogComponent } from './components/frame-calibration-dialog/frame-calibration-dialog.component';
import { ToolCalibrationDialogComponent } from './components/tool-calibration-dialog/tool-calibration-dialog.component';
import { NewDependencyDialogComponent } from './components/toolbar-dialogs/new-dependency-dialog/new-dependency-dialog.component';
import { PayloadsModule } from '../payloads/payloads.module';
import { GripperSelectorComponent } from './components/dialogs/gripper-selector/gripper-selector.component';
import { CallDialogComponent } from './components/dialogs/call-dialog/call-dialog.component';
import { WhileDialogComponent } from './components/dialogs/while-dialog/while-dialog.component';
import { SleepDialogComponent } from './components/dialogs/sleep-dialog/sleep-dialog.component';
import { RobotSelectorDialogComponent } from './components/dialogs/robot-selector-dialog/robot-selector-dialog.component';
import { PalletPickerDialogComponent } from './components/dialogs/pallet-picker-dialog/pallet-picker-dialog.component';
import { PalletIndexDialogComponent } from './components/dialogs/pallet-index-dialog/pallet-index-dialog.component';
import { MoveDialogComponent } from './components/dialogs/move-dialog/move-dialog.component';
import { IfDialogComponent } from './components/dialogs/if-dialog/if-dialog.component';
import { DimDialogComponent } from './components/dialogs/dim-dialog/dim-dialog.component';
import { DelayDialogComponent } from './components/dialogs/delay-dialog/delay-dialog.component';
import { CircleDialogComponent } from './components/dialogs/circle-dialog/circle-dialog.component';
import { IoMappingModule } from './modules/io-mapping/io-mapping.module';
import { ArchSettingComponent } from './components/program-settings/arch-setting/arch-setting.component';
import { ArchSettingService } from './services/arch-setting.service';
import { Jump3DialogService } from './services/jump3-dialog.service';
import { PositionTriggerComponent } from './components/program-settings/position-trigger/position-trigger.component';
import { NewPositionTriggerComponent } from './components/program-settings/new-position-trigger/new-position-trigger.component';
import { PositionTriggerService } from './services/position-trigger.service';
import { StopDialogComponent } from './components/dialogs/stop-dialog/stop-dialog.component';
import { PayloadSelectorComponent } from './components/dialogs/payload-selector/payload-selector.component';
import { HomeSettingComponent } from './components/program-settings/home-setting/home-setting.component';
import { HomeSettingService } from './services/home-setting.service';
import { HomeDialogComponent } from './components/dialogs/home-dialog/home-dialog.component';
import { PLSSourceComponent } from './components/dialogs/pls-source/pls-source.component';
import { HomeDialogService } from './services/home-dialog.service';
import { FileTreeModule } from '../file-tree/file-tree.module';
import { ProjectDeleteDialogComponent } from './components/project-delete-dialog/project-delete-dialog.component';
// import { VisioinCommandModule } from './components/dialogs/vision-command/vision-command.module';
import { JumpxCommandComponent } from './components/combined-dialogs/components/jumpx-command/jumpx-command.component';
import { JumpxCommandService } from './components/combined-dialogs/services/jumpx-command.service';
import { VisionLoadStationBookComponent } from './components/dialogs/vision-load-station-book/vision-load-station-book.component';
import { VisionCommandComponent } from './components/combined-dialogs/components/vision-command/vision-command.component';
import { VisionCommandService } from './components/combined-dialogs/services/vision-command.service';
import { HomeScreenModule } from '../home-screen/home-screen.module';
import { FwconfigEditorComponent } from './components/fwconfig-editor/fwconfig-editor.component';
import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { TraceSelectorComponent } from './components/dialogs/trace-selector/trace-selector.component';
import { TraceService } from '../dashboard/services/trace.service';
import { ProceedDialogComponent } from './components/dialogs/proceed-dialog/proceed-dialog.component';
import { ProgramEditorMainComponent } from './components/program-editor-main/program-editor-main.component';
import { VisionComponent } from './components/vision/vision.component';
import { VisionTemplateConfigComponent } from './components/vision-template-config/vision-template-config.component';
import { VisionCalibrationComponent } from './components/vision-calibration/vision-calibration.component';
import { VisionTemplateConfigRightComponent } from './components/vision-template-config-right/vision-template-config-right.component';
import { NewDialogTemplateComponent } from './components/new-dialog-template/new-dialog-template.component';
import { VisionService } from './services/vision.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProgramEditorRouterModule,
    PalletizingModule,
    GripperScreenModule,
    PayloadsModule,
    IoMappingModule,
    FileTreeModule,
    HomeScreenModule,
    TourMatMenuModule
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
    IfDialogComponent,
    MoveDialogComponent,
    PalletIndexDialogComponent,
    PalletPickerDialogComponent,
    RobotSelectorDialogComponent,
    SleepDialogComponent,
    ArchSettingComponent,
    WhileDialogComponent,
    WhileDialogComponent,
    HomeDialogComponent,
    PLSSourceComponent,
    PositionTriggerComponent,
    NewPositionTriggerComponent,
    StopDialogComponent,
    ProceedDialogComponent,
    PayloadSelectorComponent,
    HomeSettingComponent,
    ProjectDeleteDialogComponent,
    FwconfigEditorComponent,
    JumpxCommandComponent,
    VisionLoadStationBookComponent,
    VisionCommandComponent,
    TraceSelectorComponent,
    ProgramEditorMainComponent,
    VisionComponent,
    VisionTemplateConfigComponent,
    VisionCalibrationComponent,
    VisionTemplateConfigRightComponent,
    NewDialogTemplateComponent,
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
    IfDialogComponent,
    MoveDialogComponent,
    PalletIndexDialogComponent,
    PalletPickerDialogComponent,
    RobotSelectorDialogComponent,
    SleepDialogComponent,
    WhileDialogComponent,
    HomeDialogComponent,
    PLSSourceComponent,
    PositionTriggerComponent,
    NewPositionTriggerComponent,
    StopDialogComponent,
    ProceedDialogComponent,
    PayloadSelectorComponent,
    ProjectDeleteDialogComponent,
    JumpxCommandComponent,
    VisionLoadStationBookComponent,
    VisionCommandComponent,
    TraceSelectorComponent,
    VisionComponent,
    VisionTemplateConfigComponent,
    VisionCalibrationComponent,
    VisionTemplateConfigRightComponent,
    NewDialogTemplateComponent,

  ],
  exports: [
    ProgramEditorComponent,
    JumpxCommandComponent,
    VisionLoadStationBookComponent,
    VisionCommandComponent,
  ],
  providers: [
    ProgramEditorService,
    ArchSettingService,
    Jump3DialogService,
    HomeDialogService,
    PositionTriggerService,
    HomeSettingService,
    JumpxCommandService,
    VisionCommandService,
    TraceService,
    VisionService,
  ],
})
export class ProgramEditorModule {}
