import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Input } from '@angular/core';
import { SceneObject, PrimitiveObject } from 'stxsim-ng';
import { SimulatorService } from '../../core/services/simulator.service';
import {DataService} from '../../core';

@Component({
  selector: 'object-properties',
  templateUrl: './object-properties.component.html',
  styleUrls: ['./object-properties.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectPropertiesComponent implements OnInit {

  @Input() lastSelectedNode: SceneObject;

  constructor(
    public sim: SimulatorService,
    public data: DataService
  ) {}

  ngOnInit() {}

  onColorChange(e: string) {
    const color = e.substring(1);
    const el = this.lastSelectedNode as PrimitiveObject;
    el.color = color;
    if (el.name.startsWith('Pallet_')) {
      localStorage.setItem('color_' + el.name, color);
    }
  }

  get pallet() {
    const n = this.lastSelectedNode.name;
    if (!n.startsWith('Pallet_')) return null;
    const i = Number(n.split('_')[1]);
    return this.data.pallets[i];
  }

  onValueChanged($event,field1,field2,keyboardContext: any){
    this.lastSelectedNode[field1][field2] = $event;
    keyboardContext && (keyboardContext.setControlValue(this.lastSelectedNode[field1][field2]));
  }

}
