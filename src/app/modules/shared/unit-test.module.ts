import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateStore } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
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
    providers: [TranslateStore],
    entryComponents: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class UnitTestModule { }
