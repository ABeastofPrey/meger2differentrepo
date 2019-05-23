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
  private _menuExpanded: boolean = true;
  
  get menuExpanded() : boolean {
    return this._menuExpanded;
  }
  
  toggleMenu() {
    this.controlsAnimating.emit(true);
    this._menuExpanded = !this._menuExpanded;
    setTimeout(()=>{
      this.controlsAnimating.emit(false);
    },300);
  }
  
  private _screens : ControlStudioScreen[] = [
    {icon: 'home', name:'home', permission: 99, url: ''},
    {icon: 'insert_chart', name:'dashboard', permission: 99, url: 'dashboard'},
    {icon: 'insert_comment', name:'editor', permission: 99, url: 'projects'},
    {icon: '3d_rotation', name:'simulator', permission: 1, url: 'simulator',requiresTpLib: true},
    {icon: 'touch_app', name:'teach', permission: 99, url: 'teach',requiresTpLib: true},
    //{icon: 'insert_comment', name:'blockly', permission: 1, url: 'blockly'},
    {icon: 'settings', name:'configuration', permission: 99, url: 'configuration'},
    {icon: 'playlist_play', name:'task', permission: 1, url: 'tasks'},
    {icon: 'apps', name:'tools', permission: 1, url: 'tools'},
    {icon: 'error', name:'history', permission: 0, url: 'errors'},
    {icon: 'list', name:'log', permission: 1, url: 'log'},
    {icon: 'help_outline', name:'help', permission: 99, url: 'help'}
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
    this.trn.get(['restore.success','home.addFeature.success']).subscribe(words=>{
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
          msg = 'Robot configuration was changed succesfully!';
          break;
        case 'restore':
          msg = this.words['restore.success'];
          break;
        case 'feature':
          msg = this.words['home.addFeature.success'];
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
