import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../../../core';

@Component({
  selector: 'frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.css'],
})
export class FrameSelectorComponent implements OnInit {
  @Input('disabled') disabled: boolean;

  constructor(public dataService: DataService) {}

  ngOnInit() {}
}
