import { Component, OnInit} from '@angular/core';
import {DataService} from '../../../../core';

@Component({
  selector: 'tool-selector',
  templateUrl: './tool-selector.component.html',
  styleUrls: ['./tool-selector.component.css']
})
export class ToolSelectorComponent implements OnInit {

  constructor(
    public dataService: DataService
  ) { }
  
  ngOnInit() {
    
  }

}
