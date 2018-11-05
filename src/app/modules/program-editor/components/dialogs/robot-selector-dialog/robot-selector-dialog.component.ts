import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'robot-selector-dialog',
  templateUrl: './robot-selector-dialog.component.html',
  styleUrls: ['./robot-selector-dialog.component.css']
})
export class RobotSelectorDialogComponent implements OnInit {
  
  motionElement : string = null;
  advancedMode : boolean = false;

  constructor(
    public dataService : DataService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data.must)
      this.advancedMode = true;
  }
  
  cancel() {
    this.dialogRef.close();
  }
  
  insert() {
    this.dialogRef.close(this.motionElement ? this.motionElement : 'NULL');
  }

}