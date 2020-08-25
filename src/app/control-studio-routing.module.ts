import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TourService } from 'ngx-tour-md-menu';
import { PreloadSelectedModulesList } from './modules/core/strategies/preload.strategy';
import { AuthGuard } from './modules/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { from, Observable, combineLatest } from 'rxjs';
import { map as rxjsMap } from 'rxjs/operators';
import { ApiService } from './modules/core/services/api.service';
import { parsePluginI18n } from './modules/plugins/plugins.service';
import { mergeDeepRight } from 'ramda';
export class CsTranslateLoader implements TranslateLoader {

  constructor(private apiService: ApiService) { }

  getTranslation(lang: string): Observable<any> {
    const fromI18n = from(import(`../assets/i18n/${lang}.json`));
    const fromECodeI18n = from(import(`../assets/i18n-causes-effects/causes-effects-${lang}.json`));
    const fromLibI18n = from(this.apiService.getFile(`LIB_${lang.toUpperCase()}.JSON`));
    const fromPluginI18n = from(this.apiService.getFile('PLUG_TRANS.DAT'));
    const combinedI18n = combineLatest([fromI18n, fromECodeI18n, fromLibI18n, fromPluginI18n])
      .pipe(rxjsMap(([resI18n, resECI18n, resLibI18n, resPluginI18n]) => {
        resI18n['err_code'] = resECI18n['err_code'];
        try {
          resI18n['lib_code'] = JSON.parse(resLibI18n)['lib_code'];
          //merge plugin translate file
          resI18n['lib_code'] = mergeDeepRight(resI18n['lib_code'], parsePluginI18n(resPluginI18n, lang));

        } catch (err) {
          console.log('Get lib code translation file failed.');
        }
        return resI18n;
      }));
    return combinedI18n;
  }




}

export function csLoaderFactory(apiService: ApiService) {
  return new CsTranslateLoader(apiService);
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
        deps: [ApiService],
      },
    }),
  ],
  exports: [RouterModule],
  providers: [TourService, PreloadSelectedModulesList],
})
export class ControlStudioRoutingModule { }
