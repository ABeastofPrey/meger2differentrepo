import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { map, split, path, compose, converge, __, identity } from 'ramda';
import { of } from 'rxjs';

declare const require: any;

const TRANSLATIONS_EN = require('../../../assets/i18n/en.json');
// const TRANSLATIONS_CN = require('../../../assets/i18n/cmn.json');

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient);
}

export class TranslateServiceStub extends TranslateService {
    public get(keys: string[]): any {
        const res = {};
        const props = split('.');
        const value = path(__, TRANSLATIONS_EN);
        const getVal = compose(value, props);
        const setRes = (key, val) => res[key] = val;
        const getRes = converge(setRes, [identity, getVal]);
        map(getRes, keys);
        return of(res);
    }
}

@NgModule({
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    exports: [TranslateModule],
    declarations: [],
    providers: [{ provide: TranslateService, useClass: TranslateServiceStub }],
    entryComponents: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class UnitTestModule { }
