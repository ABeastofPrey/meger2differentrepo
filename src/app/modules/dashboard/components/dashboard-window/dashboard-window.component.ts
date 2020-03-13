import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { NewDashboardParameterDialogComponent } from '../new-dashboard-parameter-dialog/new-dashboard-parameter-dialog.component';
import {
  DashboardWindow,
  DashboardService,
  DashboardParam,
} from '../../services/dashboard.service';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../../../modules/core/services/websocket.service';
import { TranslateService } from '@ngx-translate/core';
import { LoginService, GroupManagerService } from '../../../core';
import {RecordDialogComponent, RecordParams} from '../../../../components/record-dialog/record-dialog.component';
import {RecordService} from '../../../core/services/record.service';
import {Router} from '@angular/router';
import {UtilsService} from '../../../../modules/core/services/utils.service';

@Component({
  selector: 'dashboard-window',
  templateUrl: './dashboard-window.component.html',
  styleUrls: ['./dashboard-window.component.css'],
})
export class DashboardWindowComponent implements OnInit {
  @Input() container: ElementRef;
  @Input() params: DashboardWindow;

  @ViewChild('window', { static: false }) window: ElementRef;

  private words: {};

  cart: string[];

  constructor(
    private dashboard: DashboardService,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private trn: TranslateService,
    public login: LoginService,
    private grp: GroupManagerService,
    private rec: RecordService,
    private router: Router,
    private utils: UtilsService
  ) {
    this.trn
      .get(['dashboard.err_target', 'dismiss', 'dashboard.move_sent'])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {
    switch (this.params.axes.length) {
      case 4:
        this.cart = ['X', 'Y', 'Z', 'R'];
        break;
      default:
        this.cart = ['X', 'Y', 'Z', 'Y', 'P', 'R'];
        break;
    }
  }

  onDragEnd() {
    const el = this.window.nativeElement as HTMLElement;
    const matrix = new WebKitCSSMatrix(
      getComputedStyle(el).transform
    );
    this.params.pos = {
      x: matrix.m41,
      y: matrix.m42,
    };
    this.dashboard.save();
  }

  toggleExpand() {
    this.params.isExpanded = !this.params.isExpanded;
    this.dashboard.save();
  }

  toggleEnable() {
    this.ws.query(this.params.name + '.en=' + (this.params.enable ? 0 : 1));
  }
  
  stopMotion() {
    this.ws.query('stop ' + this.params.name);
  }

  move() {
    for (const t of this.params.target) {
      if (isNaN(t) || t === null) {
        if (this.utils.IsNotKuka) {
          return this.snack.open(this.words['dashboard.err_target'], '', {
            duration: 1500,
          });
        }
        return;
      }
    }
    let cmd = 'move ' + this.params.name;
    let target = this.params.isGroup
      ? '{' + this.params.target.join(',') + '}'
      : this.params.target[0];
    if (this.params.cartesian) target = '#' + target;
    cmd += ' ' + target;
    if (this.params.vel) cmd += ' VCruise=' + this.params.vel;
    if (this.params.acc) cmd += ' Acc=' + this.params.acc;
    if (this.params.dec) cmd += ' Dec=' + this.params.dec;
    if (this.params.jerk) cmd += ' Jerk=' + this.params.jerk;
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err) {
        this.trn
          .get('dashboard.err_move', {
            code: ret.err.errCode,
            msg: ret.err.errMsg,
          })
          .subscribe(word => {
            if (this.utils.IsNotKuka) {
              this.snack.open(word, this.words['dismiss']);
            }
          });
      }
    });
  }

  close() {
    this.dashboard.close(this.params.name);
  }

  addParam() {
    const ref = this.dialog.open(NewDashboardParameterDialogComponent,{
      data: {
        isGroup: this.params.isGroup
      }
    });
    ref.afterClosed().subscribe((ret: DashboardParam) => {
      if (ret) {
        this.params.params.push(ret);
        this.dashboard.save();
      }
    });
  }

  deleteParam(i: number) {
    this.params.params.splice(i, 1);
    this.dashboard.save();
  }

  record() {
    if (this.params.isRecording) return this.stop();
    const ref = this.dialog.open(RecordDialogComponent, { data: this.params });
    ref.afterClosed().subscribe((params: RecordParams) => {
      if (params) {
        this.dashboard.lastChartData = null;
        let varList: string[] = [];
        if (params.graphType === '3d') {
          varList = [
            this.params.name + '.' + params.x,
            this.params.name + '.' + params.y,
            this.params.name + '.' + params.z,
          ];
        } else if (params.graphType === '2da') {
          varList = [
            this.params.name + '.' + params.x,
            this.params.name + '.' + params.y,
          ];
        } else {
          for (const p of this.params.params) {
            if (!this.params.isGroup || (p.value as string).indexOf(',') === -1) {
              varList.push(this.params.name + '.' + p.name);
            }
            else {
              for (let i = 1; i <= this.params.axes.length; i++) {
                varList.push(this.params.name + '.' + p.name + '{' + i + '}');
              }
            }
          }
        }
        const cmd =
          'Record ' + params.name + '.rec ' +
          Math.ceil(params.duration / this.grp.sysInfo.cycleTime) +
          ' Gap=' + params.gap + ' RecData=' +
          varList.join();
        this.ws.query(cmd).then((ret: MCQueryResponse) => {
          if (ret.err) {
            if (this.utils.IsNotKuka) {
              return this.snack.open(ret.err.errMsg, 'DISMISS');
            }
            return;
          }
          this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
            if (ret.err) {
              if (this.utils.IsNotKuka) {
                return this.snack.open(ret.err.errMsg, 'DISMISS');
              }
              return;
            }
            this.params.isRecording = true;
            this.params.recordingParams = params;
            this.params.recordingTime = 0;
            let time = 0;
            const interval = setInterval(async() => {
              time += 200;
              this.params.recordingTime = (time / params.duration) * 100;
              const mcRecording = (await this.ws.query('?recording')).result;
              if (mcRecording === '0' || mcRecording === '4' || !this.params.isRecording) {
                clearInterval(interval);
                this.onRecordFinish(params);
                this.params.recordingTime = 0;
              }
            }, 200);
          });
        });
      }
    });
  }

  stop() {
    this.params.isRecording = false;
    this.params.recordingTime = 0;
    this.ws.query('RecordClose');
  }

  onRecordFinish(params: RecordParams) {
    this.stop();
    setTimeout(() => {
      // ALLOW TIME FOR RECORDING TO CLOSE FILE
      this.rec.createTab(params.name);
      this.router.navigateByUrl('/dashboard/recordings');
    }, 400);
  }
}
