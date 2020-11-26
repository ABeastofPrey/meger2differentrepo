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
    time: new FormControl(0)
  });

  dialogSleep = new FormControl(0);

  constructor(
    public dataService: DataService,
    private dialogRef: MatDialogRef<SleepDialogComponent, number>
  ) {}

  ngOnInit() {}

  onValueChange(value){
    this.dialogSleep.setValue(value);
  }

  get isValid(): boolean {
    let valid = this.dialogSleep.value as number > 0;
    return valid;
  }

  insert() {
    // if (this.dialogForm.invalid) return;
    const val = this.dialogSleep.value as number;
    this.dialogRef.close(val);
  }

}
