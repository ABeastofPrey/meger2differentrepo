import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DashboardWindow } from '../../services/dashboard.service';

@Component({
  selector: 'app-record-dialog',
  templateUrl: './record-dialog.component.html',
  styleUrls: ['./record-dialog.component.css'],
})
export class RecordDialogComponent implements OnInit {
  duration: number = null;
  override: boolean = false;
  x: string = 'setPoint{1}';
  y: string = 'setPoint{2}';
  z: string = 'setPoint{3}';
  x2D: string = null;
  y2D: string = null;
  recMode: string = '1';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DashboardWindow,
    public ref: MatDialogRef<RecordParams>
  ) {}

  ngOnInit() {
    const storedDuration = Number(localStorage.getItem('recDuration'));
    if (!isNaN(storedDuration)) this.duration = storedDuration;
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
    }
    this.ref.close({
      duration: this.duration,
      override: this.override,
      graphType: graphType,
      x: this.recMode === '2' ? this.x2D : this.x,
      y: this.recMode === '2' ? this.y2D : this.y,
      z: this.z,
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
}
