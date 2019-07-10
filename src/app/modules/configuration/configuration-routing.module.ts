import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { DiagnosticsComponent } from './components/diagnostics/diagnostics.component';
import { RobotsComponent } from './components/robots/robots.component';
import { IoComponent } from './components/io/io.component';
import { GuiComponent } from './components/gui/gui.component';
import { UserMngrComponent } from './components/user-manager/user-mngr/user-mngr.component';
import { AboutComponent } from './components/about/about.component';
import { TopologyComponent } from './components/topology/topology.component';
import { PermissionGuardService as PermissionGuard } from './permission-guard.service';
import { ThirdPartyComponent } from './components/third-party/third-party.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {
        path: '',
        redirectTo: 'about',
      },
      {
        path: 'about',
        component: AboutComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 99,
        },
      },
      {
        path: 'diagnostics',
        component: DiagnosticsComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 99,
        },
      },
      {
        path: 'robots',
        component: RobotsComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 0,
        },
      },
      {
        path: 'io',
        component: IoComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 99,
        },
      },
      {
        path: 'topology',
        component: TopologyComponent,
        data: {
          permission: 99,
        },
      },
      {
        path: 'gui-settings',
        component: GuiComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 99,
        },
      },
      {
        path: 'users',
        component: UserMngrComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 99,
        },
      },
      {
        path: '3rd-party',
        component: ThirdPartyComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 99,
        },
      },
      {
        path: '**',
        redirectTo: 'about',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigurationRoutingModule {}
