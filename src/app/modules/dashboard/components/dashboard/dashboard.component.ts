import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'dashboard-screen',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  private words: any;
  
  tabs: {
    path: string;
    label: string;
    icon: string;
  }[] = [];

  constructor(
    private trn: TranslateService
  ) {
    this.tabs = [
      { path: 'dashboards', label: 'dashboard.tab1', icon: 'assessment' },
      { path: 'recordings', label: 'dashboard.tab2', icon: 'show_chart' }
    ];
  }

  ngOnInit() {
    this.trn.get(['dashboard.err_file', 'dismiss']).subscribe(words => {
      this.words = words;
    });
    /*this.tour.stepShow$.pipe(takeUntil(this.notifier)).subscribe(step => {
        if (step.anchorId === 'dashboard-fab') {
          setTimeout(() => {
            this.dashboard.add({
              name: 'SCARA (Tour)',
              axes: ['A1', 'A2', 'A3', 'A4'],
            });
            this.notifier.next(true);
            this.notifier.unsubscribe();
          }, 200);
        }
      });*/
  }
}
