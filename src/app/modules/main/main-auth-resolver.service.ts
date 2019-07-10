import { Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable()
export class MainAuthResolver implements Resolve<boolean> {
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.login.isAuthenticated.subscribe(auth => {
      if (!auth) this.router.navigateByUrl('/login');
    });
    return this.login.isAuthenticated.pipe(take(1));
  }
  constructor(private login: LoginService, private router: Router) {}
}
