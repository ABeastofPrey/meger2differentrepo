import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Input } from '@angular/core';
import { SceneObject, PrimitiveObject } from 'stxsim-ng';
import { SimulatorService } from '../../core/services/simulator.service';

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

  onColorChange(e: string) {
    const color = e.substring(1);
    (this.lastSelectedNode as PrimitiveObject).color = color;
  }
}
