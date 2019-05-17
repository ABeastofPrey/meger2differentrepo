import { NgModule, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateService, TranslatePipe } from '@ngx-translate/core';
import { map, split, path, compose, converge, __, identity } from 'ramda';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { CommonService } from '../core/services/common.service';

declare const require: any;

const TRANSLATIONS_EN = require('../../../assets/i18n/en.json');
// const TRANSLATIONS_CN = require('../../../assets/i18n/cmn.json');
const props = split('.');
const value = path(__, TRANSLATIONS_EN);
const getVal = compose(value, props);
const httpLoaderFactory = (httpClient: HttpClient) => new TranslateHttpLoader(httpClient);

export class TranslateServiceStub extends TranslateService {
    public get(keys: string[]): any {
        const res = {};
        const setRes = (key, val) => res[key] = val;
        const getRes = converge(setRes, [identity, getVal]);
        map(getRes, keys);
        return of(res);
    }
}

@Pipe({ name: 'translate' })
export class TranslatePipeMock implements PipeTransform {
    public transform(query: string, ...args: any[]): any {
        return getVal(query);
    }
}

@NgModule({
    declarations: [TranslatePipeMock],
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    exports: [TranslateModule, TranslatePipeMock],
    providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
        CommonService
    ],
    schemas: [NO_ERRORS_SCHEMA],
    entryComponents: []
})
export class UnitTestModule { }
