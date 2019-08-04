import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NewDashboardDialogComponent } from '../new-dashboard-dialog/new-dashboard-dialog.component';
import { ExternalGraphDialogComponent } from '../external-graph-dialog/external-graph-dialog.component';
import { DashboardService } from '../../services/dashboard.service';
import { ApiService } from '../../../../modules/core/services/api.service';
import { TourService } from 'ngx-tour-md-menu';
import { Subject } from 'rxjs';
import {
  trigger,
  transition,
  style,
  animate,
  animateChild,
  group,
  query,
} from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'dashboard-screen',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.2s', style({ opacity: '1' })),
      ]),
      transition(':leave', [
        style({ opacity: '1' }),
        animate('.2s', style({ opacity: '0' })),
      ]),
    ]),
  ],
})
export class DashboardComponent implements OnInit {
  private notifier: Subject<boolean> = new Subject();
  private words: any;

  constructor(
    public dashboard: DashboardService,
    private dialog: MatDialog,
    private api: ApiService,
    private snack: MatSnackBar,
    private tour: TourService,
    private trn: TranslateService
  ) {}

  ngOnInit() {
    this.trn.get(['dashboard.err_file', 'dismiss']).subscribe(words => {
      this.words = words;
    });
    this.tour.stepShow$.pipe(takeUntil(this.notifier)).subscribe(step => {
      if (step.anchorId === 'dashboard-fab') {
        setTimeout(() => {
          this.dashboard.add({
            name: 'SCARA (Tour)',
            axes: ['A1', 'A2', 'A3', 'A4'],
          });
          this.notifier.next(true);
          this.notifier.unsubscribe();
        }, 200);
      }
    });
  }

  downloadCSV() {
    this.api.getRecordingCSV(null).then((csv: string) => {
      if (csv === null) {
        this.snack.open(
          this.words['dashboard.err_file'],
          this.words['dismiss']
        );
        return;
      }
      let element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(csv)
      );
      element.setAttribute('download', 'RECORDING.CSV');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  }

  add() {
    let ref = this.dialog.open(NewDashboardDialogComponent);
    ref.afterClosed().subscribe(ret => {
      if (ret) this.dashboard.add(ret);
    });
  }

  showExternalGraph() {
    this.dialog.open(ExternalGraphDialogComponent);
  }
}
