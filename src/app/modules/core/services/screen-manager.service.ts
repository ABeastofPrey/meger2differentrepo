import { Injectable, EventEmitter } from '@angular/core';
import { LoginService } from './login.service';
import { TpStatService } from './tp-stat.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SuccessDialogComponent } from '../../../components/success-dialog/success-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './common.service';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable()
export class ScreenManagerService {
  openedControls: boolean = false;
  controlsAnimating: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private tpOnline: boolean = false;
  private words: any;
  private _menuExpanded: boolean;

  get menuExpanded(): boolean {
    return this._menuExpanded;
  }

  toggleMenu() {
    (document.activeElement as HTMLElement).blur();
    this.controlsAnimating.next(true);
    this._menuExpanded = !this._menuExpanded;
    setTimeout(() => {
      this.controlsAnimating.next(false);
    }, 300);
  }

  private _screens: ControlStudioScreen[] = [
    { icon: 'home', name: 'home', permission: 99, url: '' },
    {
      icon: 'insert_chart',
      name: 'dashboard',
      permission: 99,
      url: 'dashboard',
    },
    { icon: 'insert_comment', name: 'editor', permission: 99, url: 'projects' },
    {
      icon: '3d_rotation',
      name: 'simulator',
      permission: 1,
      url: 'simulator',
      requiresTpLib: true,
    },
    {
      icon: 'touch_app',
      name: 'teach',
      permission: 99,
      url: 'teach',
      requiresTpLib: true,
    },
    //{icon: 'insert_comment', name:'blockly', permission: 1, url: 'blockly'},
    {
      icon: 'settings',
      name: 'configuration',
      permission: 99,
      url: 'configuration',
    },
    { icon: 'playlist_play', name: 'task', permission: 1, url: 'tasks' },
    { icon: 'apps', name: 'tools', permission: 1, url: 'tools' },
    { icon: 'error', name: 'history', permission: 0, url: 'errors' },
    { icon: 'list', name: 'log', permission: 1, url: 'log' },
    { icon: 'help_outline', name: 'help', permission: 99, url: 'help' },
  ];

  get screens(): ControlStudioScreen[] {
    if (!this.login.getCurrentUser().user) return [];
    return this._screens.filter(s => {
      const permission = this.login.getCurrentUser().user.permission;
      if (permission === 99) return true;
      return s.permission >= permission;
    });
  }

  private _screen: ControlStudioScreen = this.screens[0];
  get screen() {
    return this._screen;
  }
  set screen(s: ControlStudioScreen) {
    if (
      typeof s === 'undefined' ||
      (s.requiresTpLib && !this.tpOnline) ||
      (s.autoModeOnly && this.stat.mode !== 'A')
    ) {
      this._screen = this.screens[0];
      this.router.navigateByUrl('/');
    } else this._screen = s;
  }

  toggleControls() {
    this.controlsAnimating.next(true);
    this.openedControls = !this.openedControls;
    if (!this.cmn.isTablet) this.stat.mode = this.openedControls ? 'T1' : 'A';
    setTimeout(() => {
      this.controlsAnimating.next(false);
    }, 300);
  }

  showControls() {
    if (this.openedControls) return;
    this.controlsAnimating.next(true);
    this.openedControls = true;
    this.stat.mode = 'T1';
    setTimeout(() => {
      this.controlsAnimating.next(false);
    }, 300);
  }

  closeControls() {
    if (!this.openedControls) return;
    this.controlsAnimating.next(true);
    this.openedControls = false;
    this.stat.mode = 'A';
    setTimeout(() => {
      this.controlsAnimating.next(false);
    }, 300);
  }

  constructor(
    private login: LoginService,
    private stat: TpStatService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private trn: TranslateService,
    private cmn: CommonService,
    private api: ApiService,
    private container: OverlayContainer
  ) {
    // HANDLE CDK CONTAINER WHEN JOG PANEL IS OPENED
    this.dialog.afterOpened.subscribe(dialog => {
      const data = dialog._containerInstance._config.data;
      if (data && data.enableJog && this.openedControls) {
        const { classList } = this.container.getContainerElement();
        if (!classList.contains('jog-panel-open')) {
          classList.add('jog-panel-open');
          dialog.afterClosed().subscribe(() => {
            classList.remove('jog-panel-open');
          });
        }
      }
    });
    this.controlsAnimating.subscribe(stat => {
      if (!stat) {
        const { classList } = this.container.getContainerElement();
        if (classList.contains('jog-panel-open') && !this.openedControls) {
          classList.remove('jog-panel-open');
        }
      }
    });
    this._menuExpanded = this.cmn.isTablet;
    this.trn
      .get([
        'restore.success',
        'home.addFeature.success',
        'error.firmware_update',
      ])
      .subscribe(words => {
        this.words = words;
      });
    const fromPath = this.router
      .parseUrl(this.router.url)
      .queryParamMap.get('from');
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
      if (fromPath !== 'firmware') {
        this.showFromDialog(msg);
      } else {
        this.api.getPkgdResult().then(result => {
          if (result) {
            this.showFromDialog(msg);
          } else {
            this.dialog.open(ErrorDialogComponent, {
              data: {
                title: this.words['error.firmware_update']['title'],
                message: this.words['error.firmware_update']['msg'],
              },
            });
          }
        });
      }
    }
    this.stat.modeChanged.subscribe((mode: string) => {
      if (mode !== 'T1') {
        if (!this.openedControls) return;
        this.controlsAnimating.next(true);
        setTimeout(() => {
          this.controlsAnimating.next(false);
          if (this.stat.mode === mode) {
            this.openedControls = false;
          }
        }, 300);
      }
      if (
        mode !== 'A' &&
        this.screen.requiresTpLib &&
        !this.stat.onlineStatus.value
      ) {
        this.screen = this.screens[0];
        this.router.navigateByUrl('/');
      }
    });
    this.stat.onlineStatus.subscribe(stat => {
      this.tpOnline = stat;
      if (!stat && this.screen && this.screen.requiresTpLib) {
        this.screen = this.screens[0];
        this.router.navigateByUrl('/');
      }
    });
  }

  private showFromDialog(msg: string) {
    this.dialog.open(SuccessDialogComponent, {
      data: msg,
    });
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}

export interface ControlStudioScreen {
  icon: string;
  name: string;
  permission: number;
  url: string;
  requiresTpLib?: boolean;
  autoModeOnly?: boolean;
}
