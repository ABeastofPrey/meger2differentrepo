import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-call-dialog',
  templateUrl: './call-dialog.component.html',
  styleUrls: ['./call-dialog.component.css']
})
export class CallDialogComponent implements OnInit {
  
  expression : string = null;

  constructor(
    public dataService : DataService,
    private dialogRef: MatDialogRef<string>
  ) { }

  ngOnInit() {
  }
  
  insert() {
    this.dialogRef.close(this.expression);
  }

}
