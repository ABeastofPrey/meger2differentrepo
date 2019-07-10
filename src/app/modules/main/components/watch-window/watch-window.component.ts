import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WatchService } from '../../../../modules/core/services/watch.service';

@Component({
  selector: 'watch-window',
  templateUrl: './watch-window.component.html',
  styleUrls: ['./watch-window.component.css'],
})
export class WatchWindowComponent implements OnInit {
  @ViewChild('context', { static: false }) context: ElementRef;

  constructor(public watch: WatchService) {}

  ngOnInit() {}

  onBlur(v, e?: KeyboardEvent) {
    if (e) {
      (<HTMLElement>e.target).blur();
      return;
    }
    if (this.watch.addBlankIfNeeded(v)) {
      setTimeout(() => {
        const e = document.getElementById(
          'var-' + (this.watch.vars.length - 1)
        );
        if (e) e.focus();
      }, 0);
    }
  }
}
