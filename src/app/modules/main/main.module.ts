import { NgModule } from '@angular/core';
import { MainComponent } from './components/main/main.component';
import {SharedModule} from '../shared/shared.module';
import {MainMenuComponent} from './components/main-menu/main-menu.component';
import {NotificationWindowComponent} from './components/notification-window/notification-window.component';
import {WatchWindowComponent} from './components/watch-window/watch-window.component';
import {MainRoutingModule} from './main-routing.module';
import {MainAuthResolver} from './main-auth-resolver.service';

@NgModule({
  imports: [
    SharedModule,
    MainRoutingModule
  ],
  declarations: [
    MainComponent,
    MainMenuComponent,
    NotificationWindowComponent,
    WatchWindowComponent
  ],
  providers: [MainAuthResolver]
})
export class MainModule { }
