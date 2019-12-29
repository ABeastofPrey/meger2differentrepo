import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../../core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-call-dialog',
  templateUrl: './call-dialog.component.html',
  styleUrls: ['./call-dialog.component.css'],
})
export class CallDialogComponent implements OnInit {
  
  dialogForm = new FormGroup({
    expression: new FormControl('',ctrl=>{
      if ((ctrl.value as string).length > 0) return null;
      return { invalidExpression: true };
    })
  });

  constructor(
    public dataService: DataService,
    private dialogRef: MatDialogRef<CallDialogComponent, string>
  ) {}

  ngOnInit() {}

  insert() {
    if (this.dialogForm.invalid) return;
    const val = this.dialogForm.controls['expression'].value as string;
    this.dialogRef.close(val);
  }
}
