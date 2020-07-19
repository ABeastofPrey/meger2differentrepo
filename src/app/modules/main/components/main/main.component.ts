import { ErrorDialogComponent } from './../../../../components/error-dialog/error-dialog.component';
import { ApiService } from './../../../core/services/api.service';
import { TerminalService } from './../../../home-screen/services/terminal.service';
import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
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
  MCQueryResponse
} from '../../../core';
import {
  Router,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  NavigationEnd,
} from '@angular/router';
import { JogSettingsDialogComponent } from '../../../../components/jog-settings-dialog/jog-settings-dialog.component';
import { MatDialog, MatSidenav } from '@angular/material';
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
import { RecordService } from '../../../core/services/record.service';
import { TpLoadingComponent } from '../../../../components/tp-loading/tp-loading.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SimulatorService } from '../../../core/services/simulator.service';

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
  isRouterLoading = false;
  simLoaded = false;
  mouseDownIndex = 0;
  screenWidth: number;
  tpOnline = false;
  terminalOpen = false;
  simOpen = false;
  appName: string = environment.appName;
  lastWindowsZindex = 5;
  env = environment;
  allowHiddenMenu = false; // Sets if the hidden menu feature is active
  hiddenMenuVisible = false;
  resizing = false; // true while resizing the simulator window
  toolbarShown = true;

  @ViewChild('drawer', { static: true }) drawer: MatSidenav;

  // FLOATING WINDOWS
  @ViewChild('terminalWindow', { static: false }) terminalWindow: ElementRef;
  @ViewChild('notificationWindow', { static: false }) notificationWindow: ElementRef;
  @ViewChild('simWindow', { static: false }) simWindow: ElementRef;
  @ViewChild('watchWindow', { static: false }) watchWindow: ElementRef;

  private jogButtonPressed = false;
  private lastKeyDownTime = -1;
  private jogInterval: number;
  private motionFlag = false;
  private words: {};
  private notifier: Subject<boolean> = new Subject();

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
    public tour: TourService,
    public prj: ProjectManagerService,
    private robot: RobotService,
    private trn: TranslateService,
    public cmn: CommonService,
    public utils: UtilsService,
    public rec: RecordService,
    public sim: SimulatorService,
    public terminal: TerminalService,
    private cd: ChangeDetectorRef,
    private api: ApiService
  ) {
    this.trn.onLangChange.pipe(takeUntil(this.notifier)).subscribe(event => {
      this.refreshLang();
    });
    this.refreshLang();
    this.stat.onlineStatus.pipe(takeUntil(this.notifier)).subscribe(stat => {
      this.tpOnline = stat;
      if (!stat) {
        // TP LIB IS NOT AVAILABLE
        this.screenManager.openedControls.next(false);
      } else {
        this.dialog.open(TpLoadingComponent, {
          disableClose: true,
          height: '300px',
        }).afterClosed().subscribe(ret=>{
          if (!ret || this.utils.IsKuka) return;
          this.cmn.showTourDialog(false, this.prj.currProject.value);
        });
      }
    });
    this.stat.estopChange.pipe(takeUntil(this.notifier)).subscribe(estop=>{
      if (estop) {
        this.motionFlag = false;
        clearInterval(this.jogInterval);
      }
    });
  }

  toggleToolbar() {
    this.toolbarShown = !this.toolbarShown;
    if (this.screenManager.menuExpanded) this.toggleMenu();
  }

  private refreshLang() {
    this.trn.get(['main.errJog', 'main.jogControlsToggle', 'error.space']).subscribe(words => {
      this.words = words;
    });
  }
  
  toggleHiddenMenu() {
    this.hiddenMenuVisible = !this.hiddenMenuVisible;
  }
  closeHiddenMenu() {
    this.hiddenMenuVisible = false;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenWidth = window.innerWidth;
  }

  // ngDoCheck() {
  //   console.log('change!');
  // }

  ngOnInit() {
    this.api.ready.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat) {
        this.api.get('/cs/api/free-space').toPromise().then(free=>{
          if (free < 50 * 1024 * 1024 ) { // < 50MB
            this.dialog.open(ErrorDialogComponent, {
              maxWidth: '400px',
              data: {
                title: this.words['error.space']['title'],
                message: this.words['error.space']['msg'],
              },
            });
          }
        });
      }
    });
    this.tour.stepShow$.pipe(takeUntil(this.notifier)).subscribe(step => {
      if (step === this.tour.steps[4]) {
        this.simOpen = true;
      }
    });
    this.notification.newMessage.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.cd.detectChanges();
    });
    this.allowHiddenMenu = this.cmn.isTablet;
    this.screenWidth = window.innerWidth;
    this.prj.currProject.pipe(takeUntil(this.notifier)).subscribe(prj => {
      if (prj) this.prj.getProjectStatus();
    });
    this.drawer.openedChange.pipe(takeUntil(this.notifier)).subscribe(() => {
      window.dispatchEvent(new Event('resize'));
    });
    this.router.events.pipe(takeUntil(this.notifier)).subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this.isRouterLoading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.isRouterLoading = false;
      } else if (event instanceof NavigationEnd) {
        const conf = localStorage.getItem('floatingSim');
        if (conf) {
          const json: WindowConfiguration = JSON.parse(conf);
          setTimeout(()=>{
            try {
              const el = this.simWindow.nativeElement as HTMLElement;
              this.restoreFloatingWindow(el, json);
            } catch (err) {
            }
          },0);
        }
      }
    });
    this.stat.wackChange.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat && !this.toolbarShown) { // WAITING FOR ACK
        this.toolbarShown = true;
      }
    });
    this.robot.init();
    this.login.isAuthenticated
      .pipe(takeUntil(this.notifier))
      .subscribe(auth => {
        if (!auth) this.router.navigateByUrl('/login');
      });
    // IF NOT CONNECTED AFTER 2 seconds - redirect...
    setTimeout(() => {
      if (!this.ws.connected) return this.router.navigateByUrl('/login');
      if (this.cmn.isTablet) {
        this.ws.query('?tp_ver').then((ret:MCQueryResponse)=>{
          if (ret.err) return this.login.logout();
        });
      }
    }, 2000);
  }

  @HostListener('window:mousemove.out-zone', ['$event'])
  onMouseMove(e: MouseEvent) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = e.pageX,
      y = e.pageY;
    if (x <= 0 || x >= w || y <= 0 || y >= h) {
      this.mouseUp(null);
      return;
    }
    if  (this.jogButtonPressed) {
      const el = e.target as HTMLElement;
      const td = el.closest('td');
      if (td && td.closest('.jog-table')) {
        return;
      }
      this.mouseUp(null);
    }
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  onWindowMoving(el: HTMLElement) {
    this.lastWindowsZindex++;
    el.style.zIndex = this.lastWindowsZindex.toString();
  }

  toggleMenu() {
    if (!this.cmn.isTablet) this.screenManager.toggleMenu();
    else this.drawer.toggle();
    setTimeout(()=>{
      this.cd.detectChanges();
    },200);
  }

  mouseDown(i: number, e?: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this._zone.runOutsideAngular(() => {
      this.jogButtonPressed = true;
      let diff = 5000;
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
      this.jogInterval = window.setInterval(() => {
        if (this.motionFlag && this.stat.enabled) {
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
    const target: HTMLElement = e ? e.target as HTMLElement : null;
    if (
      target && e &&
      e.type === 'mouseout' &&
      (target.tagName !== 'TD' && target.tagName !== 'HTML')
    ) {
      return;
    }
    if (this.stat.mode !== 'T1' && this.stat.mode !== 'T2') return;
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
    if (!this.terminalOpen) return;
    const conf = localStorage.getItem('floatingTerminal');
    if (conf) {
      const json: WindowConfiguration = JSON.parse(conf);
      setTimeout(()=>{
        const el = this.terminalWindow.nativeElement as HTMLElement;
        this.restoreFloatingWindow(el, json);
      },0);
    }
  }

  onNotificationToggle() {
    if (!this.notification.windowOpen) return;
    const conf = localStorage.getItem('floatingNotifications');
    if (conf) {
      const json: WindowConfiguration = JSON.parse(conf);
      setTimeout(()=>{
        const el = this.notificationWindow.nativeElement as HTMLElement;
        this.restoreFloatingWindow(el, json);
      },0);
    }
  }

  onWatchToggle() {
    if (!this.watch.windowOpen) return;
    const conf = localStorage.getItem('floatingWatch');
    if (conf) {
      const json: WindowConfiguration = JSON.parse(conf);
      setTimeout(()=>{
        const el = this.watchWindow.nativeElement as HTMLElement;
        this.restoreFloatingWindow(el, json);
      },0);
    }
  }

  closeJog(): void {
    this.screenManager.toggleControls();
    this.utils.stretchOverlay();
  }

  toggleSimulator() {
    this.simOpen = !this.simOpen;
    if (!this.simOpen) {
      // closed
      this.simLoaded = false;
    } else {
      const conf = localStorage.getItem('floatingSim');
      if (conf) {
        const json: WindowConfiguration = JSON.parse(conf);
        setTimeout(()=>{
          const el = this.simWindow.nativeElement as HTMLElement;
          this.restoreFloatingWindow(el, json);
        },0);
      }
    }
  }

  get jogTooltip(): string {
    if (typeof this.words === 'undefined') return null;
    if (!this.tpOnline) return this.words['main.errJog']['lib'];
    if (this.prj.activeProject) return this.words['main.errJog']['project'];
    if (!this.cooService.coosLoaded.value) {
      return this.words['main.errJog']['coos'];
    }
    return this.words['main.jogControlsToggle'];
  }
  
  quitDebugMode() {
    location.reload();
  }

  saveFloatingWindowsConfiguration() {
    if (this.terminalWindow) {
      const el = (this.terminalWindow.nativeElement as HTMLElement).getBoundingClientRect();
      localStorage.setItem('floatingTerminal',JSON.stringify(this.getConfiguration(el)));
    }
    if (this.notificationWindow) {
      const el = (this.notificationWindow.nativeElement as HTMLElement).getBoundingClientRect();
      localStorage.setItem('floatingNotifications',JSON.stringify(this.getConfiguration(el)));
    }
    if (this.simWindow) {
      const el = (this.simWindow.nativeElement as HTMLElement).getBoundingClientRect();
      localStorage.setItem('floatingSim',JSON.stringify(this.getConfiguration(el)));
    }
    if (this.watchWindow) {
      const el = (this.watchWindow.nativeElement as HTMLElement).getBoundingClientRect();
      localStorage.setItem('floatingWatch',JSON.stringify(this.getConfiguration(el)));
    }
  }

  private getConfiguration(el: ClientRect): WindowConfiguration {
    return {
      x: el.left,
      y: el.top,
      w: el.width,
      h: el.height
    };
  }

  private restoreFloatingWindow(el: HTMLElement, json: WindowConfiguration) {
    el.style.left = json.x + 'px';
    el.style.top = json.y + 'px';
    el.style.width = json.w + 'px';
    el.style.height = json.h + 'px';
    setTimeout(()=>{
      const top = el.getBoundingClientRect().top;
      const transform = el.style.transform;
      let transformY = 0;
      try {
        transformY = transform && transform.indexOf(')') > 0 ? Number(transform.split(',')[1].trim().slice(0, -4)) : 0;
      } catch (err) {

      }
      const y = top + transformY;
      if (y < 0) {
        el.style.top = 0 + 'px';
        this.terminal.resizeRequired.emit();
      }
    }, 200);
    this.terminal.resizeRequired.emit();
  }
}

export interface WindowConfiguration {
  x: number;
  y: number;
  w: number;
  h: number;
}
