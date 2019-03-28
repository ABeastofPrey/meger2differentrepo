import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  
  tabs = [
    { path: 'about', label: 'about.title', icon: 'info'},
    { path: 'diagnostics', label: 'diagnostics.title', icon: 'dvr'},
    { path: 'robots', label: 'robots.title', icon: 'group_work'},
    { path: 'io', label: 'I/O', icon: 'compare_arrows'},
    { path: 'topology', label: 'Device Manager', icon: 'device_hub'},
    { path: 'gui-settings', label: 'interface.title', icon: 'settings_applications'},
    { path: 'users', label: 'userManager.title', icon: 'security'}
  ];

  constructor() { }

  ngOnInit() {
  }

}
