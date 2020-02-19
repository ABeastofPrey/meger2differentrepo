import { NgModule } from '@angular/core';
import { ControlStudioComponent } from './control-studio.component';
import { SharedModule } from './modules/shared/shared.module';
import { ControlStudioRoutingModule } from './control-studio-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, EventManager } from '@angular/platform-browser';
import { MainModule } from './modules/main/main.module';
import { CoreModule } from './modules/core/core.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ServerDisconnectComponent } from './components/server-disconnect/server-disconnect.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { SuccessDialogComponent } from './components/success-dialog/success-dialog.component';
import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { SingleInputDialogComponent } from './components/single-input-dialog/single-input-dialog.component';
import { AuthPassDialogComponent } from './components/auth-pass-dialog/auth-pass-dialog.component';
import { LicenseDialogComponent } from './components/license-dialog/license-dialog.component';
import { TpDialogComponent } from './components/tp-dialog/tp-dialog.component';
import { RobotSelectionComponent } from './components/robot-selection/robot-selection.component';
import { OSUpgradeErrorDialogComponent } from './components/osupgrade-error-dialog/osupgrade-error-dialog.component';
import { OSUpgradeSuccessDialogComponent } from './components/osupgrade-success-dialog/osupgrade-success-dialog.component';
import { TpLoadingComponent } from './components/tp-loading/tp-loading.component';
import { CustomEventManager } from './modules/core/strategies/listener-outside-angular.strategy';
import { NgrxRootModule } from './modules/ngrx-root/ngrx-root.module';

@NgModule({
  declarations: [
    ControlStudioComponent,
    PageNotFoundComponent,
    ServerDisconnectComponent,
    ErrorDialogComponent,
    SuccessDialogComponent,
    SingleInputDialogComponent,
    AuthPassDialogComponent,
    LicenseDialogComponent,
    TpDialogComponent,
    RobotSelectionComponent,
    OSUpgradeErrorDialogComponent,
    OSUpgradeSuccessDialogComponent,
    TpLoadingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    MainModule,
    ControlStudioRoutingModule,
    TourMatMenuModule.forRoot(),
    NgrxRootModule,
  ],
  bootstrap: [ControlStudioComponent],
  entryComponents: [
    ServerDisconnectComponent,
    ErrorDialogComponent,
    SuccessDialogComponent,
    SingleInputDialogComponent,
    AuthPassDialogComponent,
    LicenseDialogComponent,
    TpDialogComponent,
    RobotSelectionComponent,
    OSUpgradeErrorDialogComponent,
    OSUpgradeSuccessDialogComponent,
    TpLoadingComponent,
  ],
  providers: [{ provide: EventManager, useClass: CustomEventManager }],
})
export class AppModule {}
