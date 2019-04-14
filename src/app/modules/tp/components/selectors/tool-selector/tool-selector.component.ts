import { Component, OnInit} from '@angular/core';
import {DataService} from '../../../../core';
import {Input} from '@angular/core';

@Component({
  selector: 'tool-selector',
  templateUrl: './tool-selector.component.html',
  styleUrls: ['./tool-selector.component.css']
})
export class ToolSelectorComponent implements OnInit {
  
  @Input('disabled') disabled: boolean;

  constructor(
    public dataService: DataService
  ) { }
  
  ngOnInit() {
    
  }

}
