import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'],
})
export class ConfigurationComponent implements OnInit {
  tabs: Array<{
    path: string;
    label: string;
    icon: string;
    permission: number;
  }> = [];

  constructor(public login: LoginService) {}

  ngOnInit() {
    this.tabs = [
      { path: 'about', label: 'about.title', icon: 'info', permission: 99 },
      {
        path: 'diagnostics',
        label: 'diagnostics.title',
        icon: 'dvr',
        permission: 99,
      },
      {
        path: 'robots',
        label: 'robots.title',
        icon: 'group_work',
        permission: 0,
      },
      {
        path: 'safety',
        label: 'safety.title',
        icon: 'security',
        permission: 0,
      },
      { path: 'io', label: 'I/O', icon: 'compare_arrows', permission: 99 },
      {
        path: 'gui-settings',
        label: 'interface.title',
        icon: 'settings_applications',
        permission: 99,
      },
      {
        path: 'users',
        label: 'userManager.title',
        icon: 'supervised_user_circle',
        permission: 99,
      },
      {
        path: '3rd-party',
        label: 'legal.title',
        icon: 'copyright',
        permission: 99,
      },
    ];
  }
}
