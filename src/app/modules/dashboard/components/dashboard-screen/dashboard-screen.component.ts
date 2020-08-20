import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('container', {static: false}) container: ElementRef;
  
  init = false;

  constructor(
    public dashboard: DashboardService,
    private dialog: MatDialog
  ) { }
  
  add() {
    const ref = this.dialog.open(NewDashboardDialogComponent);
    ref.afterClosed().subscribe(ret => {
      const el = this.container.nativeElement as HTMLElement;
      const last = el.lastChild as HTMLElement;
      if (ret && this.dashboard.add(ret) && this.container) {
        setTimeout(()=>{
          if (!last || !last.firstChild) return;
          const translate = (last.firstChild as HTMLElement).style.transform;
          const parts = translate.match(/translate\((\d+)px, *(\d+)px\)/);
          if (parts[1] && parts[2]) {
            const x = Number(parts[1]) + 24;
            const y = Number(parts[2]) + 24;
            const addedWindow = el.lastChild as HTMLElement;
            const child = addedWindow.firstChild as HTMLElement;
            child.style.transform = `translate(${x}px, ${y}px)`;
            this.dashboard.windows[this.dashboard.windows.length-1].pos = {x, y};
            this.dashboard.save();
          }
        });
      }
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
