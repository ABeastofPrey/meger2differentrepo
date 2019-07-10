import { Component, OnInit } from '@angular/core';
import { CoordinatesService } from '../../../core';

@Component({
  selector: 'coordinates-display',
  templateUrl: './coordinates-display.component.html',
  styleUrls: ['./coordinates-display.component.css'],
})
export class CoordinatesDisplayComponent implements OnInit {
  constructor(public service: CoordinatesService) {}

  ngOnInit() {}
}
