import { Component, OnInit } from '@angular/core';
import {CoordinatesService} from '../../../core';

@Component({
  selector: 'coordinates',
  templateUrl: './coordinates.component.html',
  styleUrls: ['./coordinates.component.css']
})
export class CoordinatesComponent implements OnInit {

  constructor(public service: CoordinatesService) { }

  ngOnInit() {
  }

}
