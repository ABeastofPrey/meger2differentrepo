import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'tp-dialog',
  templateUrl: './tp-dialog.component.html',
  styleUrls: ['./tp-dialog.component.css'],
})
export class TpDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  action(i: number) {
    this.dialogRef.close(i);
  }
}
