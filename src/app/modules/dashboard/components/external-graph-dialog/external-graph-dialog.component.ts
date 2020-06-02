import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('upload', { static: false }) uploadInput: ElementRef;
  
  files: string[] = [];
  selectedFile: string = null;
  err = false;
  
  private _mode = 'mc';
  get mode() {
    return this._mode;
  }
  set mode(val: string) {
    this.selectedFile = val === 'mc' ? this.files[0] : null;
    this._mode = val;
  }

  constructor(
    private ref: MatDialogRef<string>,
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

  fileUpload() {
    this.uploadInput.nativeElement.click();
  }
  
  onUploadFilesChange(e: { target: { files: FileList } } ) {
    this.err = false;
    let count = 0;
    const targetCount = e.target.files.length;
    for (let i=0; i<e.target.files.length; i++) {
      const f = e.target.files.item(i);
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
