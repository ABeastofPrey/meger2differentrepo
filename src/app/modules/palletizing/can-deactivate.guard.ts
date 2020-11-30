import { WebsocketService } from './../core/services/websocket.service';
import { ProgramEditorService } from './../program-editor/services/program-editor.service';
import { PalletizingComponent } from './components/palletizing-screen/palletizing.component';
import { Injectable }           from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot }  from '@angular/router';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<PalletizingComponent> {

  constructor(private prg: ProgramEditorService, private ws: WebsocketService){

  }

  canDeactivate(
    component: PalletizingComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    if (this.prg.wizardMode && this.ws.connected) {
      return new Promise(resolve=>{
        component.warnUserBeforeLeave().afterClosed().subscribe(ret=>{
          if (ret === 3) { // third option = save
            component.wizard.save().then(()=>{
              resolve(true);
            });
          } else if (ret) {
            // discard changes
            component.wizard.discard();
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