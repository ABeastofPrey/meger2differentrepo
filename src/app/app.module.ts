import { NgModule } from '@angular/core';
import {ControlStudioComponent} from './control-studio.component';
import {SharedModule} from './modules/shared/shared.module';
import {ControlStudioRoutingModule} from './control-studio-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {MainModule} from './modules/main/main.module';
import {CoreModule} from './modules/core/core.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ServerDisconnectComponent } from './components/server-disconnect/server-disconnect.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { SuccessDialogComponent } from './components/success-dialog/success-dialog.component';
import {TourMatMenuModule} from 'ngx-tour-md-menu';
import { SingleInputDialogComponent } from './components/single-input-dialog/single-input-dialog.component';
import { AuthPassDialogComponent } from './components/auth-pass-dialog/auth-pass-dialog.component';
  
@NgModule({
  declarations: [
    ControlStudioComponent,
    PageNotFoundComponent,
    ServerDisconnectComponent,
    ErrorDialogComponent,
    SuccessDialogComponent,
    SingleInputDialogComponent,
    AuthPassDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    MainModule,
    ControlStudioRoutingModule,
    TourMatMenuModule.forRoot()
  ],
  providers: [],
  bootstrap: [ControlStudioComponent],
  entryComponents: [
    ServerDisconnectComponent,
    ErrorDialogComponent,
    SuccessDialogComponent,
    SingleInputDialogComponent,
    AuthPassDialogComponent
  ]
})
export class AppModule { }
