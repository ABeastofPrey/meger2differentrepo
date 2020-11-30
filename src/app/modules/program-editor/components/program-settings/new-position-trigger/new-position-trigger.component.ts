import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './new-position-trigger.component.html',
  styleUrls: ['./new-position-trigger.component.scss'],
})
export class NewPositionTriggerComponent implements OnInit {
  namePrefix = 'PT_';
  name: string = '';

  constructor(public dialogRef: MatDialogRef<NewPositionTriggerComponent, string>) {}

  ngOnInit(): void {}

  public close(): void {
    this.dialogRef.close(this.namePrefix + this.name);
  }
}
