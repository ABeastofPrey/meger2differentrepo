import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {DashboardWindow} from '../../modules/dashboard/services/dashboard.service';

@Component({
  selector: 'app-record-dialog',
  templateUrl: './record-dialog.component.html',
  styleUrls: ['./record-dialog.component.css'],
})
export class RecordDialogComponent implements OnInit {
  
  duration: number = null;
  override = false;
  x = 'setPoint{1}';
  y = 'setPoint{2}';
  z = 'setPoint{3}';
  x2D: string = null;
  y2D: string = null;
  recMode = '1';
  fileName = 'CSRECORD';
  gap = 1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DashboardWindow,
    public ref: MatDialogRef<RecordParams>
  ) {}

  ngOnInit() {
    const storedDuration = Number(localStorage.getItem('recDuration'));
    if (!isNaN(storedDuration)) {
      this.duration = storedDuration;
    }
    else {
      this.duration = 1000;
    }
  }

  record() {
    localStorage.setItem('recDuration', '' + this.duration);
    let graphType: string;
    switch (this.recMode) {
      case '1':
        graphType = '2d';
        break;
      case '2':
        graphType = '2da';
        break;
      case '3':
        graphType = '3d';
        break;
      default:
        break;
    }
    this.ref.close({
      duration: this.duration,
      override: this.override,
      graphType,
      x: this.recMode === '2' ? this.x2D : this.x,
      y: this.recMode === '2' ? this.y2D : this.y,
      z: this.z,
      gap: this.gap,
      name: this.fileName
    });
  }
}

export interface RecordParams {
  duration: number;
  override: boolean;
  graphType: string;
  x: string;
  y: string;
  z: string;
  gap: number;
  name: string;
}
