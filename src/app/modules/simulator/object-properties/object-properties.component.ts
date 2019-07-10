import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Input } from '@angular/core';
import { SimulatorService } from '../services/simulator.service';
import { SceneObject } from 'stxsim-ng';

@Component({
  selector: 'object-properties',
  templateUrl: './object-properties.component.html',
  styleUrls: ['./object-properties.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectPropertiesComponent implements OnInit {
  @Input() lastSelectedNode: SceneObject;

  constructor(public sim: SimulatorService) {}

  ngOnInit() {}
}
