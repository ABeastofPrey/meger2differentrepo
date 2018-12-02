import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DashboardService} from '../../services/dashboard.service';

@Component({
  selector: 'app-external-graph-dialog',
  templateUrl: './external-graph-dialog.component.html',
  styleUrls: ['./external-graph-dialog.component.css']
})
export class ExternalGraphDialogComponent implements OnInit {
  
  name : string = null;
  is3D: boolean = false;

  constructor(
    private ref : MatDialogRef<any>,
    private dashboard : DashboardService
  ) { }

  ngOnInit() {
  }
  
  show() {
    this.ref.close();
    this.dashboard.showGraphDialog(this.is3D,null,this.name);
  }

}
