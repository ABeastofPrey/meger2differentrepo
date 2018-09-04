import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DashboardWindow} from '../../services/dashboard.service';

@Component({
  selector: 'app-record-dialog',
  templateUrl: './record-dialog.component.html',
  styleUrls: ['./record-dialog.component.css']
})
export class RecordDialogComponent implements OnInit {
  
  duration: number = null;
  override : boolean = false;
  is3D: boolean = false;
  x : string = 'setPoint{1}';
  y : string = 'setPoint{2}';
  z : string = 'setPoint{3}';
  x2D : string = null;
  y2D : string = null;
  advanced : boolean = false;
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DashboardWindow,
    public ref : MatDialogRef<any>
  ) { }

  ngOnInit() {
  }
  
  record() {
    this.ref.close({
      duration: this.duration,
      override: this.override,
      is3D: this.is3D,
      x: this.advanced ? this.x2D : this.x,
      y: this.advanced ? this.y2D : this.y,
      z: this.z,
      advanced: this.advanced
    });
  }

}

export interface RecordParams {
  duration : number;
  override : boolean;
  is3D : boolean;
  advanced: boolean;
  x : string;
  y : string;
  z : string;
}