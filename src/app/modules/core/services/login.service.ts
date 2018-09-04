import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {WebsocketService, MCQueryResponse} from './websocket.service';
import {ReplaySubject, BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {JwtService} from './jwt.service';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {User} from '../models/user.model';

@Injectable()
export class LoginService {
  
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
  
  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();
  
  private _port: string = null;
  get port() {
    return this._port;
  }

  get fName() : string {
    if (this.getCurrentUser().user) {
      const fullName = this.getCurrentUser().user.fullName;
      const i = fullName.indexOf(' ');
      return fullName.substring(0,i);
    }
    return null;
  }
  get permission() : string {
    if (this.getCurrentUser().user)
      return this.api.getUserPermission(this.getCurrentUser().user.permission);
    return null;
  }
  
  populate() {
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.api.get('/cs/api/user')
      .subscribe(
        user => this.setAuth(user),
        err => this.purgeAuth()
      );
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }
  
  setAuth(user: User) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
    if (!this.ws.connected)
      this.ws.connect();
  }
  
  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }
  
  attemptAuth(credentials): Observable<User> {
    return this.api.post('/cs/api/users',{user: credentials})
      .pipe(map(
      (data) => {
        this.setAuth(data);
        return data;
      }
    ));
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }
  
  logout(serverDisconnected?: boolean) {
    if (!this.jwtService.getToken())
      return;
    if (!serverDisconnected)
      this.ws.reset();
    const params = serverDisconnected ? {serverDisconnected:'true'} : {};
    this.router.navigate(['/login'], {queryParams: params});
    this.purgeAuth();
  }

  constructor(
    private api : ApiService,
    private ws : WebsocketService,
    private router: Router,
    private jwtService: JwtService
  ) {
    this.ws.isConnected.subscribe(stat=>{
      if (stat) {
          this.ws.query('java_port').then((ret:MCQueryResponse)=>{
            this._port = ret.result;
          });
      } else if (this.port && !this.ws.updateFirmwareMode) {
        this.logout(true);
      }
    });
  }

}
