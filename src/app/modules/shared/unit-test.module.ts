import {
  NgModule,
  NO_ERRORS_SCHEMA,
  Pipe,
  PipeTransform,
  Injectable,
} from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  TranslatePipe,
} from '@ngx-translate/core';
import { map, split, path, compose, converge, __, identity } from 'ramda';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { CommonService } from '../core/services/common.service';
import { ApiService } from '../core/services/api.service';
import { NgrxRootModule } from '../../modules/ngrx-root/ngrx-root-test.module';
import { CsTranslateLoader } from '../../control-studio-routing.module';
import { isUndefined } from 'ramda-adjunct';
import { MaterialComponentsModule } from '../material-components/material-components.module';

// tslint:disable-next-line: no-any
declare const require: any;

const TRANSLATIONS_EN = require('../../../assets/i18n/en.json');
const TRANSLATIONS_ERR_EN = require('../../../assets/i18n-causes-effects/causes-effects-en.json');
const TRANSLATIONS = { ...TRANSLATIONS_EN, ...TRANSLATIONS_ERR_EN };
const props = split('.');
const value = path(__, TRANSLATIONS);
const getVal = compose(value, props);
const httpLoaderFactory = () => new CsTranslateLoader();

@Injectable()
export class TranslateServiceStub extends TranslateService {
  get(keys: string[]): Observable<{}> {
    const res = {};
    const setRes = (key, val) => (res[key] = isUndefined(val) ? key : val);
    const getRes = converge(setRes, [identity, getVal]);
    map(getRes, keys);
    return of(res);
  }
}

@Pipe({ name: 'translate' })
export class TranslatePipeMock implements PipeTransform {
  transform(query: string) {
    return getVal(query);
  }
}

@NgModule({
  declarations: [TranslatePipeMock],
  imports: [
    NgrxRootModule,
    RouterTestingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    RouterTestingModule.withRoutes([])
  ],
  exports: [TranslateModule, TranslatePipeMock, MaterialComponentsModule, HttpClientModule],
  providers: [
    { provide: TranslateService, useClass: TranslateServiceStub },
    { provide: TranslatePipe, useClass: TranslatePipeMock },
    CommonService,
    ApiService,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [],
})
export class UnitTestModule { }
