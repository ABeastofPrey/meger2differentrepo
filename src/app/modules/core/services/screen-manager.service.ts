import { OSUpgradeSuccessDialogComponent } from './../../../components/osupgrade-success-dialog/osupgrade-success-dialog.component';
import { environment } from './../../../../environments/environment';
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
   * The query to get the os upgrade version.
   */
  private readonly SoftMCVersionQuery: string = '?ver';

  /**
   * The query to get the os upgrade version.
   */
  private readonly WebServerVersionQuery: string = 'java_ver';

    /**
   * The query to get the os upgrade version.
   */
  private readonly LibraryVersionQuery: string = '?system_version';

  /**
   * The query to get the os upgrade version.
   */
  private readonly OSVersionQuery: string = '?vi_getreleaseversion';

  /**
   * The version query map for different os component.
   */
  private readonly VersionQueryMap: any = {};

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
    private utils: UtilsService,
    private webSocketService: WebsocketService,
    private container: OverlayContainer
  ) {
    this.initVersionQueryMap();

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
        this.Version
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
                  message: this.words['error.firmware_update']['msg']
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

  /**
   * Initialize the version query map.
   */
  private initVersionQueryMap() {
    this.VersionQueryMap[this.OSVersion] = this.OSVersionQuery;
    this.VersionQueryMap[this.SoftMCVersion] = this.SoftMCVersionQuery;
    this.VersionQueryMap[this.WebServerVersion] = this.WebServerVersionQuery;
    this.VersionQueryMap[this.LibraryVersion] = this.LibraryVersionQuery;
  }

  /**
   * Show the error dialog if the os upgrade is failed.
   */
  private showOSUpgradeErrorDialog() {
    let dialogData = {
      title: this.words[this.Version][this.ErrorDialogTitle],
      message: this.words[this.Version][this.ErrorDialogMsg] + localStorage.getItem(this.OSVersion),
      guiVersion: localStorage.getItem(this.GUIVersion),
      webServerVersion: localStorage.getItem(this.WebServerVersion),
      softMCVersion: localStorage.getItem(this.SoftMCVersion),
      libraryVersion: localStorage.getItem(this.LibraryVersion)
    };
    this.dialog.open(OSUpgradeErrorDialogComponent, {
      data: dialogData
    });
  }

  /**
   * Show the success dialog if the os upgrade is successful.
   */
  private showOSUpgradeSuccessDialog() {
    let promises = [
      this.webSocketService.query(this.VersionQueryMap[this.SoftMCVersion]),
      this.webSocketService.query(this.VersionQueryMap[this.WebServerVersion]),
      this.webSocketService.query(this.VersionQueryMap[this.LibraryVersion]),
      this.webSocketService.query(this.VersionQueryMap[this.OSVersion])
    ];
    Promise.all(promises)
      .then((results: MCQueryResponse[]) => {
        this.dialog.open(OSUpgradeSuccessDialogComponent, {
          data: {
            title: this.words[this.Version][this.SuccessDialogTitle],
            msg: this.words[this.Version][this.SuccessDialogMsg] + results[3].result,
            guiVersion: environment.gui_ver,
            webServerVersion: results[1].result,
            softMCVersion: results[0].result,
            libraryVersion: results[2].result
          }
        });
        this.router.navigate(['.'], {
          relativeTo: this.route,
          queryParams: {},
        });
      });
  }

  private showFromDialog(msg: string) {
    this.dialog.open(SuccessDialogComponent, {
      data: {
        msg: msg
      }
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
