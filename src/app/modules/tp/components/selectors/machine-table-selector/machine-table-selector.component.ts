import { Component, OnInit } from '@angular/core';
import {DataService} from '../../../../core';

@Component({
  selector: 'machine-table-selector',
  templateUrl: './machine-table-selector.component.html',
  styleUrls: ['./machine-table-selector.component.css']
})
export class MachineTableSelectorComponent implements OnInit {

  constructor(
    public dataService: DataService
  ) { }

  ngOnInit() {
  }

}
