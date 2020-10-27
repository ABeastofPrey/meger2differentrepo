import { TourModule } from './../tour/tour.module';
import { NgModule } from '@angular/core';
import { MainComponent } from './components/main/main.component';
import { SharedModule } from '../shared/shared.module';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { WatchWindowComponent } from './components/watch-window/watch-window.component';
import { MainRoutingModule } from './main-routing.module';
import { MainAuthResolver } from './main-auth-resolver.service';
import { TerminalWindowComponent } from './components/terminal-window/terminal-window.component';
import { HomeScreenModule } from '../home-screen/home-screen.module';
import { ProgramEditorModule } from '../program-editor/program-editor.module';
import { PermissionGuardService } from '../configuration/permission-guard.service';
import { GraphDerivativeComponent } from '../../components/graph-derivative/graph-derivative.component';
import { FileSelectorDialogComponent } from '../../components/file-selector-dialog/file-selector-dialog.component';
import { StxsimNgModule } from 'stxsim-ng';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { MaintenanceArmModule } from '../maintenance-arm/maintenance-arm.module';
import { SystemLogModule } from '../sys-log/sys-log.module';

@NgModule({
  imports: [
    SharedModule,
    MainRoutingModule,
    HomeScreenModule,
    ProgramEditorModule,
    StxsimNgModule,
    ScrollingModule,
    TourModule,
    TourMatMenuModule,
    MaintenanceArmModule,
    SystemLogModule
  ],
  declarations: [
    MainComponent,
    MainMenuComponent,
    WatchWindowComponent,
    TerminalWindowComponent,
    GraphDerivativeComponent,
    FileSelectorDialogComponent,
  ],
  providers: [MainAuthResolver, PermissionGuardService],
  entryComponents: [
    GraphDerivativeComponent,
    FileSelectorDialogComponent,
  ],
})
export class MainModule { }
