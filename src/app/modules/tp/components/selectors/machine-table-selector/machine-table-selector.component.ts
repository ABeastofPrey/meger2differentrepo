import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core';
import { Input } from '@angular/core';

@Component({
  selector: 'machine-table-selector',
  templateUrl: './machine-table-selector.component.html',
  styleUrls: ['./machine-table-selector.component.css'],
})
export class MachineTableSelectorComponent implements OnInit {
  @Input('disabled') disabled: boolean;

  constructor(public dataService: DataService) {}

  ngOnInit() {}
}
