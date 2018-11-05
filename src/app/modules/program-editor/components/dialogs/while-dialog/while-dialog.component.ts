import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-while-dialog',
  templateUrl: './while-dialog.component.html',
  styleUrls: ['./while-dialog.component.css']
})
export class WhileDialogComponent implements OnInit {

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
