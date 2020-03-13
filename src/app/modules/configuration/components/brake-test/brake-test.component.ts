import { TranslateService } from '@ngx-translate/core';
import { YesNoDialogComponent } from './../../../../components/yes-no-dialog/yes-no-dialog.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { WebsocketService } from './../../../core/services/websocket.service';
import { DataService } from './../../../core/services/data.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {UtilsService} from '../../../../modules/core/services/utils.service';

@Component({
  selector: 'brake-test',
  templateUrl: './brake-test.component.html',
  styleUrls: ['./brake-test.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrakeTestComponent implements OnInit {

  private notifier: Subject<boolean> = new Subject();
  private words: {};

  brakes: Brake[] = [];
  busy = false;

  constructor(
    private data: DataService,
    private ws: WebsocketService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private trn: TranslateService,
    private snack: MatSnackBar,
    private utils: UtilsService
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
        const ret = await this.ws.query('?BT_GET_AXES_BITMAP');
        if (ret.err) return;
        const n = Number(ret.result);
        for (let i=0; i<this.brakes.length; i++) {
          this.brakes[i].val = this.checkBit(n,i+1);
        }
        this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  async onBitmapChange() {
    console.log(this.brakes);
    console.log(await this.ws.query(`call BT_SET_AXES_BITMAP(${this.bitmap})`));
    this.cd.detectChanges();
  }

  start() {
    const data = this.words['robots.brakes.dialog'];
    data['caution'] = true;
    this.dialog.open(YesNoDialogComponent,{
      maxWidth: '500px',
      data
    }).afterClosed().subscribe(async ret=>{
      if (!ret) return;
      this.busy = true;
      this.cd.detectChanges();
      const result = (await this.ws.query('?BT_EXECUTE_BRAKE_TEST')).result;
      this.busy = false;
      this.cd.detectChanges();
      if (result === '0') {
        if (!this.utils.IsKuka) {
          this.snack.open(this.words['success'],'',{duration: 1500});
        }
      }
    });
  }

}

interface Brake {
  name: string;
  val: boolean;
}
