import { PalletizingComponent } from './components/palletizing-screen/palletizing.component';
import { Injectable }           from '@angular/core';
import { Observable } from 'rxjs';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot }  from '@angular/router';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<PalletizingComponent> {

  canDeactivate(
    component: PalletizingComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    if (component.wizardMode) {
      return new Promise(resolve=>{
        component.warnUserBeforeLeave().afterClosed().subscribe(ret=>{
          if (ret) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    }
    return true;

  }
}