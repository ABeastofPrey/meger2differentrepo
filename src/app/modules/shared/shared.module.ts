import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialComponentsModule} from '../material-components/material-components.module';
import {AngularDraggableModule} from 'angular2-draggable';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ResizableModule} from 'angular-resizable-element';
import { AngularSplitModule } from 'angular-split';
import {YesNoDialogComponent} from '../../components/yes-no-dialog/yes-no-dialog.component';
import {NewFileDialogComponent} from '../../components/new-file-dialog/new-file-dialog.component';
import {JogSettingsDialogComponent} from '../../components/jog-settings-dialog/jog-settings-dialog.component';
import {RobotSelectorComponent} from '../tp/components/selectors/robot-selector/robot-selector.component';
import {BaseSelectorComponent} from '../tp/components/selectors/base-selector/base-selector.component';
import {DomainSelectorComponent} from '../tp/components/selectors/domain-selector/domain-selector.component';
import {FrameSelectorComponent} from '../tp/components/selectors/frame-selector/frame-selector.component';
import {MachineTableSelectorComponent} from '../tp/components/selectors/machine-table-selector/machine-table-selector.component';
import {SpeedChangerComponent} from '../tp/components/selectors/speed-changer/speed-changer.component';
import {ToolSelectorComponent} from '../tp/components/selectors/tool-selector/tool-selector.component';
import {WorkPieceSelectorComponent} from '../tp/components/selectors/work-piece-selector/work-piece-selector.component';
import {TeachVariableEditorComponent} from '../tp/components/teach-variable-editor/teach-variable-editor.component';
import {CoordinatesDisplayComponent} from '../tp/components/coordinates-display/coordinates-display.component';
import {TourMatMenuModule} from 'ngx-tour-md-menu';
import {UpdateDialogComponent} from '../../components/update-dialog/update-dialog.component';
import { ClickOutsideModule } from 'ng-click-outside';

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    AngularDraggableModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ResizableModule,
    AngularSplitModule,
    TourMatMenuModule,
    ClickOutsideModule
  ],
  exports: [
    CommonModule,
    MaterialComponentsModule,
    AngularDraggableModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ResizableModule,
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
    ClickOutsideModule
  ],
  declarations: [
    YesNoDialogComponent,
    NewFileDialogComponent,
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
    UpdateDialogComponent
  ],
  entryComponents: [YesNoDialogComponent, NewFileDialogComponent, JogSettingsDialogComponent, UpdateDialogComponent],
  schemas:[NO_ERRORS_SCHEMA]
})
export class SharedModule { }
