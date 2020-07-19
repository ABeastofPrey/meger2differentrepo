import { DataScreenComponent } from './components/data-screen/data-screen.component';
import { WebsocketService } from './../core/services/websocket.service';
import { Injectable }           from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot }  from '@angular/router';

@Injectable()
export class CanDeactivateDataGuard implements CanDeactivate<DataScreenComponent> {

  constructor(private ws: WebsocketService){

  }

  canDeactivate(
    component: DataScreenComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    if (this.ws.connected) {
      if (!component.isRefreshing) return true;
      return new Promise(resolve=>{
        const interval = setInterval(()=>{
          if (!this.ws.connected) {
            resolve(true);
            return;
          }
          if (component.isRefreshing) return;
          clearInterval(interval);
          resolve(true);
        },500);
      });
    }
    return true;
  }
}