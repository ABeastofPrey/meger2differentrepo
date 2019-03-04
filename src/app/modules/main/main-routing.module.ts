import { NgModule } from '@angular/core';
import {Routes} from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {RouterModule} from '@angular/router';
import {MainAuthResolver} from './main-auth-resolver.service';
import {ProgramEditorComponent} from '../program-editor/components/program-editor/program-editor.component';
import {HomeScreenComponent} from '../home-screen/components/home-screen/home-screen.component';

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
        component: HomeScreenComponent
      },
      {
        path: 'dashboard',
        loadChildren: '../dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'projects',
        component: ProgramEditorComponent
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
