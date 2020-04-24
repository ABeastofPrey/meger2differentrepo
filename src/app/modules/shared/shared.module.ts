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
import { PassPipe } from '../core/pipes/space-to-nbsp.pipe';
import { RichSelectComponent } from '../../components/rich-select/rich-select.component';
import { ColorfulSpanComponent } from '../../components/rich-select/colorful-span/colorful-span.component';
import { NumberInputComponent } from '../../components/number-input/number-input.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoordinatesComponent } from '../main/components/coordinates/coordinates.component';
import { RecordDialogComponent } from '../../components/record-dialog/record-dialog.component';
import { RecordGraphComponent } from '../../components/record-graph/record-graph.component';
import { NotificationWindowComponent } from '../main/components/notification-window/notification-window.component';
import { ExternalGraphDialogComponent } from '../dashboard/components/external-graph-dialog/external-graph-dialog.component';

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
    RichSelectComponent,
    NumberInputComponent,
    ColorfulSpanComponent,
    CoordinatesComponent,
    RecordGraphComponent,
    NotificationWindowComponent,
    ExternalGraphDialogComponent,
    MessageLogComponent
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
    PassPipe,
    RichSelectComponent,
    NumberInputComponent,
    ColorfulSpanComponent,
    CoordinatesComponent,
    RecordDialogComponent,
    RecordGraphComponent,
    NotificationWindowComponent,
    ExternalGraphDialogComponent,
    MessageLogComponent,
  ],
  entryComponents: [
    YesNoDialogComponent,
    JogSettingsDialogComponent,
    UpdateDialogComponent,
    IoSelectorDialogComponent,
    KeyboardDialog,
    RichSelectComponent,
    NumberInputComponent,
    ColorfulSpanComponent,
    RecordDialogComponent,
    RecordGraphComponent,
    ExternalGraphDialogComponent,
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
