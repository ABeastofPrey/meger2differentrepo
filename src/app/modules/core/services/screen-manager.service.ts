import { Injectable, EventEmitter } from '@angular/core';
import {LoginService} from './login.service';
import {TpStatService} from './tp-stat.service';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';
import {SuccessDialogComponent} from '../../../components/success-dialog/success-dialog.component';
import {TranslateService} from '@ngx-translate/core';
import {CommonService} from './common.service';

@Injectable()
export class ScreenManagerService {
  
  openedControls: boolean = false;
  controlsAnimating: EventEmitter<boolean> = new EventEmitter();
  
  private tpOnline: boolean = false;
  private words: any;
  
  private _screens : ControlStudioScreen[] = [
    {icon: 'home', name:'Home', permission: 99, url: ''},
    {icon: 'insert_chart', name:'Motion Dashboard', permission: 99, url: 'dashboard'},
    {icon: 'insert_comment', name:'Project Editor', permission: 99, url: 'projects'},
    {icon: '3d_rotation', name:'3D Simulator', permission: 1, url: 'simulator',requiresTpLib: true},
    {icon: 'touch_app', name:'Teach', permission: 99, url: 'teach',requiresTpLib: true},
    //{icon: 'insert_comment', name:'Graphic Editor', permission: 1, url: 'blockly'},
    {icon: 'settings', name:'System Configuration', permission: 99, url: 'configuration'},
    {icon: 'playlist_play', name:'Task Manager', permission: 1, url: 'tasks'},
    {icon: 'apps', name:'softMC Tools', permission: 1, url: 'tools'},
    {icon: 'error', name:'Error History', permission: 0, url: 'errors'},
    {icon: 'list', name:'Log', permission: 1, url: 'log'},
    {icon: 'help_outline', name:'Help', permission: 99, url: 'help'}
  ];
  
  get screens() : ControlStudioScreen[]{
    if (!this.login.getCurrentUser().user)
      return [];
    return this._screens.filter(s=>{
      const permission = this.login.getCurrentUser().user.permission;
      if (permission === 99)
        return true;
      return s.permission >= permission;
    });
  }
  
  private _screen: ControlStudioScreen = this.screens[0];
  get screen() {
    return this._screen;
  }
  set screen(s:ControlStudioScreen) {
    if (typeof s === 'undefined' || (s.requiresTpLib && !this.tpOnline) ||
       (s.autoModeOnly && this.stat.mode !== 'A')
    ) {
      this._screen = this.screens[0];
      this.router.navigateByUrl('/');
    } else 
      this._screen = s;
  }
  
  toggleControls() {
    this.controlsAnimating.emit(true);
    this.openedControls = !this.openedControls;
    if (!this.cmn.isTablet)
      this.stat.mode = this.openedControls ? 'T1' : 'A';
    setTimeout(()=>{
      this.controlsAnimating.emit(false);
    },300);
  }
  
  showControls() {
    if (this.openedControls)
      return;
    this.controlsAnimating.emit(true);
    this.openedControls = true;
    this.stat.mode = 'T1';
    setTimeout(()=>{
      this.controlsAnimating.emit(false);
    },300);
  }
  
  closeControls() {
    if (!this.openedControls)
      return;
    this.controlsAnimating.emit(true);
    this.openedControls = false;
    this.stat.mode = 'A';
    setTimeout(()=>{
      this.controlsAnimating.emit(false);
    },300);
  }

  constructor(
    private login : LoginService,
    private stat: TpStatService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private trn: TranslateService,
    private cmn: CommonService
  ){
    this.trn.get(['restore.success']).subscribe(words=>{
      this.words = words;
    });
    const fromPath = this.router.parseUrl(this.router.url).queryParamMap.get('from');
    if (fromPath) {
      let msg = '';
      switch (fromPath) {
        case 'firmware':
          msg = 'Firmware update was done succesfully!';
          break;
        case 'robot':
          msg = 'Robot configuration was changed succesfully!'
          break;
        case 'restore':
          msg = this.words['restore.success']
          break;
      }
      this.dialog.open(SuccessDialogComponent,{
        data: msg
      });
      this.router.navigate(['.'],{
        relativeTo: this.route,
        queryParams: {}
      });
    }
    this.stat.modeChanged.subscribe(mode=>{
      if (mode !== 'T1') {
        if (!this.openedControls)
          return;
        this.controlsAnimating.emit(true);
        this.openedControls = false;
        setTimeout(()=>{
          this.controlsAnimating.emit(false);
        },300);
      }
      if (mode !== 'A' && this.screen.requiresTpLib && !this.stat.onlineStatus.value) {
        this.screen = this.screens[0];
        this.router.navigateByUrl('/');
      }
    });
    this.stat.onlineStatus.subscribe(stat=>{
      this.tpOnline = stat;
      if (!stat && this.screen && this.screen.requiresTpLib) {
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
  requiresTpLib?: boolean,
  autoModeOnly?: boolean
}
