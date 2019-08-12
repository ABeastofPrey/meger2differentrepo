import { OSUpgradeSuccessDialogComponent } from './../../../components/osupgrade-success-dialog/osupgrade-success-dialog.component';
import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
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
import { UtilsService } from './utils.service';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { OSUpgradeErrorDialogComponent } from './../../../components/osupgrade-error-dialog/osupgrade-error-dialog.component';

@Injectable()
export class ScreenManagerService {
  /**
   * The key to store the upgrade version in the local storage.
   */
  private readonly OSVersion: string = 'osVersion';
  /**
   * The key to store the gui version in the local storage.
   */
  private readonly GUIVersion: string = 'guiVersion';
  /**
   * The key to store the web server version in the local storage.
   */
  private readonly WebServerVersion: string = 'webServerVersion';
  /**
   * The key to store the softMC version in the local storage.
   */
  private readonly SoftMCVersion: string = 'softMCVersion';
  /**
   * The key to store the library version in the local storage.
   */
  private readonly LibraryVersion: string = 'libraryVersion';

  /**
   * The key to get the version string in the translation.
   */
  private readonly Version: string = 'version';

  /**
   * The key to get the title string of success dialog in the translation.
   */
  private readonly SuccessDialogTitle: string = 'successDialogTitle';

  /**
   * The key to get the message string of success dialog in the translation.
   */
  private readonly SuccessDialogMsg: string = 'successDialogMsg';

  /**
   * The key to get the title string of error dialog in the translation.
   */
  private readonly ErrorDialogTitle: string = 'errorDialogTitle';

  /**
   * The key to get the message string of error dialog in the translation.
   */
  private readonly ErrorDialogMsg: string = 'errorDialogMsg';

  /**
   * The file to store OS upgrade version.
   */
  private readonly VERSIONDAT = 'VERSION.DAT';

  /**
   * The query to get softMC version.
   */
  private readonly SoftMCVersionQuery = '?ver';

  /**
   * The query to get web server version.
   */
  private readonly WebServerVersionQuery = 'java_ver';

  /**
   * The query to get library version.
   */
  private readonly LibraryVersionQuery = '?system_version';

  openedControls: boolean = false;
  controlsAnimating: BehaviorSubject<boolean> = new BehaviorSubject(false);
  projectActiveStatusChange: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

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
      requiresInactiveProject: true,
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
      this.isScreenDisabled(s) ||
      (s.requiresTpLib && !this.tpOnline) ||
      (s.autoModeOnly && this.stat.mode !== 'A')
    ) {
      this._screen = this.screens[0];
      this.router.navigateByUrl('/');
    } else {
      this._screen = s;
    }
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

  isScreenDisabled(s: ControlStudioScreen) {
    const tpOnline = this.stat.onlineStatus.value;
    const activeProject = this.projectActiveStatusChange.value;
    const cond1 =
      (s.requiresTpLib && !tpOnline) ||
      (s.autoModeOnly && this.stat.mode !== 'A');
    const cond2 = s.requiresInactiveProject && activeProject;
    switch (s.url) {
      case 'teach':
        return (
          cond1 ||
          cond2 ||
          this.controlsAnimating.value ||
          (this.cmn.isTablet && this.stat.mode !== 'T1')
        );
      default:
        return cond1 || cond2;
    }
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
    private utils: UtilsService,
    private webSocketService: WebsocketService,
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
        'ios.updating_succuss',
        this.Version,
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
        case 'io':
          msg = this.words['ios.updating_succuss'];
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
            if (this.utils.IsKuka) {
              this.showOSUpgradeSuccessDialog();
            } else {
              this.showFromDialog(msg);
            }
          } else {
            if (this.utils.IsKuka) {
              this.showOSUpgradeErrorDialog();
            } else {
              this.dialog.open(ErrorDialogComponent, {
                data: {
                  title: this.words['error.firmware_update']['title'],
                  message: this.words['error.firmware_update']['msg'],
                },
              });
            }
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
      } else {
        if (this.openedControls) return;
        this.controlsAnimating.next(true);
        setTimeout(() => {
          this.controlsAnimating.next(false);
          if (this.stat.mode === mode) {
            this.openedControls = true;
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
    this.projectActiveStatusChange.subscribe(val => {
      if (val && this.screen.requiresInactiveProject) {
        this.screen = this.screens[0];
        this.router.navigateByUrl('/');
      }
    });
    this.router.events.subscribe((e: any) => {
      let navUrl: string = e.urlAfterRedirects;
      if (!navUrl) return;
      if (navUrl === '/') navUrl = '';
      const currScreenUrl = this._screen.url === '/' ? '' : this._screen.url;
      if (
        !navUrl.startsWith(currScreenUrl) ||
        (currScreenUrl === '' && navUrl !== currScreenUrl)
      ) {
        this._screen = this._screens.find(s => {
          const url = s.url === '/' ? '' : s.url;
          if (url === '' && navUrl.substring(1) !== '') return false;
          if (url === navUrl || navUrl.substring(1).startsWith(url)) {
            return true;
          }
          return false;
        });
      }
    });
  }

  /**
   * Show the error dialog if the os upgrade is failed.
   */
  private showOSUpgradeErrorDialog() {
    let dialogData = {
      title: this.words[this.Version][this.ErrorDialogTitle],
      message:
        this.words[this.Version][this.ErrorDialogMsg] +
        localStorage.getItem(this.OSVersion),
      guiVersion: localStorage.getItem(this.GUIVersion),
      webServerVersion: localStorage.getItem(this.WebServerVersion),
      softMCVersion: localStorage.getItem(this.SoftMCVersion),
      libraryVersion: localStorage.getItem(this.LibraryVersion),
    };
    this.dialog.open(OSUpgradeErrorDialogComponent, {
      data: dialogData,
    });
  }

  /**
   * Show the success dialog if the os upgrade is successful.
   */
  private showOSUpgradeSuccessDialog() {
    let isGetRes = false;
    let count = 20;
    const getRes = () => {
      let promises = [
        this.webSocketService.query(this.WebServerVersionQuery),
        this.webSocketService.query(this.SoftMCVersionQuery),
        this.webSocketService.query(this.LibraryVersionQuery),
        this.api.getFile(this.VERSIONDAT),
      ];
      Promise.all(promises).then((results: MCQueryResponse[]) => {
        isGetRes = true;
        for (let i = 0; i < 4; i++) {
          if (!results[3]) {
            this.showOSUpgradeErrorDialog();
            return;
          }

          if (results[i].err) {
            this.showOSUpgradeErrorDialog();
            return;
          }
        }

        this.dialog.open(OSUpgradeSuccessDialogComponent, {
          data: {
            title: this.words[this.Version][this.SuccessDialogTitle],
            msg: this.words[this.Version][this.SuccessDialogMsg] + results[3],
            guiVersion: environment.gui_ver,
            webServerVersion: results[0].result,
            softMCVersion: results[1].result,
            libraryVersion: results[2].result,
          },
        });
        this.router.navigate(['.'], {
          relativeTo: this.route,
          queryParams: {},
        });
      });
    };

    const checkIsGetRes = setInterval(() => {
      if (count === 0 || isGetRes) {
        clearInterval(checkIsGetRes);
      } else {
        getRes();
      }
      console.log(count);
      count--;
    }, 500);
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
  requiresInactiveProject?: boolean;
}
