import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-new-project-dialog',
  templateUrl: './new-project-dialog.component.html',
  styleUrls: ['./new-project-dialog.component.css'],
})
export class NewProjectDialogComponent implements OnInit {
  fileName: string;

  constructor(public dialogRef: MatDialogRef<any>) {}

  create() {
    this.dialogRef.close(this.fileName.toUpperCase());
  }

  ngOnInit() {
    this.fileName = '';
  }
}
