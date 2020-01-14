import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EntityDataModule } from '@ngrx/data';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { metaReducers, effectsList, reducerToken, reducerProvider } from './ngrx-root.reducers';
import { environment } from '../../../environments/environment';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        StoreModule.forRoot(reducerToken, {
            metaReducers,
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictActionSerializability: true,
                strictStateSerializability: true
            }
        }),
        EntityDataModule,
        EffectsModule.forRoot(effectsList),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    ],
    exports: [],
    providers: [reducerProvider],
})
export class NgrxRootModule { }