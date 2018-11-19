import { NgModule } from '@angular/core';
import {Routes} from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {RouterModule} from '@angular/router';
import {MainAuthResolver} from './main-auth-resolver.service';
import {AuthGuard} from '../core';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    resolve: {
      isAuthenticated: MainAuthResolver
    },
    children: [
      {
        path: '',
        loadChildren: '../home-screen/home-screen.module#HomeScreenModule'
      },
      {
        path: 'dashboard',
        loadChildren: '../dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'projects',
        loadChildren: '../program-editor/program-editor.module#ProgramEditorModule',
        data: {preload: true}
      },
      {
        path: 'simulator',
        loadChildren: '../simulator/simulator.module#SimulatorModule'
      },
      {
        path: 'teach',
        loadChildren: '../tp/tp.module#TpModule'
      },
      {
        path: 'configuration',
        loadChildren: '../configuration/configuration.module#ConfigurationModule'
      },
      {
        path: 'files',
        loadChildren: '../file-manager/file-manager.module#FileManagerModule'
      },
      {
        path: 'tasks',
        loadChildren: '../task-manager/task-manager.module#TaskManagerModule'
      },
      {
        path: 'tools',
        loadChildren: '../tools/tools.module#ToolsModule'
      },
      {
        path: 'errors',
        loadChildren: '../error-history/error-history.module#ErrorHistoryModule'
      },
      {
        path: 'log',
        loadChildren: '../log-screen/log-screen.module#LogScreenModule'
      },
      {
        path: 'help',
        loadChildren: '../help/help.module#HelpModule'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MainRoutingModule { }
