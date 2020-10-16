import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { RouterModule } from '@angular/router';
import { MainAuthResolver } from './main-auth-resolver.service';
import { ProgramEditorComponent } from '../program-editor/components/program-editor/program-editor.component';
import { HomeScreenComponent } from '../home-screen/components/home-screen/home-screen.component';
import { PermissionGuardService } from '../configuration/permission-guard.service';
import { LogBookComponent } from '../sys-log/components/logbook/logbook.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        component: HomeScreenComponent,
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
        resolve: {
          isAuthenticated: MainAuthResolver,
        },
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('../program-editor/program-editor.module').then(m => m.ProgramEditorModule),
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
      },
      {
        path: 'simulator',
        loadChildren: () =>
          import('../simulator/simulator.module').then(m => m.SimulatorModule),
        canActivate: [PermissionGuardService],
        data: { permission: 1, requiresTP: true },
      },
      {
        path: 'teach',
        loadChildren: () => import('../tp/tp.module').then(m => m.TpModule),
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
      },
      {
        path: 'configuration',
        loadChildren: () =>
          import('../configuration/configuration.module').then(
            m => m.ConfigurationModule
          ),
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('../task-manager/task-manager.module').then(
            m => m.TaskManagerModule
          ),
        canActivate: [PermissionGuardService],
        data: { permission: 1 },
      },
      {
        path: 'tools',
        loadChildren: () =>
          import('../tools/tools.module').then(m => m.ToolsModule),
        canActivate: [PermissionGuardService],
        data: { permission: 1 },
      },
      {
        path: 'errors',
        loadChildren: () =>
          import('../error-history/error-history.module').then(
            m => m.ErrorHistoryModule
          ),
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
      },
      {
        path: 'log',
        loadChildren: () =>
          import('../log-screen/log-screen.module').then(
            m => m.LogScreenModule
          ),
        canActivate: [PermissionGuardService],
        data: { permission: 1 },
      },
      {
        path: 'logbook',
        // loadChildren: () =>
        //   import('../sys-log/sys-log.module').then(
        //     m => m.SystemLogModule
        //   ),
        component: LogBookComponent,
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
      },{
        path: 'help',
        loadChildren: () =>
          import('../help/help.module').then(m => m.HelpModule),
        canActivate: [PermissionGuardService],
        data: { permission: 99 },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
