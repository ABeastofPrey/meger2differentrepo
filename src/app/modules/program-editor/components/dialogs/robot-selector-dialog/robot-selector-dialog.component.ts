import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../../core';

@Component({
  selector: 'robot-selector-dialog',
  templateUrl: './robot-selector-dialog.component.html',
  styleUrls: ['./robot-selector-dialog.component.css'],
})
export class RobotSelectorDialogComponent implements OnInit {
  motionElement: string = null;
  advancedMode = false;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<RobotSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      must: boolean,
      title: string
    }
  ) {}

  ngOnInit() {
    if (this.data.must) this.advancedMode = true;
  }

  cancel() {
    this.dialogRef.close();
  }

  insert() {
    this.dialogRef.close(this.motionElement ? this.motionElement : 'NULL');
  }
}
