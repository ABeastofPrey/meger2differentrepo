import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WatchService } from '../../../../modules/core/services/watch.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { WebsocketService, MCQueryResponse, ApiService } from '../../../core';
import {RecordDialogComponent, RecordParams} from '../../../../components/record-dialog/record-dialog.component';
import {RecordService} from '../../../core/services/record.service';
import {Router} from '@angular/router';

@Component({
  selector: 'watch-window',
  templateUrl: './watch-window.component.html',
  styleUrls: ['./watch-window.component.css'],
})
export class WatchWindowComponent implements OnInit {
  @ViewChild('context', { static: false }) context: ElementRef;
  isRecording: boolean = false;
  recPercentage: number = 0;

  constructor(
    public watch: WatchService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private api: ApiService,
    private rec: RecordService,
    private router: Router
  ) {}

  ngOnInit() {}

  get enableRecord(): boolean {
    return this.watch.vars.some(v => {
      return v.record;
    });
  }

  record() {
    const params = this.watch.vars
      .filter(v => {
        return v.record && v.name.trim().length;
      })
      .map(v => {
        if (v.context.endsWith('_DATA'))
          return v.context.slice(0, -5) + '::' + v.name;
        return v.name;
      });
    this.dialog.open(RecordDialogComponent).afterClosed().subscribe((recParams: RecordParams) => {
      if (recParams) {
        this.startRecording(params, recParams);
      }
    });
  }

  private startRecording(params: string[], recParams: RecordParams) {
    let cmd =
      'Record ' + recParams.name + '.rec ' +
      Math.ceil(recParams.duration) +
      ' Gap=' + recParams.gap + ' RecData=' +
      params.join();
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
      this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
        if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
        this.isRecording = true;
        let time = 0;
        const interval = setInterval(() => {
          time += 200;
          this.recPercentage = (time / recParams.duration) * 100;
          if (this.recPercentage >= 100 || !this.isRecording) {
            clearInterval(interval);
            this.onRecordFinish(recParams);
          }
        }, 200);
      });
    });
  }

  private onRecordFinish(recParams: RecordParams) {
    this.ws.query('recordclose').then(() => {
      this.recPercentage = 0;
      this.isRecording = false;
      setTimeout(() => {
        // ALLOW TIME FOR RECORDING TO CLOSE FILE
        this.rec.createTab(recParams.name);
        this.router.navigateByUrl('/dashboard/recordings');
    }, 400);
    });
  }

  onBlur(v, e?: KeyboardEvent) {
    if (e) {
      (<HTMLElement>e.target).blur();
      return;
    }
    if (this.watch.addBlankIfNeeded(v)) {
      setTimeout(() => {
        const e = document.getElementById(
          'var-' + (this.watch.vars.length - 1)
        );
        if (e) e.focus();
      }, 0);
    }
  }
}