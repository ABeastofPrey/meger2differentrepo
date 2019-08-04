import { NgModule } from '@angular/core';
import { MainComponent } from './components/main/main.component';
import { SharedModule } from '../shared/shared.module';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { NotificationWindowComponent } from './components/notification-window/notification-window.component';
import { WatchWindowComponent } from './components/watch-window/watch-window.component';
import { MainRoutingModule } from './main-routing.module';
import { MainAuthResolver } from './main-auth-resolver.service';
import { TerminalWindowComponent } from './components/terminal-window/terminal-window.component';
import { HomeScreenModule } from '../home-screen/home-screen.module';
import { ProgramEditorModule } from '../program-editor/program-editor.module';
import { PermissionGuardService } from '../configuration/permission-guard.service';
import { RecordGraphComponent } from '../../components/record-graph/record-graph.component';
import { GraphDerivativeComponent } from '../../components/graph-derivative/graph-derivative.component';
import { FileSelectorDialogComponent } from '../../components/file-selector-dialog/file-selector-dialog.component';
import { StxsimNgModule } from 'stxsim-ng';

@NgModule({
  imports: [
    SharedModule,
    MainRoutingModule,
    HomeScreenModule,
    ProgramEditorModule,
    StxsimNgModule,
  ],
  declarations: [
    MainComponent,
    MainMenuComponent,
    NotificationWindowComponent,
    WatchWindowComponent,
    TerminalWindowComponent,
    RecordGraphComponent,
    GraphDerivativeComponent,
    FileSelectorDialogComponent,
  ],
  providers: [MainAuthResolver, PermissionGuardService],
  entryComponents: [
    RecordGraphComponent,
    GraphDerivativeComponent,
    FileSelectorDialogComponent,
  ],
})
export class MainModule {}
