import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from '../../core';
import { YesNoDialogComponent } from '../../../components/yes-no-dialog/yes-no-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(private ws: WebsocketService, private dialog: MatDialog) { }

  public getData(api): Promise<MCQueryResponse>{
    return this.ws.query(api);
  }

  public saveMatDialog(){
    return this.dialog.open(YesNoDialogComponent, {
      data: {
          title: 'maintenance.input.saveInput',
          msg: 'maintenance.input.saveMsg',
          yes: 'button.save', no: 'button.cancel',
      },
    }).afterClosed();
  }

  public save(api): Promise<MCQueryResponse>{
    return this.ws.query(api);
  }

  public removeHistoryChild():void{
    // Prevent the component from rendering multiple times and delete the current component
    let amh: HTMLCollectionOf<Element> = document.getElementsByTagName("app-maintenance-history");
    for(let i=0;i<amh.length;i++){
      amh[i].parentNode.removeChild(amh[i]);
    }
  }

}
