import {Injectable} from "@angular/core";
import {WebsocketService} from "./websocket.service";
import {TpStatService} from "./tp-stat.service";
import {TaskService, MCQueryResponse} from ".";
import {MatSnackBar, MatDialog} from "@angular/material";
import {UpdateDialogComponent} from "../../../components/update-dialog/update-dialog.component";
import {TranslateService} from "@ngx-translate/core";
import {environment as env, Platform} from '../../../../environments/environment';
import { DataService } from './data.service';

/* 
 * THIS CONTAINS ALL KINDS OF UTILS THAT SHOULD BE USED ACCROSS THE APP
*/
@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  
  private words: any;
  
  constructor(
    private ws: WebsocketService,
    private stat: TpStatService,
    private task: TaskService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private trn: TranslateService,
    public dataService: DataService,
  ){
    this.trn.get(['utils.success', 'acknowledge']).subscribe(words=>{
      this.words = words;
    });
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
          if (stat) {
            this.ws.updateFirmwareMode = false;
            dialog.close();
          }
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
      if (!env.production)
        console.log('sys.en = 0');
      return this.ws.query('sys.en = 0');
    }).then(()=>{
      if (!env.production)
        console.log('reset all');
      return this.ws.query('reset all');
    }).then((ret: MCQueryResponse)=>{
      if (!env.production)
        console.log('reset all returned:',ret);
      if (ret.err) {
        this.trn.get('utils.err_reset', {result: ret.err.errMsg}).subscribe(err=>{
          this.snack.open(err, this.words['acknowledge']);
        });
        return false;
      }
      this.snack.open(this.words['utils.success'],null,{duration:1500});
      this.stat.startTpLibChecker();
      if (loadautoexec) {
        if (!env.production)
          console.log('loading autoexec.prg...');
        return this.ws.query('load autoexec.prg');
      }
    }).then(()=>{
      if (!env.production)
        console.log('reset all done');
      return true;
    });
  }

  public get PlatformList(): Platform[] {
    const platformList: Platform[] = [];
    for (let value of <Platform[]>Object.values(env.platforms)) {
      platformList.push(value);
    }
    return platformList;
  }

  public get IsKuka(): boolean {
    return env.platform.name === env.platforms.Kuka.name;
  }

  public get IsScara(): boolean {
    return (this.dataService.robotType === 'SCARA') ? true : false;
  }
}

