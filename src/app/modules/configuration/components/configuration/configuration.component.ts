import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  
  tabs = [
    { path: 'diagnostics', label: 'Diagnostics', icon: 'dvr'},
    { path: 'robots', label: 'Robots', icon: 'group_work'},
    { path: 'io', label: 'I/O', icon: 'compare_arrows'},
    { path: 'gui-settings', label: 'User Interface', icon: 'settings_applications'},
    { path: 'users', label: 'User Manager', icon: 'security'}
  ];

  constructor() { }

  ngOnInit() {
  }

}
