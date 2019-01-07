import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ApiService} from './services/api.service';
import {GroupManagerService} from './services/group-manager.service';
import {LoginService} from './services/login.service';
import {NotificationService} from './services/notification.service';
import {TaskService} from './services/task.service';
import {WatchService} from './services/watch.service';
import {WebsocketService} from './services/websocket.service';
import {ScreenManagerService} from './services/screen-manager.service';
import {JwtService} from './services/jwt.service';
import {AuthGuard} from './services/auth-guard.service';
import {HttpTokenInterceptor} from './interceptors/http-token-interceptor.service';
import {DataService} from './services/data.service';
import {CoordinatesService} from './services/coordinates.service';
import {TpStatService} from './services/tp-stat.service';
import {LeadByNoseServiceService} from './services/lead-by-nose-service.service';
import {TeachService} from './services/teach.service';
import {ProjectManagerService} from './services/project-manager.service';
import {UtilsService} from './services/utils.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    ApiService,
    GroupManagerService,
    LoginService,
    NotificationService,
    TaskService,
    WatchService,
    WebsocketService,
    ScreenManagerService,
    JwtService,
    AuthGuard,
    DataService,
    CoordinatesService,
    TpStatService,
    LeadByNoseServiceService,
    TeachService,
    ProjectManagerService,
    UtilsService
  ]
})
export class CoreModule { }
