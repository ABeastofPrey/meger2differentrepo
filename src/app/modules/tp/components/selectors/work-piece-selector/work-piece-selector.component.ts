import { Component, OnInit } from '@angular/core';
import {DataService} from '../../../../core';

@Component({
  selector: 'work-piece-selector',
  templateUrl: './work-piece-selector.component.html',
  styleUrls: ['./work-piece-selector.component.css']
})
export class WorkPieceSelectorComponent implements OnInit {

  constructor(
    public dataService: DataService
  ) { }

  ngOnInit() {
  }

}
