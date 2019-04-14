import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import {LoginService} from '../core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {map} from 'rxjs/operators';

@Injectable()
export class PermissionGuardService implements CanActivate {
  constructor(public login: LoginService, public router: Router) {}
  canActivate(route: ActivatedRouteSnapshot) {
    return this.login.isAuthenticated.pipe(map(auth=>{
      const user = this.login.permissionCode;
      const screen = route.data.permission;
      if (user === 99)
        return true;
      if (user > screen) {
        this.router.navigateByUrl('/');
        return false;
      }
      return true;
    }));
  }
}