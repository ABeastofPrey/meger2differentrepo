import { Component, OnInit } from '@angular/core';
import {ChangeDetectionStrategy} from '@angular/core';
import {TreeNode} from '../models/tree-node.model';
import {Input} from '@angular/core';
import {SimulatorService} from '../services/simulator.service';

@Component({
  selector: 'object-properties',
  templateUrl: './object-properties.component.html',
  styleUrls: ['./object-properties.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectPropertiesComponent implements OnInit {
  
  @Input() lastSelectedNode: TreeNode;

  constructor(public sim: SimulatorService) { }

  ngOnInit() {
  }

}
