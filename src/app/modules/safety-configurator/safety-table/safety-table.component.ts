import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SafetyConfiguration } from '../../configuration/components/configuration/model/configuration.model';

@Component({
  selector: 'safety-table',
  templateUrl: './safety-table.component.html',
  styleUrls: ['./safety-table.component.css']
})
export class SafetyTableComponent implements OnInit {

  @Input() conf: SafetyConfiguration;
  @Input() disabled: boolean;

  @Output() change: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
