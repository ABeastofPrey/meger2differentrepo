import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../../core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-sleep-dialog',
  templateUrl: './sleep-dialog.component.html',
  styleUrls: ['./sleep-dialog.component.css'],
})
export class SleepDialogComponent implements OnInit {

  dialogForm = new FormGroup({
    time: new FormControl(0, ctrl=>{
      if ((ctrl.value as number) > 0) return null;
      return { invalidExpression: true };
    })
  });

  constructor(
    public dataService: DataService,
    private dialogRef: MatDialogRef<SleepDialogComponent, number>
  ) {}

  ngOnInit() {}

  insert() {
    if (this.dialogForm.invalid) return;
    const val = this.dialogForm.controls['time'].value as number;
    this.dialogRef.close(val);
  }
}
