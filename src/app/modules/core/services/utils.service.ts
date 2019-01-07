import {Injectable} from "@angular/core";
import {WebsocketService} from "./websocket.service";
import {TpStatService} from "./tp-stat.service";
import {TaskService, MCQueryResponse} from ".";
import {MatSnackBar, MatDialog} from "@angular/material";
import {UpdateDialogComponent} from "../../../components/update-dialog/update-dialog.component";

/* 
 * THIS CONTAINS ALL KINDS OF UTILS THAT SHOULD BE USED ACCROSS THE APP
*/
@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  
  constructor(
    private ws: WebsocketService,
    private stat: TpStatService,
    private task: TaskService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ){
  }
  
  resetAllDialog(title: string) {
    let dialog = this.dialog.open(UpdateDialogComponent,{
      disableClose: true,
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      closeOnNavigation: false,
      data: title,
      id: 'update'
    });
    this.resetAll(true).then(result=>{
      if (result) { // RESET ALL SUCCESS
        this.stat.onlineStatus.subscribe(stat=>{
          if (stat)
            dialog.close();
        });
      } else {
        dialog.close();
      }
    });
  }
  
  resetAll(loadautoexec?: boolean) {
    return this.stat.resetAll().then(()=>{
      return this.task.resetAll();
    }).then((ret)=>{
      return this.ws.query('sys.en = 0');
    }).then(()=>{
      return this.ws.query('reset all');
    }).then((ret: MCQueryResponse)=>{
      if (ret.err) {
        this.snack.open('System Reset FAILED:' + ret.result,'ACKNOWLEDGE');
        return false;
      }
      this.snack.open('System Reset Success',null,{duration:1500});
      this.stat.startTpLibChecker();
      if (loadautoexec)
        this.ws.query('load autoexec.prg');
      return true;
    });
  }
}

