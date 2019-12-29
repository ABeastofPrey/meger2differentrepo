import { Component, OnInit } from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {trigger, transition, style, animate} from '@angular/animations';
import {MatDialog} from '@angular/material';
import {NewDashboardDialogComponent} from '../new-dashboard-dialog/new-dashboard-dialog.component';

@Component({
  selector: 'app-dashboard-screen',
  templateUrl: './dashboard-screen.component.html',
  styleUrls: ['./dashboard-screen.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.2s', style({ opacity: '1' })),
      ]),
      transition(':leave', [
        style({ opacity: '1' }),
        animate('.2s', style({ opacity: '0' })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('.2s ease-in', style({ transform: 'scale(1)' })),
      ])
    ]),
  ],
})
export class DashboardScreenComponent implements OnInit {
  
  init = false;

  constructor(
    public dashboard: DashboardService,
    private dialog: MatDialog
  ) { }
  
  add() {
    const ref = this.dialog.open(NewDashboardDialogComponent);
    ref.afterClosed().subscribe(ret => {
      if (ret) this.dashboard.add(ret);
    });
  }
  

  ngOnInit() {
  }
  
  ngAfterViewInit() {
    setTimeout(()=>{
      this.init = true;
    },0);
  }

}
