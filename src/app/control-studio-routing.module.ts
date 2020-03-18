import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TourService } from 'ngx-tour-md-menu';
import { PreloadSelectedModulesList } from './modules/core/strategies/preload.strategy';
import { AuthGuard } from './modules/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, combineLatest } from 'rxjs';
import { map as rxjsMap } from 'rxjs/operators';

export class CsTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const fromI18n = from(import(`../assets/i18n/${lang}.json`));
    const fromECodeI18n = from(import(`../assets/i18n-causes-effects/causes-effects-${lang}.json`));
    const fromLibI18n = from(import(`../assets/i18n-lib/lib-${lang}.json`));
    const combinedI18n = combineLatest([fromI18n, fromECodeI18n, fromLibI18n])
      .pipe(rxjsMap(([resI18n, resECI18n, resLibI18n]) => {
        resI18n['err_code'] = resECI18n['err_code'];
        resI18n['lib_code'] = resLibI18n['lib_code'];
        return resI18n;
      }));
    return combinedI18n;
  }
}

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/');
// }

export function csLoaderFactory() {
  return new CsTranslateLoader();
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
        useFactory: csLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [RouterModule],
  providers: [TourService, PreloadSelectedModulesList],
})
export class ControlStudioRoutingModule {}
