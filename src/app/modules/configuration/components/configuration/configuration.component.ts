import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../../core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  
  tabs = [
    { path: 'about', label: 'about.title', icon: 'info', permission:99},
    { path: 'diagnostics', label: 'diagnostics.title', icon: 'dvr', permission:99},
    { path: 'robots', label: 'robots.title', icon: 'group_work', permission:0},
    { path: 'io', label: 'I/O', icon: 'compare_arrows', permission:99},
    { path: 'topology', label: 'topology.title', icon: 'device_hub', permission: 99},
    { path: 'gui-settings', label: 'interface.title', icon: 'settings_applications', permission:99},
    { path: 'users', label: 'userManager.title', icon: 'security', permission:99},
    { path: '3rd-party', label: 'legal.title', icon: 'copyright', permission:99},
  ];

  constructor(public login: LoginService) { }

  ngOnInit() {
  }

}
