import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardRoutes } from '../../dashboard-routes';

@Component({
  selector: 'dashboard-screen',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  private words: {};
  
  tabs: Array<{
    path: string;
    label: string;
    icon: string;
  }> = [];

  constructor(
    private trn: TranslateService
  ) {
    this.tabs = [
      { path: DashboardRoutes.Recording, label: 'dashboard.tab2', icon: 'show_chart' },
      { path: DashboardRoutes.Dashboard, label: 'dashboard.tab1', icon: 'assessment' },
      { path: DashboardRoutes.Trace, label: 'dashboard.tab3', icon: 'gps_fixed' }
    ];
  }

  ngOnInit() {
    this.trn.get(['dashboard.err_file', 'dismiss']).subscribe(words => {
      this.words = words;
    });
  }
}
