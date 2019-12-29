import { TerminalService } from './../../../home-screen/services/terminal.service';
import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  HostListener,
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
  MCQueryResponse,
  GroupManagerService,
  TaskService,
} from '../../../core';
import {
  Router,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
} from '@angular/router';
import { JogSettingsDialogComponent } from '../../../../components/jog-settings-dialog/jog-settings-dialog.component';
import { MatDialog, MatSidenav, MatSnackBar } from '@angular/material';
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
import {ProgramEditorService} from '../../../program-editor/services/program-editor.service';

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
    private tour: TourService,
    public prj: ProjectManagerService,
    private robot: RobotService,
    private trn: TranslateService,
    public cmn: CommonService,
    public utils: UtilsService,
    public rec: RecordService,
    public sim: SimulatorService,
    public terminal: TerminalService
  ) {
    this.trn.onLangChange.pipe(takeUntil(this.notifier)).subscribe(event => {
      this.refreshLang();
    });
    this.refreshLang();
    this.stat.onlineStatus.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat) {
        this.dialog.open(TpLoadingComponent, {
          disableClose: true,
          height: '300px',
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
    this.trn.get(['main.errJog', 'main.jogControlsToggle']).subscribe(words => {
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
      }
    });
    this.stat.wackChange.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat && !this.toolbarShown) { // WAITING FOR ACK
        this.toolbarShown = true;
      }
    });
    this.robot.init();
    this.stat.onlineStatus.pipe(takeUntil(this.notifier)).subscribe(stat => {
      this.tpOnline = stat;
      if (!stat) {
        // TP LIB IS NOT AVAILABLE
        this.screenManager.openedControls = false;
      } else {
        /*const tourQuestion = localStorage.getItem('tourQuestion');
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
          }*/
      }
    });
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
          if (ret.err) return this.router.navigateByUrl('/login');
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
    if (x <= 0 || x >= w || y <= 0 || y >= h) this.mouseUp(null);
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
    //    this.screenManager.debugMode = false;
    //    this.cooService.setDebugMode(false);
    //    this.grp.setDebugMode(false);
    //    this.prj.setDebugMode(false);
    //    this.task.setDebugMode(false);
    //    this.prg.setDebugMode(false);
  }
}
