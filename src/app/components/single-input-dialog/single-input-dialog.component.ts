import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-single-input-dialog',
  templateUrl: './single-input-dialog.component.html',
  styleUrls: ['./single-input-dialog.component.css'],
})
export class SingleInputDialogComponent implements OnInit {
  val: any = null;

  constructor(
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data.initialValue) this.val = this.data.initialValue;
  }

  get isValOk() {
    return this.val && (this.val.length || !isNaN(this.val));
  }

  create() {
    if (this.isValOk) this.dialogRef.close(this.val);
  }
}
