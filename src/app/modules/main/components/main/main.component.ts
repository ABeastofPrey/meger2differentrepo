import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import {
  NotificationService,
  LoginService,
  WatchService,
  DataService,
  TpStatService,
  CoordinatesService,
  ScreenManagerService,
  WebsocketService,
  ProjectManagerService,
} from '../../../core';
import {
  Router,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
} from '@angular/router';
import { JogSettingsDialogComponent } from '../../../../components/jog-settings-dialog/jog-settings-dialog.component';
import { MatDialog, MatSidenav } from '@angular/material';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { TourService } from 'ngx-tour-md-menu';
import { environment } from '../../../../../environments/environment';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { RobotService } from '../../../core/services/robot.service';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../core/services/common.service';
import { UtilsService } from '../../../core/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        query('.card, .jog-table-container', [
          style({ opacity: 0, transform: 'translateX(-100px)' }),
          stagger(-250, [
            animate(
              '500ms cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'none' })
            ),
          ]),
        ]),
      ]),
      transition(':leave', [
        query('.card, .jog-table-container', [
          style({ opacity: 1, transform: 'none' }),
          stagger(-30, [
            animate(
              '500ms cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 0, transform: 'translateX(-100px)' })
            ),
          ]),
        ]),
      ]),
    ]),
    trigger('fadeSimple', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('500ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class MainComponent implements OnInit {
  isRouterLoading: boolean = false;
  mouseDownIndex: number = 0;
  screenWidth: number;
  tpOnline: boolean = false;
  terminalOpen: boolean = false;
  appName: string = environment.appName;
  lastWindowsZindex = 5;

  @ViewChild('drawer', { static: true }) drawer: MatSidenav;

  private jogButtonPressed: boolean = false;
  private lastKeyDownTime: number = -1;
  private jogInterval: any;
  private motionFlag: boolean = false;
  private words: any;

  public env = environment;

  constructor(
    public notification: NotificationService,
    public login: LoginService,
    public watch: WatchService,
    private router: Router,
    public data: DataService,
    public stat: TpStatService,
    public cooService: CoordinatesService,
    public screenManager: ScreenManagerService,
    private _zone: NgZone,
    public ws: WebsocketService,
    private dialog: MatDialog,
    private tour: TourService,
    public prj: ProjectManagerService,
    private robot: RobotService,
    private trn: TranslateService,
    public cmn: CommonService,
    public utils: UtilsService
  ) {
    this.trn.onLangChange.subscribe(event => {
      this.refreshLang();
    });
    this.refreshLang();
  }

  private refreshLang() {
    this.trn.get(['main.errJog', 'main.jogControlsToggle']).subscribe(words => {
      this.words = words;
    });
  }

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
    });
    this.drawer.openedChange.subscribe(() => {
      window.dispatchEvent(new Event('resize'));
    });
    this.router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this.isRouterLoading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.isRouterLoading = false;
      }
    });
    this.robot.init();
    this.stat.onlineStatus.subscribe(stat => {
      this.tpOnline = stat;
      if (!stat) {
        // TP LIB IS NOT AVAILABLE
        this.screenManager.openedControls = false;
      } else {
        const tourQuestion = localStorage.getItem('tourQuestion');
        if (tourQuestion === null || !tourQuestion) {
          localStorage.setItem('tourQuestion', 'true');
          this.trn.get('main.tour').subscribe(data => {
            this.dialog
              .open(YesNoDialogComponent, {
                data: data,
              })
              .afterClosed()
              .subscribe(ret => {
                if (ret) {
                  this.tour.start();
                }
              });
          });
        }
      }
    });
    this.login.isAuthenticated.subscribe(auth => {
      if (!auth) this.router.navigateByUrl('/login');
    });
    // IF NOT CONNECTED AFTER 2 seconds - redirect...
    setTimeout(() => {
      if (!this.ws.connected) this.router.navigateByUrl('/login');
    }, 2000);
    this._zone.runOutsideAngular(() => {
      document.onmousemove = e => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const x = e.pageX,
          y = e.pageY;
        if (x <= 0 || x >= w || y <= 0 || y >= h) this.mouseUp(null);
      };
    });
  }

  onWindowMoving(el: any) {
    this.lastWindowsZindex++;
    el.style.zIndex = this.lastWindowsZindex;
  }
  
  toggleMenu() {
    if (!this.cmn.isTablet)
      this.screenManager.toggleMenu();
    else
      this.drawer.toggle();
  }

  mouseDown(i: number, e?: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this._zone.runOutsideAngular(() => {
      this.jogButtonPressed = true;
      var diff = 5000;
      if (this.lastKeyDownTime > 0) {
        diff = new Date().getTime() - this.lastKeyDownTime;
      }
      this.lastKeyDownTime = new Date().getTime();
      if (diff < 100) return;
      clearInterval(this.jogInterval);
      this.motionFlag = true;
      this.mouseDownIndex = i;
      this.ws.send('?tp_jog(' + i + ')', true);
      //console.log('jog');
      this.jogInterval = setInterval(() => {
        if (this.motionFlag) {
          this.ws.send('?tp_jog(' + i + ')', true);
          navigator.vibrate(200);
          //console.log('jog');
        } else {
          clearInterval(this.jogInterval);
          this.ws.send('?tp_jog(0)', true);
        }
      }, this.data._refreshCycle);
    });
  }

  mouseUp(e: MouseEvent) {
    let target: HTMLElement = e ? <HTMLElement>e.target : null;
    if (
      target &&
      e.type === 'mouseout' &&
      (target.tagName !== 'TD' && target.tagName !== 'HTML')
    ) {
      return;
    }
    if (this.jogButtonPressed || this.stat.isMoving) {
      this.motionFlag = false;
      this.ws.send('?tp_jog(0)', true);
      clearInterval(this.jogInterval);
    }
    this.jogButtonPressed = false;
    this.mouseDownIndex = 0;
  }

  openJogSettings() {
    this.dialog.open(JogSettingsDialogComponent);
  }

  toggleTerminal() {
    this.terminalOpen = !this.terminalOpen;
  }

  get jogTooltip(): string {
    if (typeof this.words === 'undefined') return null;
    if (!this.tpOnline) return this.words['main.errJog']['lib'];
    if (this.prj.activeProject) return this.words['main.errJog']['project'];
    if (!this.cooService.coosLoaded.value)
      return this.words['main.errJog']['coos'];
    return this.words['main.jogControlsToggle'];
  }
}
