import { Component, OnInit} from '@angular/core';
import {DataService} from '../../../../core';
import {Input} from '@angular/core';

@Component({
  selector: 'base-selector',
  templateUrl: './base-selector.component.html',
  styleUrls: ['./base-selector.component.css']
})
export class BaseSelectorComponent implements OnInit {
  
  @Input('disabled') disabled: boolean;

  constructor(
    public dataService: DataService
  ) { }
  
  ngOnInit() {
    
  }

}
