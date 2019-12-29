import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../../core';

@Component({
  selector: 'app-delay-dialog',
  templateUrl: './delay-dialog.component.html',
  styleUrls: ['./delay-dialog.component.css'],
})
export class DelayDialogComponent implements OnInit {
  motionElement: string;
  delay = 4;
  advancedMode = false;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<DelayDialogComponent>
  ) {}

  ngOnInit() {}

  cancel() {
    this.dialogRef.close();
  }

  insert() {
    let cmd = 'Delay ';
    if (this.motionElement) cmd += this.motionElement; // it's already appended with ' '
    cmd += this.delay;
    this.dialogRef.close(cmd);
  }
}
