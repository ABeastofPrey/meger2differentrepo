import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-sub-dialog',
  templateUrl: './sub-dialog.component.html',
  styleUrls: ['./sub-dialog.component.css']
})
export class SubDialogComponent implements OnInit {

  name : string = null;

  constructor(
    public dataService : DataService,
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit() {
  }
  
  insert() {
    this.dialogRef.close(this.name);
  }

}
