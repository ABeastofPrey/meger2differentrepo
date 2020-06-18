import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import {
  DashboardInitParams,
  DashboardService,
} from '../../services/dashboard.service';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../../../modules/core/services/websocket.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import {UtilsService} from '../../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'new-dashboard-dialog',
  templateUrl: './new-dashboard-dialog.component.html',
  styleUrls: ['./new-dashboard-dialog.component.css'],
})
export class NewDashboardDialogComponent implements OnInit {
  motionElements: DashboardInitParams[];
  selectedElement: DashboardInitParams = null;

  private words: string;
  private notifier: Subject<boolean> = new Subject();

  constructor(
    private ws: WebsocketService,
    private dashboard: DashboardService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    public dialogRef: MatDialogRef<DashboardInitParams>,
    private trn: TranslateService,
    private utils: UtilsService,
  ) {}

  add() {
    if (this.dashboard.findWindow(this.selectedElement.name) === -1) {
      this.dialogRef.close(this.selectedElement);
    }
    else {
        // this.snack.open(this.words, '', { duration: 1500 });
        this.snackbarService.openTipSnackBar(this.words);
    }
  }

  ngOnInit() {
    this.trn.get('dashboard.new.err').subscribe(words => {
      this.words = words;
    });
    this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat) {
        const promises = [
          this.ws.query('?grouplist'),
          this.ws.query('?axislist'),
        ];
        Promise.all(promises).then((ret: MCQueryResponse[]) => {
          const elements: DashboardInitParams[] = [];
          const groups = ret[0].result.split('\n');
          const axes = ret[1].result.split(',');
          for (const g of groups) {
            const parts = g.split(':');
            if (parts.length < 2) continue;
            elements.push({
              name: parts[0].trim(),
              axes: parts[1].trim().split(','),
            });
          }
          for (const a of axes) {
            elements.push({
              name: a,
              axes: [a],
            });
          }
          this.motionElements = elements;
        });
      }
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }
}
