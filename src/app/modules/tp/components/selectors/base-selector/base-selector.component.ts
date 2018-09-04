import { Component, OnInit} from '@angular/core';
import {DataService} from '../../../../core';

@Component({
  selector: 'base-selector',
  templateUrl: './base-selector.component.html',
  styleUrls: ['./base-selector.component.css']
})
export class BaseSelectorComponent implements OnInit {

  constructor(
    public dataService: DataService
  ) { }
  
  ngOnInit() {
    
  }

}
