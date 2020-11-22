import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { LoginService } from '../../../../modules/core/services/login.service';
import { NotificationService } from '../../../../modules/core/services/notification.service';
import { ApiService } from '../../../../modules/core/services/api.service';
import { GroupManagerService } from '../../../../modules/core/services/group-manager.service';
import { Subscription, Subject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  ScreenManagerService,
  WebsocketService,
  MCQueryResponse,
  TpStatService,
  ProjectManagerService,
} from '../../../core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddFeatureDialogComponent } from '../add-feature-dialog/add-feature-dialog.component';
import { Feature } from '../../models/feature.model';
import { UpdateDialogComponent } from '../../../../components/update-dialog/update-dialog.component';
import { ifElse, then, compose, split, map, filter, sort, head, } from 'ramda';
import { isNotNil } from 'ramda-adjunct';
import { hasNoError, resProp } from '../../../core/services/service-adjunct';
import { DataService } from '../../../core';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { RobotService } from '../../../core/services/robot.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';
import { values } from 'd3';

declare var Plotly;

const colors = ['#ffc332', '#11826c'];

@Component({
  selector: 'home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.css'],
  animations: [
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('1s ease-out', style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class HomeScreenComponent implements OnInit {
  @ViewChild('graphMemory', { static: false }) gMem: ElementRef;
  @ViewChild('graphDisk', { static: false }) gDisk: ElementRef;
  @ViewChild('msgLogContainer', { static: false }) msgContainer: ElementRef;

  mcImage = '';
  simulated = false;
  viewInit = false;
  profileSrc: string;
  mainVer: string[] = [];
  guiVer: string = environment.gui_ver;
  appNameKuka: string = environment.appName_Kuka;

  private words: {};
  private timeInterval: number;
  private notifier: Subject<boolean> = new Subject();
  private chartsLoaded = false;

  libVer: string;

  // Header Info
  date: string;
  time: string;

  constructor(
    public data: DataService,
    public login: LoginService,
    public notification: NotificationService,
    public groupManager: GroupManagerService,
    public ws: WebsocketService,
    private api: ApiService,
    private screenMngr: ScreenManagerService,
    private trn: TranslateService,
    public utils: UtilsService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    public stat: TpStatService,
    public prj: ProjectManagerService,
    private router: Router,
    public robot: RobotService
  ) {}
  
  get dateTime(): number {
    if (!this.date || !this.time) {
      return null;
    }
    const [date, month, year] = this.date.split('/');
    const [hours, minutes] = this.time.split(':');
    return Date.UTC(
      parseInt('20' + year),
      parseInt(month) - 1,
      parseInt(date),
      parseInt(hours),
      parseInt(minutes),
      0
    );
  }

  private afterSysInfoLoaded() {
    this.updateCharts();
    const cpu = this.groupManager.sysInfo.cpu;
    let mc: string = this.utils.IsKuka ? 'kuka_' : '';
    if (this.groupManager.sysInfo.ver.indexOf('SIM') === 0) {
      this.simulated = true;
      mc += '703';
    } else if (cpu.indexOf('E3825') !== -1) mc += '703';
    else if (cpu.indexOf('CPUS = 2') !== -1) {
      mc += '302';
    } else if (
      cpu.indexOf('neon') !== -1 ||
      cpu.toLowerCase().indexOf('arm') !== -1
    ) {
      mc += '301';
 }
    else mc += '702';
    this.mcImage = 'assets/pics/mc/' + mc + '.png';
  }

  private updateCharts() {
    if (this.chartsLoaded) {
      return;
    }
    const sysInfo = this.groupManager.sysInfo;
    if (sysInfo === null) return;
    const layout = {
      title: 'Disk',
      height: 230,
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        b: 30,
        t: 40,
        pad: 0,
      },
      paper_bgcolor: 'transparent',
    };
    const layout2 = {
      title: 'RAM',
      height: 200,
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 40,
        pad: 0,
      },
      paper_bgcolor: 'transparent',
    };
    const total = sysInfo.diskSize;
    const used = (total - sysInfo.freeDiskSpace) / total * 100;
    const free = sysInfo.freeDiskSpace / total * 100;
    const rounded = [
      Math.round((used+Number.EPSILON) * 100) / 100 + '%',
      Math.round((free + Number.EPSILON) * 100) / 100 + '%'
    ];
    const hoverTextDisk = [
      this.words['home.chart_space'][0] + '<br>' + (total - sysInfo.freeDiskSpace).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' bytes<br>',
      this.words['home.chart_space'][1] + '<br>' + sysInfo.freeDiskSpace.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' bytes',
    ];

    const data = [
      {
        values: [
          total - sysInfo.freeDiskSpace,
          sysInfo.freeDiskSpace,
        ],
        labels: this.words['home.chart_space'],
        type: 'pie',
        marker: {
          colors,
        },
        text: rounded,
        textinfo: 'text',
        hovertext: hoverTextDisk,
        hoverinfo: 'text'
      },
    ];
    const data2 = [
      {
        values: [sysInfo.ramSize - sysInfo.freeRamSpace, sysInfo.freeRamSpace],
        labels: this.words['home.chart_ram'],
        type: 'pie',
        marker: {
          colors,
        },
      },
    ];
    setTimeout(()=>{
      Plotly.newPlot(this.gDisk.nativeElement, data as Array<Partial<Plotly.PlotData>>, layout, {
        staticPlot: true,
        responsive: true
      });
      Plotly.newPlot(this.gMem.nativeElement, data2 as Array<Partial<Plotly.PlotData>>, layout2, {
        staticPlot: true,
        responsive: true
      });
      this.chartsLoaded = true;
    },0);
  }

  ngOnInit() {
    this.profileSrc = this.api.getProfilePic(
      this.login.getCurrentUser().user.username
    );
    this.api.profilePicChanged.subscribe(() => {
      this.profileSrc = this.api.getProfilePic(
        this.login.getCurrentUser().user.username
      );
    });
    const wordsArr = [
      'home.chart_ram',
      'home.chart_space',
      'home.addFeature',
      'error.invalid_feature',
      'dismiss',
    ];
    this.trn.get(wordsArr).subscribe(words => {
      this.words = words;
      this.groupManager.sysInfoLoaded
        .pipe(takeUntil(this.notifier))
        .subscribe(loaded => {
          if (loaded) {
            this.afterSysInfoLoaded();
          }
        });
      this.screenMngr.openedControls
        .pipe(takeUntil(this.notifier))
        .subscribe(stat => {
            window.dispatchEvent(new Event("resize"));
        });
    });
    this.getLibVer().then(ver => {
      this.libVer = ver;
    });
    this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (!stat) return;
      this.ws.query('?sys.date').then((ret: MCQueryResponse) => {
        this.date = ret.result;
      });
      this.getMainVersion().then(res => {
        this.mainVer = res;
      });
      clearInterval(this.timeInterval);
      this.refreshTime();
      this.timeInterval = window.setInterval(() => {
        this.refreshTime();
      }, 60000);
    });

  }

  @HostListener('window:resize')
  onResize() {
    if (this.chartsLoaded) {
      Plotly.Plots.resize(this.gDisk.nativeElement);
      Plotly.Plots.resize(this.gMem.nativeElement);
    }
  }

  private refreshTime() {
    if (this.screenMngr.debugMode) return;
    this.ws.query('?sys.time').then((ret: MCQueryResponse) => {
      const i = ret.result.lastIndexOf(':');
      this.time = ret.result.substring(0, i);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewInit = true;
      if (this.notification.windowOpen) {
        this.notification.toggleWindow();
      }
      if (!this.notification.messagesShowing) {
        this.notification.toggleMessagesShowing(true);
      }
    }, 0);
  }

  ngOnDestroy() {
    if (this.notification.messagesShowing) {
      this.notification.toggleMessagesShowing(true);
    }
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  addFeature() {
    this.dialog
      .open(AddFeatureDialogComponent)
      .afterClosed()
      .subscribe((ret: Feature) => {
        if (ret) {
          const importCmd =
            'import_c lic_man_add_feature(byval as string) as long';
          this.ws.query(importCmd).then(() => {
            const cmd = '?lic_man_add_feature("' + ret.toString() + '")';
            this.ws.query(cmd).then((ret: MCQueryResponse) => {
              if (ret.result === '0') {
                this.dialog.open(UpdateDialogComponent, {
                  disableClose: true,
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  closeOnNavigation: false,
                  data: this.words['home.addFeature']['installing'],
                  id: 'update',
                });
                this.ws.updateFirmwareMode = true;
                this.ws.query('?user sys_reboot(0,0,0)');
                setTimeout(() => {
                  let ok = false;
                  const interval = setInterval(() => {
                    if (ok) return;
                    this.api.getFile('isWebServerAlive.HTML').then(ret => {
                      if (ok) return;
                      ok = true;
                      clearInterval(interval);
                      const URL = window.location.href;
                      const i = URL.indexOf('?');
                      const finalURL = i === -1 ? URL : URL.substring(0,i);
                      const newURL = finalURL + '?from=feature';
                      window.location.href = newURL;
                    }).catch(err => {});
                  }, 2000);
                }, 10000);
              } else {
                //   this.snack.open(
                //     this.words['error.invalid_feature'],
                //     this.words['dismiss']
                //   );     
                  this.snackbarService.openTipSnackBar("error.invalid_feature");          
              }
            });
          });
        }
      });
  }

  private async getMainVersion(): Promise<string[]> {
    const query = () => this.ws.query('?vi_getreleaseversion');
    const logErr = err => {
      console.log(err);
      return [];
    };
    const splitWithSemicolon = split(';');
    const parser = compose(
      splitWithSemicolon,
      resProp
    );
    const handler = ifElse(hasNoError, parser, logErr);
    return compose(
      then(handler),
      query
    )();
  }

  goToProject() {
    this.router.navigateByUrl('/projects');
  }

  async getLibVer(): Promise<string> {
    const wholeLibs = await this.getLibDescriptions();
    // get latest lib date as main lib date.
    const getDate = (x: ILib) => x.date;
    const dates = map(getDate, wholeLibs);
    const filterNilDate = filter(isNotNil);
    const differ = (a, b) => b - a;
    const sorter = sort(differ);
    const getLatestDate = compose(head, sorter, filterNilDate);
    return getLatestDate(dates);
  }

  private async getLibDescriptions(): Promise<ILib[]> {
    const splitWithSemicolon = split(';');
    const query = () => this.ws.query('?VI_getLibraryVersion');
    const leftHandler = err => {
      console.warn(err);
      return [];
    };
    const splitVerDate = (x: IResLibs) => Object({
      name: x.name,
      version: splitWithSemicolon(x.ver)[0],
      date: splitWithSemicolon(x.ver)[1],
      desc: x.desc
    }) as ILib;
    const rightHandler = compose(map(splitVerDate), JSON.parse, resProp);
    const resHandler = ifElse(hasNoError, rightHandler, leftHandler);
    return compose(then(resHandler), query)();
  }

}

// tslint:disable-next-line: interface-name
interface ILib {
  name: string;
  version: string;
  date: string;
  desc: string;
}

// tslint:disable-next-line: interface-name
interface IResLibs {
  name: string;
  ver: string;
  desc: string;
}