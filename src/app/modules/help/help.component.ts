import { Component, OnInit } from '@angular/core';
import {TourService} from 'ngx-tour-md-menu';
import {TpStatService} from '../core';
import {environment} from '../../../environments/environment';
import {MatDialog} from '@angular/material';
import {ShortcutsComponent} from './components/shortcuts/shortcuts.component';

@Component({
  selector: 'help-screen',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  
  online: boolean = false;
  appName: string = environment.appName;

  constructor(
    private tour: TourService,
    private stat: TpStatService,
    private dialog: MatDialog
  ) {
  }
  
  startTour() {
    if (this.online)
      this.tour.start();
  }

  ngOnInit() {
    this.stat.onlineStatus.subscribe(stat=>{
      this.online = stat;
    });
  }
  
  showShortcuts() {
    this.dialog.open(ShortcutsComponent);
  }

}
