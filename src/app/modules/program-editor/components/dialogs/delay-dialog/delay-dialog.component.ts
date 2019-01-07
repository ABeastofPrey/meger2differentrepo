import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-delay-dialog',
  templateUrl: './delay-dialog.component.html',
  styleUrls: ['./delay-dialog.component.css']
})
export class DelayDialogComponent implements OnInit {
  
  motionElement : string;
  delay : number = 4;
  advancedMode : boolean = false;

  constructor(
    public dataService : DataService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }
  
  cancel() {
    this.dialogRef.close();
  }
  
  insert() {
    let cmd = 'Delay ';
    if (this.motionElement)
      cmd += this.motionElement; // it's already appended with ' '
    cmd += this.delay;
    this.dialogRef.close(cmd);
  }

}
