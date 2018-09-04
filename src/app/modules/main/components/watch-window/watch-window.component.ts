import { Component, OnInit } from '@angular/core';
import {WatchService} from '../../../../modules/core/services/watch.service';

@Component({
  selector: 'watch-window',
  templateUrl: './watch-window.component.html',
  styleUrls: ['./watch-window.component.css']
})
export class WatchWindowComponent implements OnInit {

  constructor(public watch:WatchService) { }

  ngOnInit() {
  }

}
