import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DashboardService } from '../../services/dashboard.service';
import { ApiService, UploadResult } from '../../../core';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-external-graph-dialog',
  templateUrl: './external-graph-dialog.component.html',
  styleUrls: ['./external-graph-dialog.component.css'],
})
export class ExternalGraphDialogComponent implements OnInit {
  
  files: string[] = [];
  selectedFile: string = null;
  err: boolean = false;
  
  private _mode: string = 'mc';
  get mode() {
    return this._mode;
  }
  set mode(val: string) {
    this.selectedFile = val === 'mc' ? this.files[0] : null;
    this._mode = val;
  }

  constructor(
    private ref: MatDialogRef<any>,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.api.getRecordingFiles().then((files: string[]) => {
      this.files = files;
      if (files.length === 1) this.selectedFile = files[0];
    });
  }

  show() {
    this.ref.close(this.selectedFile);
  }
  
  onUploadFilesChange(e: any) {
    this.err = false;
    let count = 0;
    let targetCount = e.target.files.length;
    for (let f of e.target.files) {
      this.api.uploadRec(f).then(
        (ret: UploadResult) => {
          // ON SUCCUESS
          count++;
          if (count === targetCount) {
            const fullName = (f as File).name;
            const i = fullName.indexOf('.');
            const nameWithoutExtension = fullName.substring(0, i);
            this.selectedFile = nameWithoutExtension;
            this.show();
          }
        },
        (ret: HttpErrorResponse) => {
          // ON ERROR
          this.err = true;
        }
      );
    }
  }
}
