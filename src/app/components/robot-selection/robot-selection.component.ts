import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { RobotService } from '../../modules/core/services/robot.service';

@Component({
  selector: 'app-robot-selection',
  templateUrl: './robot-selection.component.html',
  styleUrls: ['./robot-selection.component.css'],
})
export class RobotSelectionComponent implements OnInit {
  @ViewChild('model', { static: false }) model: any;

  constructor(
    public robot: RobotService,
    private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit() {}

  update() {
    this.dialogRef.close(this.model.value);
  }
}
