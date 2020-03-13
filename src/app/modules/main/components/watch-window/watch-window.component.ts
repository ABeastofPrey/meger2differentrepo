import { GroupManagerService } from './../../../core/services/group-manager.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { WatchService, WatchVar } from '../../../../modules/core/services/watch.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { WebsocketService, MCQueryResponse, ApiService } from '../../../core';
import { RecordDialogComponent, RecordParams } from '../../../../components/record-dialog/record-dialog.component';
import { RecordService } from '../../../core/services/record.service';
import { Router } from '@angular/router';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { of } from 'rxjs';
import { UtilsService } from '../../../core/services/utils.service';

@Component({
  selector: 'watch-window',
  templateUrl: './watch-window.component.html',
  styleUrls: ['./watch-window.component.css'],
})
export class WatchWindowComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport, { static: true })
  viewport: CdkVirtualScrollViewport;
  isRecording = false;
  recPercentage = 0;

  constructor(
    public watch: WatchService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private api: ApiService,
    private rec: RecordService,
    private router: Router,
    private grp: GroupManagerService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    // catch variables with context of vars.
    this.watch.catchVariables();
  }

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
        if (v.context.endsWith('_DATA')) {
          return v.context.slice(0, -5) + '::' + v.name;
        }
        return v.name;
      });
    this.dialog.open(RecordDialogComponent).afterClosed().subscribe((recParams: RecordParams) => {
      if (recParams) {
        this.startRecording(params, recParams);
      }
    });
  }

  private startRecording(params: string[], recParams: RecordParams) {
    const cmd =
      'Record ' + recParams.name + '.rec ' +
      Math.ceil(recParams.duration / this.grp.sysInfo.cycleTime) +
      ' Gap=' + recParams.gap + ' RecData=' +
      params.join();
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err) 
      {
        if(!this.utils.IsKuka)
        {
          return this.snack.open(ret.err.errMsg, 'DISMISS');
        }
        return;
      }
      this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
        if (ret.err) 
        {
          if (!this.utils.IsKuka) {
            return this.snack.open(ret.err.errMsg, 'DISMISS');
          }
          return;
        }
        this.isRecording = true;
        let time = 0;
        const interval = setInterval(async() => {
          time += 200;
          this.recPercentage = (time / recParams.duration) * 100;
          const mcRecording = (await this.ws.query('?recording')).result;
          if (mcRecording === '0' || mcRecording === '4' || !this.isRecording) {
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
      (e.target as HTMLElement).blur();
      return;
    }
    if (this.watch.addBlankIfNeeded(v)) {
      const latestIdx = this.watch.vars.length - 1;
      const latestVar = this.watch.vars[latestIdx];
      this.watch.getVariablesWithContext(latestVar.context).subscribe(res => {
        latestVar.variableList = of(res);
        this.viewport.scrollToIndex(latestIdx);
      });
    }
  }

  getVariablesWithContext(v: WatchVar, changeContext: boolean): void {
    if (changeContext) v.name = '';
    this.watch.getVariablesWithContext(v.context).subscribe(res => {
      v.variableList = of(res);
    });
  }
}