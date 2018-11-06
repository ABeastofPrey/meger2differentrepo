import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-sleep-dialog',
  templateUrl: './sleep-dialog.component.html',
  styleUrls: ['./sleep-dialog.component.css']
})
export class SleepDialogComponent implements OnInit {
  
  time : number = 0;

  constructor(
    public dataService : DataService,
    private dialogRef: MatDialogRef<string>
  ) { }

  ngOnInit() {
  }
  
  insert() {
    this.dialogRef.close(this.time);
  }

}
