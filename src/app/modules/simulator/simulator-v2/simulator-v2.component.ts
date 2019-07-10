import { Component, OnInit, ViewChild } from '@angular/core';
import { CoordinatesService } from '../../core';
import { SimulatorComponent, SimulatorScene, Box, Cylinder } from 'stxsim-ng';
import { RobotService } from '../../core/services/robot.service';
import { SimulatorService } from '../services/simulator.service';

@Component({
  selector: 'simulator-v2',
  templateUrl: './simulator-v2.component.html',
  styleUrls: ['./simulator-v2.component.css'],
})
export class SimulatorV2Component implements OnInit {
  jointsAsArr: number[];
  showTrace: boolean = false;

  @ViewChild('simulator', { static: false }) simulator: SimulatorComponent;

  constructor(
    public coos: CoordinatesService,
    public robots: RobotService,
    public sim: SimulatorService
  ) {
    this.jointsAsArr = this.coos.jointsAsArr;
    this.coos.positonChange.subscribe(ret => {
      this.jointsAsArr = ret;
    });
  }

  ngOnInit() {
    this.sim.getScene();
  }

  addObject(objType: string) {}
}
