import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-project-dialog',
  templateUrl: './new-project-dialog.component.html',
  styleUrls: ['./new-project-dialog.component.css'],
})
export class NewProjectDialogComponent implements OnInit {
  
  dialogForm = new FormGroup({
    val: new FormControl('',[Validators.required, Validators.pattern('[a-zA-Z]+(\\w*)$'),Validators.maxLength(32)])
  });

  constructor(public dialogRef: MatDialogRef<NewProjectDialogComponent, string>) {}

  create() {
    if (this.dialogForm.invalid) return;
    const name = this.dialogForm.controls['val'].value as string;
    this.dialogRef.close(name.toUpperCase());
  }

  public change(value: string): void {
    this.dialogForm.controls.val.setValue(value);
    this.dialogForm.controls.val.markAsTouched();
  }

  ngOnInit() {
  }
}
