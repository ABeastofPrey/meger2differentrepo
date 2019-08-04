import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from '../../modules/core';

@Component({
  selector: 'app-file-selector-dialog',
  templateUrl: './file-selector-dialog.component.html',
  styleUrls: ['./file-selector-dialog.component.css'],
})
export class FileSelectorDialogComponent implements OnInit {
  selected: string = null;
  files: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.api.getFiles('SIM').then(result => {
      this.files = result.map(f => {
        return f.fileName;
      });
      if (this.files.length > 0) this.selected = this.files[0];
    });
  }

  open() {
    this.dialogRef.close(this.selected);
  }
}
