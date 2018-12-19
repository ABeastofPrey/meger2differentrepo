import { Component, OnInit, ViewChild } from '@angular/core';
import {RobotService} from '../../../core/services/robot.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-robot-selection',
  templateUrl: './robot-selection.component.html',
  styleUrls: ['./robot-selection.component.css']
})
export class RobotSelectionComponent implements OnInit {
  
  @ViewChild('model') model: any;

  constructor(public robot: RobotService, private dialogRef: MatDialogRef<any>) { }

  ngOnInit() {
  }
  
  update() {
    this.dialogRef.close(this.model.value);
  }

}
