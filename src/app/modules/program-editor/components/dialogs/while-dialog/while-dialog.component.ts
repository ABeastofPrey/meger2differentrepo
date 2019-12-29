import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../../core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-while-dialog',
  templateUrl: './while-dialog.component.html',
  styleUrls: ['./while-dialog.component.css'],
})
export class WhileDialogComponent implements OnInit {
  
  dialogForm = new FormGroup({
    expression: new FormControl('',ctrl=>{
      if ((ctrl.value as string).length > 0) return null;
      return { invalidExpression: true };
    })
  });

  constructor(
    public dataService: DataService,
    private dialogRef: MatDialogRef<WhileDialogComponent, string>
  ) {}

  ngOnInit() {}

  insert() {
    if (this.dialogForm.invalid) return;
    const val = this.dialogForm.controls['expression'].value as string;
    this.dialogRef.close(val);
  }
}
