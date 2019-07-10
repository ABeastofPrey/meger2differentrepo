import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../../core';

@Component({
  selector: 'app-if-dialog',
  templateUrl: './if-dialog.component.html',
  styleUrls: ['./if-dialog.component.css'],
})
export class IfDialogComponent implements OnInit {
  elseFlag: boolean = false;
  expression: string = null;

  constructor(
    public dataService: DataService,
    private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit() {}

  insert() {
    this.dialogRef.close({
      expression: this.expression,
      else: this.elseFlag,
    });
  }
}
