import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-function-dialog',
  templateUrl: './function-dialog.component.html',
  styleUrls: ['./function-dialog.component.css']
})
export class FunctionDialogComponent implements OnInit {

  name : string = null;
  retType : string = null;

  constructor(
    public dataService : DataService,
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit() {
  }
  
  insert() {
    this.dialogRef.close({name: this.name, type: this.retType});
  }

}
