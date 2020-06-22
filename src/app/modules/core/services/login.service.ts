import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { ReplaySubject, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { JwtService } from './jwt.service';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { LicenseDialogComponent } from '../../../components/license-dialog/license-dialog.component';
import { MatDialog, MatSnackBar } from '@angular/material';

@Injectable()
export class LoginService {

  private currentUserSubject = new BehaviorSubject<User>({} as User);
  currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  isAuthenticated = this.isAuthenticatedSubject.asObservable();

  get fName(): string {
    if (this.getCurrentUser().user) {
      const fullName = this.getCurrentUser().user.fullName;
      const i = fullName.indexOf(' ');
      return i > -1 ? fullName.substring(0, i) : fullName;
    }
    return null;
  }
  get permission(): string {
    if (this.getCurrentUser().user) {
      return this.api.getUserPermission(this.getCurrentUser().user.permission);
    }
    return null;
  }

  get permissionCode(): number {
    if (this.getCurrentUser().user) {
      return this.getCurrentUser().user.permission;
    }
    return -1;
  }

  get isAdmin(): boolean {
    return this.permissionCode === 0 || this.permissionCode === 99;
  }

  get isViewer(): boolean {
    return this.permissionCode === 3;
  }

  get isOperator(): boolean {
    return this.permissionCode === 2;
  }

  get isSuper(): boolean {
    return this.permissionCode === 99;
  }

  populate() {
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.api
        .get('/cs/api/user')
        .subscribe((user: User) => this.setAuth(user), err => this.purgeAuth());
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    if (!user.user.license) {
      this.dialog
        .open(LicenseDialogComponent, {
          autoFocus: false,
          width: '100%',
          height: '100%'
        })
        .afterClosed()
        .subscribe(ret => {
          if (ret) {
            user.user.license = true;
            // Save JWT sent from server in localstorage
            this.jwtService.saveToken(user.token);
            // Set current user data into observable
            this.currentUserSubject.next(user);
            // Set isAuthenticated to true
            this.isAuthenticatedSubject.next(true);
            this.api.put('/cs/api/license', { username: user.user.username }).toPromise()
              .then(result => {
                if (!result) this.purgeAuth();
                else if (!this.ws.connected) this.ws.connect();
              });
          } else {
            this.purgeAuth();
          }
        });
      return;
    }
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
    if (!this.ws.connected) this.ws.connect();
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
    return this.api.post('/cs/api/users', { user: credentials }).pipe(
      map((data: User) => {
        this.setAuth(data);
        return data;
      })
    );
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  async logout(serverDisconnected?: boolean) {
    if (!this.jwtService.getToken()) return true;
    const params = serverDisconnected ? { serverDisconnected: 'true' } : {};
    const nav = await this.router.navigate(['/login'], { queryParams: params });
    if (nav === false) return;
    const ref = this.snack._openedSnackBarRef;
    if (ref) ref.dismiss();
    this.purgeAuth();
    setTimeout(async ()=>{
      if (!serverDisconnected && this.ws.connected) {
        await this.ws.query('?tp_exit');
        this.ws.reset();
      }
    },200);
    return true;
  }

  constructor(
    private api: ApiService,
    private ws: WebsocketService,
    private router: Router,
    private jwtService: JwtService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {
    this.ws.isConnected.subscribe(stat => {
      if (!stat && this.ws.port && !this.ws.updateFirmwareMode) {
        this.logout(true);
      }
    });
  }
}
