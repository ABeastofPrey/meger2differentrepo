import { Component, OnInit } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewDashboardDialogComponent} from '../new-dashboard-dialog/new-dashboard-dialog.component'
import {ExternalGraphDialogComponent} from '../external-graph-dialog/external-graph-dialog.component';
import {DashboardService} from '../../services/dashboard.service';
import {ApiService} from '../../../../modules/core/services/api.service';
import {TourService} from 'ngx-tour-md-menu';
import {Subscription} from 'rxjs';

@Component({
  selector: 'dashboard-screen',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  private sub: Subscription;

  constructor(
    public dashboard : DashboardService,
    private dialog:MatDialog,
    private api: ApiService,
    private snack : MatSnackBar,
    private tour: TourService
  ) { }

  ngOnInit() {
    this.sub = this.tour.stepShow$.subscribe(step=>{
      if (step.anchorId === 'dashboard-fab') {
        setTimeout(()=>{
          this.dashboard.add({
            name: 'SCARA (Tour)',
            axes: ['A1','A2','A3','A4']
          });
          this.sub.unsubscribe();
        },200);
      }
    });
  }
  
  downloadCSV() {
    this.api.getRecordingCSV(null).then((csv:string)=>{
      if (csv === null) {
        this.snack.open('FILE NOT FOUND','DISMISS');
        return;
      }
      let element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(csv)
      );
      element.setAttribute('download','RECORDING.CSV');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  }
  
  add() {
    let ref = this.dialog.open(NewDashboardDialogComponent);
    ref.afterClosed().subscribe(ret=>{
      if (ret)
        this.dashboard.add(ret);
    });
  }
  
  showExternalGraph() {
    this.dialog.open(ExternalGraphDialogComponent);
  }

}
