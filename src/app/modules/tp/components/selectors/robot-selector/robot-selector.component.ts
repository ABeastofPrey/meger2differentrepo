import { Component, OnInit, Input} from '@angular/core';
import {DataService} from '../../../../core';


@Component({
  selector: 'robot-selector',
  templateUrl: './robot-selector.component.html',
  styleUrls: ['./robot-selector.component.css']
})
export class RobotSelectorComponent implements OnInit {
  
  @Input() disabled : boolean;
  @Input() prompt : string;

  constructor(
    public dataService: DataService
  ) { }
  
  ngOnInit() {
    
  }

}
