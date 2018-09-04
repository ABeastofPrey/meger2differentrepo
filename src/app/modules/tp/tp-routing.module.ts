import { NgModule } from '@angular/core';
import {TpComponent} from './tp.component';
import {Routes, RouterModule} from '@angular/router';
import {LeadByNoseScreenComponent} from './components/lead-by-nose-screen/lead-by-nose-screen.component';
import {JogScreenComponent} from './components/jogscreen/jogscreen.component';

const routes: Routes = [
  {
    path: '',
    component: TpComponent,
    children: [
      {
        path: '',
        redirectTo: 'jog'
      },
      {
        path: 'lbn',
        component: LeadByNoseScreenComponent
      },
      {
        path: 'jog',
        component: JogScreenComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TpRoutingModule { }
