import { ApiService } from './../../../core/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { YesNoDialogComponent } from './../../../../components/yes-no-dialog/yes-no-dialog.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { WebsocketService } from './../../../core/services/websocket.service';
import { DataService } from './../../../core/services/data.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {UtilsService} from '../../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'brake-test',
  templateUrl: './brake-test.component.html',
  styleUrls: ['./brake-test.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrakeTestComponent implements OnInit {

  private notifier: Subject<boolean> = new Subject();
  private words: {};
  private _btResult = null;

  get btResult() {
    return this._btResult;
  }

  brakes: Brake[] = [];
  busy = false;

  constructor(
    private data: DataService,
    private ws: WebsocketService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private trn: TranslateService,
    private api: ApiService,
    private snackbarService: SysLogSnackBarService
  ) { }

  private checkBit = (target: number, position: number) => {
    const ret = (target >> (position - 1) & 1);
    if (ret) {
      return true;
    }
    return false;
  }

  private get bitmap() {
    return '0b' + this.brakes.map(b=>{
      return b.val ? '1' : '0';
    }).reverse().join('');
  }

  ngOnInit() {
    this.trn.get(['robots.brakes.dialog','success']).subscribe(words=>{
      this.words = words;
    });
    this.data.dataLoaded.pipe(takeUntil(this.notifier)).subscribe(async stat=>{
      if (stat) {
        this.brakes = this.data.robotCoordinateType.legends.map((l,i)=>{
          return {
            name: 'A'+ (i+1),
            val: false
          }
        });
        await this.refresh();
      }
    });
  }

  async refresh() {
    const ret = await this.ws.query('?BT_GET_AXES_BITMAP');
    if (ret.err) return;
    const n = Number(ret.result);
    for (let i=0; i<this.brakes.length; i++) {
      this.brakes[i].val = this.checkBit(n,i+1);
    }
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  async onBitmapChange() {
    await this.ws.query(`call BT_SET_AXES_BITMAP(${this.bitmap})`);
    await this.refresh();
  }

  get noneSelected() {
    return !this.brakes.some(b=>b.val);
  }

  start() {
    const data = this.words['robots.brakes.dialog'];
    data['caution'] = true;
    this.dialog.open(YesNoDialogComponent,{
      maxWidth: '500px',
      data
    }).afterClosed().subscribe(async ret=>{
      if (!ret) return;
      this._btResult = null;
      this.busy = true;
      this.cd.detectChanges();
      const result = (await this.ws.query('?BT_EXECUTE_BRAKE_TEST')).result;
      if (result !== '0') {
        this.busy = false;
        this.cd.detectChanges();
      } else {
        const wait = await this.waitForBt();
        this.busy = false;
        if (wait) {
          this.snackbarService.openTipSnackBar("success");
        }
        this.cd.detectChanges();
        this.showResult();
      }
      this.refresh();
    });
  }

  private async showResult() {
    try {
      this._btResult = await this.api.getFile('BRK_LOG.DAT');
    } catch (err) {
      this._btResult = null;
    }
    this.cd.detectChanges();
  }

  private waitForBt() {
    return new Promise(resolve=>{
      setTimeout(()=>{
        let done = false;
        const interval = setInterval(async()=>{
          if (done) return;
          const ret = await this.ws.query('?BT_GET_STATUS');
          if (ret.result !== '1') {
            done = true;
            resolve(ret.result === '2');
            clearInterval(interval);
          }
        }, 1000);
      },200);
    });
  }

}

interface Brake {
  name: string;
  val: boolean;
}
