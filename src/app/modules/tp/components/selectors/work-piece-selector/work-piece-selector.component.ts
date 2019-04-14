import { Component, OnInit } from '@angular/core';
import {DataService} from '../../../../core';
import {Input} from '@angular/core';

@Component({
  selector: 'work-piece-selector',
  templateUrl: './work-piece-selector.component.html',
  styleUrls: ['./work-piece-selector.component.css']
})
export class WorkPieceSelectorComponent implements OnInit {
  
  @Input('disabled') disabled: boolean;

  constructor(
    public dataService: DataService
  ) { }

  ngOnInit() {
  }

}
