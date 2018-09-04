import { Component, OnInit} from '@angular/core';
import {DataService} from '../../../../core';


@Component({
  selector: 'frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.css']
})
export class FrameSelectorComponent implements OnInit {

  constructor(
    public dataService: DataService
  ) { }
  
  ngOnInit() {
    
  }

}
