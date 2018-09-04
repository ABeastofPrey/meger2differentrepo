import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ConfigurationComponent} from './components/configuration/configuration.component';
import {DiagnosticsComponent} from './components/diagnostics/diagnostics.component';
import {RobotsComponent} from './components/robots/robots.component';
import {IoComponent} from './components/io/io.component';
import {GuiComponent} from './components/gui/gui.component';
import {UserMngrComponent} from './components/user-manager/user-mngr/user-mngr.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {
        path: '',
        redirectTo: 'diagnostics'
      },
      {
        path: 'diagnostics',
        component: DiagnosticsComponent
      },
      {
        path: 'robots',
        component: RobotsComponent
      },
      {
        path: 'io',
        component: IoComponent
      },
      {
        path: 'gui-settings',
        component: GuiComponent
      },
      {
        path: 'users',
        component: UserMngrComponent
      },
      {
        path: '**',
        redirectTo: 'diagnostics'
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
