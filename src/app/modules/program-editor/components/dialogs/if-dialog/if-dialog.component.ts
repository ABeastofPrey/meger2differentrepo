import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../../core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-if-dialog',
  templateUrl: './if-dialog.component.html',
  styleUrls: ['./if-dialog.component.css'],
})
export class IfDialogComponent implements OnInit {

  dialogForm = new FormGroup({
    elseFlag: new FormControl(false),
    expression: new FormControl('',ctrl=>{
      if ((ctrl.value as string).length > 0) {
        return null;
      }
      return {
        invalidExpression: true
      };
    })
  });

  constructor(
    public dataService: DataService,
    private dialogRef: MatDialogRef<IfDialogComponent>
  ) {}

  ngOnInit() {}

  insert() {
    this.dialogRef.close({
      expression: this.dialogForm.controls['expression'].value,
      else: this.dialogForm.controls['elseFlag'].value
    });
  }
}
