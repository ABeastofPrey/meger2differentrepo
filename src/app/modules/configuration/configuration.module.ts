import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import {SharedModule} from '../shared/shared.module';
import {ConfigurationRoutingModule} from './configuration-routing.module';
import { DiagnosticsComponent } from './components/diagnostics/diagnostics.component';
import { RobotsComponent } from './components/robots/robots.component';
import { IoComponent } from './components/io/io.component';
import { GuiComponent } from './components/gui/gui.component';
import {UserMngrComponent} from './components/user-manager/user-mngr/user-mngr.component';
import {NewUserDialogComponent} from './components/user-manager/new-user-dialog/new-user-dialog.component';
import {GraphComponent} from './components/graph/graph.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ConfigurationRoutingModule
  ],
  declarations: [
    ConfigurationComponent,
    DiagnosticsComponent,
    RobotsComponent,
    IoComponent,
    GuiComponent,
    UserMngrComponent,
    NewUserDialogComponent,
    GraphComponent
  ],
  entryComponents: [
    NewUserDialogComponent,
    GraphComponent
  ]
})
export class ConfigurationModule { }
