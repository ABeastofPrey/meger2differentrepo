import { Component, OnInit } from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {DashboardInitParams, DashboardService} from '../../services/dashboard.service';
import {WebsocketService, MCQueryResponse} from '../../../../modules/core/services/websocket.service';

@Component({
  selector: 'new-dashboard-dialog',
  templateUrl: './new-dashboard-dialog.component.html',
  styleUrls: ['./new-dashboard-dialog.component.css']
})
export class NewDashboardDialogComponent implements OnInit {
  
  motionElements:DashboardInitParams[];
  selectedElement:DashboardInitParams = null;

  constructor(
    private ws : WebsocketService,
    private dashboard : DashboardService,
    private snack : MatSnackBar,
    public dialogRef: MatDialogRef<any>
  ) {
    this.ws.isConnected.subscribe(stat=>{
      if (stat) {
        let promises = [
          this.ws.query('?grouplist'),
          this.ws.query('?axislist')
        ];
        Promise.all(promises).then((ret: MCQueryResponse[])=>{
          let elements : DashboardInitParams[] = [];
          let groups = ret[0].result.split('\n');
          let axes = ret[1].result.split(',');
          for (let g of groups) {
            let parts = g.split(':');
            if (parts.length < 2)
              continue;
            elements.push({
              name: parts[0].trim(),
              axes: parts[1].trim().split(',')
            });
          }
          for (let a of axes) {
            elements.push({
              name: a,
              axes: [a]
            });
          }
          this.motionElements = elements;
        });
      }
    });
  }
  
  add() {
    if (this.dashboard.findWindow(this.selectedElement.name)===-1)
      this.dialogRef.close(this.selectedElement);
    else
      this.snack.open('Dashboard already open','',{duration:1500});
  }
  
  ngOnInit() {
  }

}
