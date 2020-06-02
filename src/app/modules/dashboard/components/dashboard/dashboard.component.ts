import { LoginService } from './../../../core/services/login.service';
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
    private trn: TranslateService,
    private login: LoginService
  ) {
    this.tabs.push({ path: DashboardRoutes.Recording, label: 'dashboard.tab2', icon: 'show_chart' });
    if (this.login.isAdmin) {
      this.tabs.push({ path: DashboardRoutes.Dashboard, label: 'dashboard.tab1', icon: 'assessment' });
    }
    this.tabs.push({ path: DashboardRoutes.Trace, label: 'dashboard.tab3', icon: 'gps_fixed' });
  }

  ngOnInit() {
    this.trn.get(['dashboard.err_file', 'dismiss']).subscribe(words => {
      this.words = words;
    });
  }
}
