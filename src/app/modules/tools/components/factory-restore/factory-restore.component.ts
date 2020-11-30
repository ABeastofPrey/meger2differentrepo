import { Component, OnInit } from '@angular/core';
import { RobotService } from '../../../core/services/robot.service';
import { MatDialog } from '@angular/material/dialog';
import { RobotModel } from '../../../core/models/robot.model';
import { RobotSelectionComponent } from '../../../../components/robot-selection/robot-selection.component';
import {
  ApiService,
  LoginService,
  WebsocketService,
  MCQueryResponse,
} from '../../../core';
import { UpdateDialogComponent } from '../../../../components/update-dialog/update-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-factory-restore',
  templateUrl: './factory-restore.component.html',
  styleUrls: ['./factory-restore.component.css'],
})
export class FactoryRestoreComponent implements OnInit {
  
  password = '';
  selectedRobot: RobotModel = null;
  busy = false; // true when the dialog is busy checking user password
  wrongPass = false;

  private words: {};
  private notifier: Subject<boolean> = new Subject();

  private _username: string;
  get username() {
    return this._username;
  }

  constructor(
    public robots: RobotService,
    private dialog: MatDialog,
    private api: ApiService,
    public login: LoginService,
    private ws: WebsocketService,
    private trn: TranslateService
  ) {}

  ngOnInit() {
    this.robots.changed
      .pipe(takeUntil(this.notifier))
      .subscribe((robot: RobotModel) => {
        this.selectedRobot = robot;
      });
    this._username = this.login.getCurrentUser().user.username;
    this.trn.get('apps.restore').subscribe(words => {
      this.words = words;
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  changeRobot() {
    this.dialog
      .open(RobotSelectionComponent)
      .afterClosed()
      .subscribe((ret: RobotModel) => {
        if (ret) this.selectedRobot = ret;
      });
  }

  restore() {
    this.busy = true;
    this.wrongPass = false;
    this.api.confirmPass(this.username, this.password).then(ret => {
      this.busy = false;
      if (ret) {
        const dialog = this.dialog.open(UpdateDialogComponent, {
          disableClose: true,
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          closeOnNavigation: false,
          data: this.words['title'],
          id: 'update',
        });
        // RESET LIBRARIES
        const cmd = '?FACTORY_RESET_SELECT_ROBOT("' + this.selectedRobot.part_number + '",0)';
        this.ws.query(cmd).then((ret: MCQueryResponse) => {
          if (ret.result === '0') {
            // RESET WEBSERVER
            this.api.restoreToFactory().then(ret => {
              if (ret) {
                console.log('factory reset ' + ret);
                setTimeout(()=>{
                  this.reboot(true);
                },1000);
              }
              else dialog.close();
            });
          } else {
            dialog.close();
          }
        });
      } else {
        this.wrongPass = true;
      }
    });
  }

  private reboot(clearLocalStorage?:boolean) {
    this.ws.updateFirmwareMode = true;
    this.ws.query('?user sys_reboot(0,0,0)');
    setTimeout(() => {
      if (clearLocalStorage) {
        localStorage.clear();
      }
      let ok = false;
      const interval = setInterval(() => {
        if (ok) return;
        this.api
          .getFile('isWebServerAlive.HTML')
          .then(() => {
            if (ok) return;
            ok = true;
            clearInterval(interval);
            this.login.logout().then(ret=>{
              setTimeout(()=>{
                const URL = window.location.href;
                const i = URL.indexOf('?');
                const finalURL = i === -1 ? URL : URL.substring(0,i);
                const newURL = finalURL + '?from=restore';
                window.location.href = newURL;
              },0);
            });
          })
          .catch(err => {});
      }, 2000);
    }, 10000);
  }
}
