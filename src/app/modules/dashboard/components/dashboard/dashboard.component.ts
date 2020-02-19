import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


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
      { path: 'recordings', label: 'dashboard.tab2', icon: 'show_chart' },
      { path: 'dashboards', label: 'dashboard.tab1', icon: 'assessment' }
    ];
  }

  ngOnInit() {
    this.trn.get(['dashboard.err_file', 'dismiss']).subscribe(words => {
      this.words = words;
    });
  }
}
