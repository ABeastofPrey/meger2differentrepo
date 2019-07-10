import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TourService } from 'ngx-tour-md-menu';
import { PreloadSelectedModulesList } from './modules/core/strategies/preload.strategy';
import { AuthGuard } from './modules/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/login/login.module').then(m => m.LoginModule),
    data: { preload: true },
  },
  {
    path: '',
    loadChildren: () =>
      import('./modules/main/main.module').then(m => m.MainModule),
    canActivate: [AuthGuard],
    data: { preload: true },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadSelectedModulesList,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [RouterModule],
  providers: [TourService, PreloadSelectedModulesList],
})
export class ControlStudioRoutingModule {}
