import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DashboardService } from '../../services/dashboard.service';
import { ApiService } from '../../../core';

@Component({
  selector: 'app-external-graph-dialog',
  templateUrl: './external-graph-dialog.component.html',
  styleUrls: ['./external-graph-dialog.component.css'],
})
export class ExternalGraphDialogComponent implements OnInit {
  graphType: string = '2d';
  files: string[] = [];
  selectedFile: string = null;

  constructor(
    private ref: MatDialogRef<any>,
    private dashboard: DashboardService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.api.getRecordingFiles().then((files: string[]) => {
      this.files = files;
      if (files.length === 1) this.selectedFile = files[0];
    });
  }

  show() {
    this.ref.close();
    this.dashboard.showGraphDialog(this.graphType, this.selectedFile);
  }
}
