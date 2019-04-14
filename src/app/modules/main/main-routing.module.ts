import { NgModule } from '@angular/core';
import {Routes} from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {RouterModule} from '@angular/router';
import {MainAuthResolver} from './main-auth-resolver.service';
import {ProgramEditorComponent} from '../program-editor/components/program-editor/program-editor.component';
import {HomeScreenComponent} from '../home-screen/components/home-screen/home-screen.component';
import {PermissionGuardService} from '../configuration/permission-guard.service';

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
        component: HomeScreenComponent,
        canActivate: [PermissionGuardService],
        data: { permission: 99 }
      },
      {
        path: 'dashboard',
        loadChildren: '../dashboard/dashboard.module#DashboardModule',
        canActivate: [PermissionGuardService],
        data: { permission: 99 }
      },
      {
        path: 'projects',
        component: ProgramEditorComponent,
        canActivate: [PermissionGuardService],
        data: { permission: 99 }
      },
      {
        path: 'simulator',
        loadChildren: '../simulator/simulator.module#SimulatorModule',
        canActivate: [PermissionGuardService],
        data: { permission: 1 }
      },
      {
        path: 'teach',
        loadChildren: '../tp/tp.module#TpModule',
        canActivate: [PermissionGuardService],
        data: { permission: 99 }
      },
      {
        path: 'configuration',
        loadChildren: '../configuration/configuration.module#ConfigurationModule',
        canActivate: [PermissionGuardService],
        data: { permission: 99 }
      },
      {
        path: 'tasks',
        loadChildren: '../task-manager/task-manager.module#TaskManagerModule',
        canActivate: [PermissionGuardService],
        data: { permission: 1 }
      },
      {
        path: 'tools',
        loadChildren: '../tools/tools.module#ToolsModule',
        canActivate: [PermissionGuardService],
        data: { permission: 1 }
      },
      {
        path: 'errors',
        loadChildren: '../error-history/error-history.module#ErrorHistoryModule',
        canActivate: [PermissionGuardService],
        data: { permission: 99 }
      },
      {
        path: 'log',
        loadChildren: '../log-screen/log-screen.module#LogScreenModule',
        canActivate: [PermissionGuardService],
        data: { permission: 1 }
      },
      {
        path: 'help',
        loadChildren: '../help/help.module#HelpModule',
        canActivate: [PermissionGuardService],
        data: { permission: 99 }
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
