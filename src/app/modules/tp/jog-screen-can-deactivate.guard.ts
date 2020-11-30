import { LoginService } from './../core/services/login.service';
import { TpStatService } from './../core/services/tp-stat.service';
import { TranslateService } from '@ngx-translate/core';
import { YesNoDialogComponent } from './../../components/yes-no-dialog/yes-no-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from './../core/services/data.service';
import { WebsocketService } from './../core/services/websocket.service';
import { JogScreenComponent } from './components/jogscreen/jogscreen.component';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';

@Injectable()
export class JogScreenCanDeactivateGuard implements CanDeactivate<JogScreenComponent> {

  constructor(
    private ws: WebsocketService,
    private data: DataService,
    private trn: TranslateService,
    private stat: TpStatService,
    private login: LoginService,
    private dialog: MatDialog){
  }

  canDeactivate(
    component: JogScreenComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> | boolean {
      if (!this.ws.connected || (!this.login.isAdmin && !this.login.isSuper) || this.data.isRobotType || !this.stat.mode.startsWith('T')) return true;
      return new Promise(resolve=>{
        this.trn.get('jogScreen.non_robot').subscribe(data=>{
          this.dialog.open(YesNoDialogComponent,{maxWidth: '400px', data}).afterClosed().subscribe(ret=>{
            resolve(ret ? true : false);
          });
        });
      });
  }
  
}
