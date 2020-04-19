import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../../core';

@Component({
  selector: 'app-proceed-dialog',
  templateUrl: './proceed-dialog.component.html',
  styleUrls: ['./proceed-dialog.component.css'],
})
export class ProceedDialogComponent implements OnInit {

  motionElement: string = null;
  proceedType: string = null;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<ProceedDialogComponent, string>
  ) {}

  ngOnInit() {}

  insert() {
    let cmd = 'PROCEED';
    if (this.motionElement) cmd += ' ' + this.motionElement;
    if (this.proceedType) cmd += ' ProceedType=' + this.proceedType;
    this.dialogRef.close(cmd);
  }
}
