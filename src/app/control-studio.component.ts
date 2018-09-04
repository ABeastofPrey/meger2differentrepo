import { Component } from '@angular/core';
import {fadeAnimation} from './fade.animation';
import {LoginService} from './modules/core';
import {TourService} from 'ngx-tour-md-menu';

@Component({
  selector: 'control-studio',
  templateUrl: './control-studio.component.html',
  styleUrls: ['./control-studio.component.css'],
  animations: [fadeAnimation]
})
export class ControlStudioComponent {
  
  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
  
  constructor(private login: LoginService, private tour: TourService) {
    let steps = [
      {
        anchorId: 'menu',
        title: 'Navigation Menu',
        content: 'This button shows/hides the navigation menu',
        enableBackdrop: true,
      },
      {
        anchorId: 'jog-controls',
        title: 'Jog Controls',
        content: "This button shows/hides the JOG controls. This feature will be disabled while TP.LIB isn't loaded.",
        enableBackdrop: true
      },
      {
        anchorId: 'watch',
        title: 'Watch Window',
        content: "This button shows/hides the WATCH window. This window can be used to monitor system and program variables.",
        enableBackdrop: true
      },
      {
        anchorId: 'message-log-button',
        title: 'Message Log',
        content: "This button shows/hides the MESSAGE LOG window. Here you can see informative messages sent from the controller.",
        enableBackdrop: true
      },
      {
        anchorId: 'message-log',
        title: 'Message Log',
        content: "When you're at the home screen, messages will also appear here.",
        enableBackdrop: true,
        route: '/'
      },
      {
        anchorId: 'terminal',
        title: 'Terminal',
        content: "This is the terminal. You can use it to send MC-Basic commands to the controller.",
        enableBackdrop: true
      },
      {
        anchorId: 'sys-info',
        title: 'System Information',
        content: "System information is displayed at the bottom of ths home screen."
      },
    ];
    if (window.innerWidth >= 1024) {
      // ADD STEPS THAT WILL BE ONLY SHOWN IN NORMAL SCREEN RESOLUTIONS
      steps = steps.concat([
        {
          anchorId: 'screen-Motion Dashboard',
          title: 'Motion Dashboard',
          content: "Now, let's take a look at the Motion Dashboard screen.",
          enableBackdrop: true
        },
      ]);
    }
    steps = steps.concat([
      {
        anchorId: 'dashboard-fab',
        title: 'Add a new Dashboard',
        content: "We can use this button to create a new Motion Dashboard window.",
        enableBackdrop: true,
        route: '/dashboard'
      },
      {
        anchorId: 'dashboard-window',
        title: 'Dashboard Window',
        content: "This is a motion dashboard window. You can create a window for each motion element in the system, and drag it around the screen.",
        enableBackdrop: true
      },
      {
        anchorId: 'dashboard-enable',
        title: 'Enable/Disable the robot',
        content: "Use this toggle button to enable and disable the robot.",
        enableBackdrop: true
      },
      {
        anchorId: 'dashboard-expand',
        title: 'Moving the robot',
        content: "Use this panel to perform simple move commands.",
        enableBackdrop: true
      },
      {
        anchorId: 'dashboard-move',
        title: 'Moving the robot',
        content: "Use this panel to perform simple move commands.",
        enableBackdrop: true
      },
      {
        anchorId: 'dashboard-rec',
        title: 'Recorder',
        content: "Use this button to record data in 2D and 3D formats.",
        enableBackdrop: true
      },
    ]);
    if (window.innerWidth >= 1024) {
      // ADD STEPS THAT WILL BE ONLY SHOWN IN NORMAL SCREEN RESOLUTIONS
      steps = steps.concat([
        {
          anchorId: 'screen-Project Editor',
          title: 'Project Editor',
          content: "Now, let's take a look at the Project Editor.",
          enableBackdrop: true,
          route: '/projects'
        },
      ]);
    }
    steps = steps.concat([
      {
        anchorId: 'project-tree',
        title: 'This is the project tree',
        content: "Here you can find all the programs, libraries and configuration files for your project.",
        enableBackdrop: true,
        route: '/projects'
      },
      {
        anchorId: 'project-toolbar-1',
        title: 'Toolbar',
        content: "Use this toolbar to open, edit and execute your project.",
        enableBackdrop: true
      },
      {
        anchorId: 'project-toolbar-2',
        title: 'Toolbar',
        content: "You can also use this toolbar for easier access while programming.",
        enableBackdrop: true
      },
    ]);
    this.tour.initialize(steps);
  }
  
  ngOnInit() {
    this.login.populate();
  }
  
}
