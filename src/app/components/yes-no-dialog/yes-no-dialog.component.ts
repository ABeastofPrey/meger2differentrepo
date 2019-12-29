import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-yes-no-dialog',
  templateUrl: './yes-no-dialog.component.html',
  styleUrls: ['./yes-no-dialog.component.css'],
})
export class YesNoDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<YesNoDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: {
      caution: boolean,
      title: string,
      msg: string,
      yes: string,
      no: string,
      warnBtn: boolean
    }
  ) {}

  ngOnInit() {}

  yes() {
    this.dialogRef.close(true);
  }

  no() {
    this.dialogRef.close(false);
  }
}
