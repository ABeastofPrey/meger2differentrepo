import { Injectable, EventEmitter } from '@angular/core';
import {LoginService} from './login.service';
import {TpStatService} from './tp-stat.service';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';
import {SuccessDialogComponent} from '../../../components/success-dialog/success-dialog.component';

@Injectable()
export class ScreenManagerService {
  
  openedControls: boolean = false;
  controlsAnimating: EventEmitter<boolean> = new EventEmitter();
  
  private tpOnline: boolean = false;
  
  private _screens : ControlStudioScreen[] = [
    {icon: 'home', name:'Home', permission: 1, url: '',requiresTpLib: false},
    {icon: 'insert_chart', name:'Motion Dashboard', permission: 1, url: 'dashboard',requiresTpLib: false},
    {icon: 'insert_comment', name:'Project Editor', permission: 1, url: 'projects',requiresTpLib: false},
    {icon: '3d_rotation', name:'3D Simulator', permission: 1, url: 'simulator',requiresTpLib: true},
    {icon: 'touch_app', name:'Teach', permission: 1, url: 'teach',requiresTpLib: true},
    //{icon: 'insert_comment', name:'Graphic Editor', permission: 1, url: 'blockly'},
    {icon: 'settings', name:'System Configuration', permission: 0, url: 'configuration',requiresTpLib: false},
    {icon: 'insert_drive_file', name:'File Manager', permission: 1, url: 'files',requiresTpLib: false},
    {icon: 'playlist_play', name:'Task Manager', permission: 1, url: 'tasks',requiresTpLib: false},
    {icon: 'apps', name:'softMC Tools', permission: 1, url: 'tools',requiresTpLib: false},
    {icon: 'error', name:'Error History', permission: 0, url: 'errors',requiresTpLib: false},
    {icon: 'list', name:'Log', permission: 0, url: 'log',requiresTpLib: false},
    {icon: 'help_outline', name:'Help', permission: 1, url: 'help',requiresTpLib: false}
  ];
  
  get screens() : ControlStudioScreen[]{
    if (!this.login.getCurrentUser().user)
      return [];
    return this._screens.filter(s=>{
      return s.permission >= this.login.getCurrentUser().user.permission;
    });
  }
  
  private _screen: ControlStudioScreen = this.screens[0];
  get screen() {
    return this._screen;
  }
  set screen(s:ControlStudioScreen) {
    if (s.requiresTpLib && !this.tpOnline) {
      this.screen = this.screens[0];
      this.router.navigateByUrl('/');
    } else 
      this._screen = s;
  }
  
  toggleControls() {
    this.controlsAnimating.emit(true);
    this.openedControls = !this.openedControls;
    setTimeout(()=>{
      this.controlsAnimating.emit(false);
    },300);
  }

  constructor(
    private login : LoginService,
    private stat: TpStatService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ){
    const fromPath = this.router.parseUrl(this.router.url).queryParamMap.get('from');
    if (fromPath && fromPath === 'firmware') {
      this.dialog.open(SuccessDialogComponent,{
        data: 'Firmware update was done succesfully!'
      });
      this.router.navigate(['.'],{
        relativeTo: this.route,
        queryParams: {}
      });
    }
    this.stat.onlineStatus.subscribe(stat=>{
      this.tpOnline = stat;
      if (!stat && this.screen.requiresTpLib) {
        this.screen = this.screens[0];
        this.router.navigateByUrl('/');
      }
    });
  }

}

export interface ControlStudioScreen {
  icon: string,
  name: string,
  permission: number,
  url: string,
  requiresTpLib: boolean
}
