import { MessageLogComponent } from './../../components/message-log/message-log.component';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponentsModule } from '../material-components/material-components.module';
import { AngularDraggableModule } from 'angular2-draggable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResizableModule } from 'angular-resizable-element';
import { AngularSplitModule } from 'angular-split';
import { YesNoDialogComponent } from '../../components/yes-no-dialog/yes-no-dialog.component';
import { JogSettingsDialogComponent } from '../../components/jog-settings-dialog/jog-settings-dialog.component';
import { RobotSelectorComponent } from '../tp/components/selectors/robot-selector/robot-selector.component';
import { BaseSelectorComponent } from '../tp/components/selectors/base-selector/base-selector.component';
import { DomainSelectorComponent } from '../tp/components/selectors/domain-selector/domain-selector.component';
import { FrameSelectorComponent } from '../tp/components/selectors/frame-selector/frame-selector.component';
import { MachineTableSelectorComponent } from '../tp/components/selectors/machine-table-selector/machine-table-selector.component';
import { SpeedChangerComponent } from '../tp/components/selectors/speed-changer/speed-changer.component';
import { ToolSelectorComponent } from '../tp/components/selectors/tool-selector/tool-selector.component';
import { WorkPieceSelectorComponent } from '../tp/components/selectors/work-piece-selector/work-piece-selector.component';
import { TeachVariableEditorComponent } from '../tp/components/teach-variable-editor/teach-variable-editor.component';
import { CoordinatesDisplayComponent } from '../tp/components/coordinates-display/coordinates-display.component';
import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { UpdateDialogComponent } from '../../components/update-dialog/update-dialog.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { TranslateModule } from '@ngx-translate/core';
import {
  KeyboardDirective,
  KeyboardDialog,
} from '../virtual-keyboard/keyboard.directive';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { IoSelectorDialogComponent } from '../../components/io-selector-dialog/io-selector-dialog.component';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { ControlStudioGestureConfig } from './cs-gesture-config';
import { ClickOnceDirective } from '../../directives/click-once.directive';
import { NumberDirective } from '../../directives/number.directive';
import { PassPipe } from '../core/pipes/space-to-nbsp.pipe';
import { RichSelectComponent } from '../../components/rich-select/rich-select.component';
import { ColorfulSpanComponent } from '../../components/rich-select/colorful-span/colorful-span.component';
import { NumberInputComponent } from '../../components/number-input/number-input.component';
import { CSProgressComponent } from '../../components/progress/progress.component';
import { VariableInputComponent } from '../../components/variable-input/variable-input.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoordinatesComponent } from '../main/components/coordinates/coordinates.component';
import { RecordDialogComponent } from '../../components/record-dialog/record-dialog.component';
import { RecordGraphComponent } from '../../components/record-graph/record-graph.component';
import { NotificationWindowComponent } from '../main/components/notification-window/notification-window.component';
import { ExternalGraphDialogComponent } from '../dashboard/components/external-graph-dialog/external-graph-dialog.component';
import { DropDownAddComponent } from '../../components/drop-down-add/drop-down-add.component';
import { TraceNewComponent } from '../dashboard/components/trace/trace-new/trace-new.component';
import { IpAddressComponent } from '../../components/ip-address/ip-address.component';
import { IpFormFieldComponent } from '../../components/ip-form-field/ip-form-field.component';
import { CustomKeyBoardComponent } from '../custom-key-board/custom-key-board.component';
import { CustomKeyBoardDialogComponent } from '../custom-key-board-dialog/custom-key-board-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    AngularDraggableModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ResizableModule,
    AngularSplitModule.forRoot(),
    TourMatMenuModule,
    ClickOutsideModule,
    TranslateModule,
    NgScrollbarModule,
    ScrollingModule,
  ],
  exports: [
    CommonModule,
    MaterialComponentsModule,
    AngularDraggableModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ResizableModule,
    ScrollingModule,
    AngularSplitModule,
    YesNoDialogComponent,
    JogSettingsDialogComponent,
    RobotSelectorComponent,
    BaseSelectorComponent,
    DomainSelectorComponent,
    FrameSelectorComponent,
    MachineTableSelectorComponent,
    SpeedChangerComponent,
    ToolSelectorComponent,
    WorkPieceSelectorComponent,
    TeachVariableEditorComponent,
    CoordinatesDisplayComponent,
    UpdateDialogComponent,
    TourMatMenuModule,
    ClickOutsideModule,
    TranslateModule,
    KeyboardDirective,
    NgScrollbarModule,
    IoSelectorDialogComponent,
    ClickOnceDirective,
    NumberDirective,
    RichSelectComponent,
    NumberInputComponent,
    CSProgressComponent,
    VariableInputComponent,
    ColorfulSpanComponent,
    CoordinatesComponent,
    RecordGraphComponent,
    NotificationWindowComponent,
    ExternalGraphDialogComponent,
    MessageLogComponent,
    DropDownAddComponent,
    TraceNewComponent,
    IpAddressComponent,
    IpFormFieldComponent,
    CustomKeyBoardComponent,
    CustomKeyBoardDialogComponent
  ],
  declarations: [
    YesNoDialogComponent,
    JogSettingsDialogComponent,
    RobotSelectorComponent,
    BaseSelectorComponent,
    DomainSelectorComponent,
    FrameSelectorComponent,
    MachineTableSelectorComponent,
    SpeedChangerComponent,
    ToolSelectorComponent,
    WorkPieceSelectorComponent,
    TeachVariableEditorComponent,
    CoordinatesDisplayComponent,
    UpdateDialogComponent,
    KeyboardDirective,
    KeyboardDialog,
    IoSelectorDialogComponent,
    ClickOnceDirective,
    NumberDirective,
    PassPipe,
    RichSelectComponent,
    NumberInputComponent,
    CSProgressComponent,
    VariableInputComponent,
    ColorfulSpanComponent,
    CoordinatesComponent,
    RecordDialogComponent,
    RecordGraphComponent,
    NotificationWindowComponent,
    ExternalGraphDialogComponent,
    MessageLogComponent,
    DropDownAddComponent,
    TraceNewComponent,
    IpAddressComponent,
    IpFormFieldComponent,
    CustomKeyBoardComponent,
    CustomKeyBoardDialogComponent
  ],
  entryComponents: [
    YesNoDialogComponent,
    JogSettingsDialogComponent,
    UpdateDialogComponent,
    IoSelectorDialogComponent,
    KeyboardDialog,
    RichSelectComponent,
    NumberInputComponent,
    CSProgressComponent,
    VariableInputComponent,
    ColorfulSpanComponent,
    RecordDialogComponent,
    RecordGraphComponent,
    ExternalGraphDialogComponent,
    DropDownAddComponent,
    TraceNewComponent,
    IpAddressComponent,
    IpFormFieldComponent,
    CustomKeyBoardDialogComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: ControlStudioGestureConfig,
    },
  ],
})
export class SharedModule { }
