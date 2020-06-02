import { DataService } from './../core/services/data.service';
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { LoginService, TpStatService } from '../core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable()
export class PermissionGuardService implements CanActivate {
  constructor(
    public login: LoginService,
    public router: Router,
    private stat: TpStatService,
    private data: DataService
  ) {}
  canActivate(route: ActivatedRouteSnapshot) {
    return this.login.isAuthenticated.pipe(
      map(auth => {
        if (!auth) {
          // user logout
          this.router.navigate(['/login']);
          return false;
        }
        if (route.data.safetyCard && !this.data.safetyCardRunning) return false;
        const user = this.login.permissionCode;
        const screen = route.data.permission;
        const requiresTP = route.data.requiresTP;
        if (requiresTP && !this.stat.onlineStatus.value) {
          this.router.navigateByUrl('/');
          return false;
        }
        if (user === 99) return true;
        if (user > screen) {
          this.router.navigateByUrl('/');
          return false;
        }
        return true;
      })
    );
  }
}
