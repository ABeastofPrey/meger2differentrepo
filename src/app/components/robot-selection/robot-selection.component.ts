import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatSelect } from '@angular/material';
import { RobotService } from '../../modules/core/services/robot.service';

@Component({
  selector: 'app-robot-selection',
  templateUrl: './robot-selection.component.html',
  styleUrls: ['./robot-selection.component.css'],
})
export class RobotSelectionComponent implements OnInit {

  @ViewChild('model', { static: false }) model: MatSelect;

  constructor(
    public robot: RobotService,
    private dialogRef: MatDialogRef<RobotSelectionComponent,string>
  ) {}

  ngOnInit() {}

  update() {
    this.dialogRef.close(this.model.value);
  }
}
