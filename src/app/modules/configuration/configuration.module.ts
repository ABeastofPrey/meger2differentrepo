import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { SharedModule } from '../shared/shared.module';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { DiagnosticsComponent } from './components/diagnostics/diagnostics.component';
import { RobotsComponent } from './components/robots/robots.component';
import { IoComponent } from './components/io/io.component';
import { GuiComponent } from './components/gui/gui.component';
import { UserMngrComponent } from './components/user-manager/user-mngr/user-mngr.component';
import { NewUserDialogComponent } from './components/user-manager/new-user-dialog/new-user-dialog.component';
import { GraphComponent } from './components/graph/graph.component';
import { IoService } from './services/io.service';
import { CustomIOComponent } from './components/io/custom-io/custom-io.component';
import { IoButtonComponent } from './components/io/io-button/io-button.component';
import { AboutComponent } from './components/about/about.component';
import { TopologyComponent } from './components/topology/topology.component';
import { TopologyService } from './services/topology.service';
import { PermissionGuardService } from './permission-guard.service';
import { ThirdPartyComponent } from './components/third-party/third-party.component';
import { ReferenceMasteringComponent } from './components/reference-mastering/reference-mastering.component';
import { ReferenceMasteringService } from './services/reference-mastering.service';

@NgModule({
  imports: [CommonModule, SharedModule, ConfigurationRoutingModule],
  declarations: [
    ConfigurationComponent,
    DiagnosticsComponent,
    RobotsComponent,
    IoComponent,
    GuiComponent,
    UserMngrComponent,
    NewUserDialogComponent,
    GraphComponent,
    CustomIOComponent,
    IoButtonComponent,
    AboutComponent,
    TopologyComponent,
    ThirdPartyComponent,
    ReferenceMasteringComponent
  ],
  providers: [
    IoService,
    TopologyService,
    ReferenceMasteringService,
    PermissionGuardService
  ],
  entryComponents: [
    NewUserDialogComponent,
    GraphComponent
  ]
})
export class ConfigurationModule {}
