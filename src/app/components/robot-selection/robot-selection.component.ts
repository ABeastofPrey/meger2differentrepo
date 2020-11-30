import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { RobotService } from '../../modules/core/services/robot.service';

@Component({
  selector: 'app-robot-selection',
  templateUrl: './robot-selection.component.html',
  styleUrls: ['./robot-selection.component.css'],
})
export class RobotSelectionComponent implements OnInit {

  @ViewChild('model') model: MatSelect;

  constructor(
    public robot: RobotService,
    private dialogRef: MatDialogRef<RobotSelectionComponent,string>
  ) {}

  ngOnInit() {}

  update() {
    this.dialogRef.close(this.model.value);
  }
}
