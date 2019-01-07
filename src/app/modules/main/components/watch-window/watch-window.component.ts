import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {WatchService} from '../../../../modules/core/services/watch.service';

@Component({
  selector: 'watch-window',
  templateUrl: './watch-window.component.html',
  styleUrls: ['./watch-window.component.css']
})
export class WatchWindowComponent implements OnInit {
  
  @ViewChild('context') context: ElementRef;

  constructor(public watch:WatchService) { }

  ngOnInit() {
  }
  
  onBlur() {
    if (document.activeElement === this.context.nativeElement)
      return;
    this.watch.addVar();
  }

}
