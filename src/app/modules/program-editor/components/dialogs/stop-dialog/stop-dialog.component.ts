import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-stop-dialog',
  templateUrl: './stop-dialog.component.html',
  styleUrls: ['./stop-dialog.component.css']
})
export class StopDialogComponent implements OnInit {
  
  motionElement: string = null;
  stopType: string = null;

  constructor(
    public dataService : DataService,
    public dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit() {
  }
  
  insert() {
    let cmd = 'STOP';
    if (this.motionElement) cmd += ' ' + this.motionElement;
    if (this.stopType) cmd += ' StopType=' + this.stopType;
    this.dialogRef.close(cmd);
  }

}
