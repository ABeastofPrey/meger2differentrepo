import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoginService } from '../../../../modules/core/services/login.service';
import { NotificationService } from '../../../../modules/core/services/notification.service';
import { ApiService } from '../../../../modules/core/services/api.service';
import { GroupManagerService } from '../../../../modules/core/services/group-manager.service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  ScreenManagerService,
  WebsocketService,
  MCQueryResponse,
} from '../../../core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddFeatureDialogComponent } from '../add-feature-dialog/add-feature-dialog.component';
import { Feature } from '../../models/feature.model';
import { UpdateDialogComponent } from '../../../../components/update-dialog/update-dialog.component';

declare var Plotly;

const colors = ['#ffa726', 'rgb(0, 150, 150)'];

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

  style: object = {};
  contextMenuShown: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  mcImage: string = '';
  simulated: boolean = false;
  viewInit: boolean = false;
  profileSrc: string;
  contextSelection: string = null;

  private sub: Subscription = null;
  private chartInit: boolean = false;
  private words: any;

  constructor(
    public login: LoginService,
    public notification: NotificationService,
    public groupManager: GroupManagerService,
    public ws: WebsocketService,
    private api: ApiService,
    private screenMngr: ScreenManagerService,
    private trn: TranslateService,
    private utils: UtilsService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  private getSelection(): string {
    let t: string = null;
    if (window.getSelection) {
      t = window.getSelection().toString();
    } else if (
      document.getSelection &&
      document.getSelection().type !== 'Control'
    ) {
      t = document.getSelection().toString();
    }
    return t && t.trim().length > 0 ? t : null;
  }

  copy() {
    document.execCommand('copy');
    this.contextMenuShown = false;
    this.contextSelection = null;
  }

  private afterSysInfoLoaded() {
    this.updateCharts();
    const cpu = this.groupManager.sysInfo.cpu;
    let mc: string = this.utils.IsKuka ? 'kuka_' : '';
    if (this.groupManager.sysInfo.ver.indexOf('SIM') === 0) {
      this.simulated = true;
      mc += '703';
    }
    else if (cpu.indexOf('E3825') !== -1)
      mc += '703';
    else if (cpu.indexOf('CPUS = 2') !== -1) {
      mc += '302';
    } else if (
      cpu.indexOf('neon') !== -1 ||
      cpu.toLowerCase().indexOf('arm') !== -1
    )
      mc += '301';
    else mc += '702';
    this.mcImage = 'assets/pics/mc/' + mc + '.png';
  }

  private updateCharts() {
    const sysInfo = this.groupManager.sysInfo;
    if (sysInfo === null) return;
    let layout = {
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
    let layout2 = {
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
    let data = [
      {
        values: [
          sysInfo.diskSize - sysInfo.freeDiskSpace,
          sysInfo.freeDiskSpace,
        ],
        labels: this.words['home.chart_space'],
        type: 'pie',
        marker: {
          colors: colors,
        },
      },
    ];
    let data2 = [
      {
        values: [sysInfo.ramSize - sysInfo.freeRamSpace, sysInfo.freeRamSpace],
        labels: this.words['home.chart_ram'],
        type: 'pie',
        marker: {
          colors: colors,
        },
      },
    ];
    setTimeout(() => {
      Plotly.newPlot(this.gDisk.nativeElement, data, layout, {
        staticPlot: true,
      });
      Plotly.newPlot(this.gMem.nativeElement, data2, layout2, {
        staticPlot: true,
      });
      this.chartInit = true;
    }, 200);
  }

  ngOnInit() {
    this.profileSrc = this.api.getProfilePic(
      this.login.getCurrentUser().user.username
    );
    const wordsArr = [
      'home.chart_ram',
      'home.chart_space',
      'home.addFeature',
      'error.invalid_feature',
      'dismiss',
    ];
    this.trn.get(wordsArr).subscribe(words => {
      this.words = words;
      this.notification.newMessage.subscribe(() => {
        const objDiv = this.msgContainer.nativeElement;
        objDiv.scrollTop = objDiv.scrollHeight;
      });
      this.sub = this.groupManager.sysInfoLoaded.subscribe(loaded => {
        if (loaded) {
          this.afterSysInfoLoaded();
        }
      });
      window.addEventListener('resize', () => {
        this.updateCharts();
      });
      this.screenMngr.controlsAnimating.subscribe(stat => {
        if (!stat) this.updateCharts();
      });
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewInit = true;
    }, 0);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  onContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.contextMenuX = e.offsetX;
    this.contextMenuY = e.offsetY;
    this.contextMenuShown = true;
    this.contextSelection = this.getSelection();
  }

  onMessageLogClick() {
    this.contextMenuShown = false;
  }

  clear() {
    this.notification.clear();
    this.contextMenuShown = false;
  }

  addFeature() {
    this.dialog
      .open(AddFeatureDialogComponent)
      .afterClosed()
      .subscribe((ret: Feature) => {
        if (ret) {
          const importCmd: string =
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
                  let interval = setInterval(() => {
                    if (ok) return;
                    this.api
                      .getFile('isWebServerAlive.HTML')
                      .then(ret => {
                        ok = true;
                        clearInterval(interval);
                        location.href = location.href + '?from=feature';
                      })
                      .catch(err => {});
                  }, 2000);
                }, 10000);
              } else {
                this.snack.open(
                  this.words['error.invalid_feature'],
                  this.words['dismiss']
                );
              }
            });
          });
        }
      });
  }
}
