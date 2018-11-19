import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {TourService} from 'ngx-tour-md-menu';
import {PreloadSelectedModulesList} from './modules/core/strategies/preload.strategy';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: './modules/login/login.module#LoginModule'
  },
  {
    path: '',
    loadChildren: './modules/main/main.module#MainModule'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
      {
        //preloadingStrategy: PreloadSelectedModulesList
      }
    )
  ],
  exports: [RouterModule],
  providers: [TourService, PreloadSelectedModulesList]
})
export class ControlStudioRoutingModule { }