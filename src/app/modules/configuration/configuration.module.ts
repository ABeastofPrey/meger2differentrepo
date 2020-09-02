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
import { VersionComponent } from './components/version/version.component';
import { ReleaseNoteComponent } from './components/version/release-note/release-note.component';
import { AxisVordComponent } from './components/axis-vord/axis-vord.component';
import { BrakeTestComponent } from './components/brake-test/brake-test.component';
import { SafetyConfiguratorModule } from '../safety-configurator/safety-configurator.module';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { MaintenanceInputComponent } from './components/maintenance-input/maintenance-input.component';
import { MaintenanceHistoryComponent } from './components/maintenance-history/maintenance-history.component';
import { MaintenanceInformationComponent } from './components/maintenance-information/maintenance-information.component';
import { MaintenanceService } from './services/maintenance.service';
import { PluginManageComponent } from './components/plugin-manage/plugin-manage.component';
import { PluginManageService } from './services/plugin.manage.service';
import { PluginManagePopComponent } from './components/plugin-manage-pop/plugin-manage-pop.component';
import { PluginManagePopService } from './services/plugin.manage.pop.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ConfigurationRoutingModule,
    SafetyConfiguratorModule
  ],
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
    ReferenceMasteringComponent,
    VersionComponent,
    ReleaseNoteComponent,
    AxisVordComponent,
    BrakeTestComponent,
    MaintenanceComponent,
    MaintenanceInputComponent,
    MaintenanceHistoryComponent,
    MaintenanceInformationComponent,
    PluginManageComponent,
    PluginManagePopComponent,
  ],
  providers: [
    IoService,
    TopologyService,
    ReferenceMasteringService,
    PermissionGuardService,
    MaintenanceService,
    PluginManageService,
    PluginManagePopService
  ],
  entryComponents: [
    NewUserDialogComponent,
    GraphComponent,
    ReleaseNoteComponent,
    PluginManagePopComponent,
  ],
})
export class ConfigurationModule {}
