import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'tp-dialog',
  templateUrl: './tp-dialog.component.html',
  styleUrls: ['./tp-dialog.component.css'],
})
export class TpDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TpDialogComponent, number>,
    @Inject(MAT_DIALOG_DATA) public data: {
      msg: string,
      action1: string,
      action2: string,
      action3: string
    }
  ) {}

  ngOnInit() {}

  action(i: number) {
    this.dialogRef.close(i);
  }
}
