import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { NewDashboardParameterDialogComponent } from '../new-dashboard-parameter-dialog/new-dashboard-parameter-dialog.component';
import {
  RecordDialogComponent,
  RecordParams,
} from '../record-dialog/record-dialog.component';
import {
  DashboardWindow,
  DashboardService,
  DashboardParam,
} from '../../services/dashboard.service';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../../../modules/core/services/websocket.service';
import { TourService } from 'ngx-tour-md-menu';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../../core';

@Component({
  selector: 'dashboard-window',
  templateUrl: './dashboard-window.component.html',
  styleUrls: ['./dashboard-window.component.css'],
})
export class DashboardWindowComponent implements OnInit {
  @Input() container: ElementRef;
  @Input() params: DashboardWindow;

  @ViewChild('window', { static: false }) window: ElementRef;

  private words: any;

  public cart: string[];

  constructor(
    private dashboard: DashboardService,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private tour: TourService,
    private trn: TranslateService,
    public login: LoginService
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
    this.tour.stepHide$.subscribe(step => {
      if (step.anchorId === 'dashboard-rec') {
        this.close();
      }
    });
    this.tour.stepShow$.subscribe(step => {
      if (step.anchorId === 'dashboard-expand') {
        setTimeout(() => {
          this.toggleExpand();
        }, 400);
        setTimeout(() => {
          this.tour.next();
        }, 800);
      }
    });
  }

  onDragEnd() {
    let matrix = new WebKitCSSMatrix(
      getComputedStyle(this.window.nativeElement).webkitTransform
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
    for (let t of this.params.target) {
      if (isNaN(t) || t === null)
        return this.snack.open(this.words['dashboard.err_target'], '', {
          duration: 1500,
        });
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
            this.snack.open(word, this.words['dismiss']);
          });
        return;
      }
      this.snack.open(this.words['dashboard.move_sent'], '', {
        duration: 1500,
      });
    });
  }

  close() {
    this.dashboard.close(this.params.name);
  }

  addParam() {
    let ref = this.dialog.open(NewDashboardParameterDialogComponent);
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
    let ref = this.dialog.open(RecordDialogComponent, { data: this.params });
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
          for (let p of this.params.params) {
            if (!this.params.isGroup)
              varList.push(this.params.name + '.' + p.name);
            else {
              for (let a of this.params.axes) {
                varList.push(a + '.' + p.name);
              }
            }
          }
        }
        let cmd =
          'Record CSRECORD.rec ' +
          Math.ceil(params.duration) +
          ' Gap=1 RecData=' +
          varList.join();
        this.ws.query(cmd).then((ret: MCQueryResponse) => {
          if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
          this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
            if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
            this.params.isRecording = true;
            this.params.recordingParams = params;
            this.params.recordingTime = 0;
            let time = 0;
            let interval = setInterval(() => {
              time += 200;
              this.params.recordingTime = (time / params.duration) * 100;
              if (
                this.params.recordingTime >= 100 ||
                !this.params.isRecording
              ) {
                clearInterval(interval);
                this.onRecordFinish(params.graphType);
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

  onRecordFinish(graphType: string) {
    this.stop();
    setTimeout(() => {
      // ALLOW TIME FOR RECORDING TO CLOSE FILE
      this.dashboard.showGraphDialog(graphType);
    }, 400);
  }
}
