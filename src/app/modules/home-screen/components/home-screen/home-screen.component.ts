import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {LoginService} from '../../../../modules/core/services/login.service';
import {NotificationService} from '../../../../modules/core/services/notification.service';
import {ApiService} from '../../../../modules/core/services/api.service';
import {GroupManagerService} from '../../../../modules/core/services/group-manager.service';
import {Subscription} from 'rxjs';
import {trigger, transition, style, animate} from '@angular/animations';
import {ScreenManagerService, WebsocketService} from '../../../core';
import {TranslateService} from '@ngx-translate/core';

declare var Plotly;

const colors = ['#ffa726', 'rgb(0, 150, 150)'];

@Component({
  selector: 'home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.css'],
  animations: [
    trigger('scaleIn',[
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('1s ease-out', style({ transform: 'scale(1)' }))
      ]),
    ]),
    trigger('fade',[
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HomeScreenComponent implements OnInit {
  

  @ViewChild('graphMemory') gMem : ElementRef;
  @ViewChild('graphDisk') gDisk : ElementRef;
  @ViewChild('msgLogContainer') msgContainer: ElementRef;
  
  style: object = {};
  contextMenuShown : boolean = false;
  contextMenuX : number = 0;
  contextMenuY : number = 0;
  mcImage: string = '';
  simulated: boolean = false;
  viewInit: boolean = false;
  profileSrc: string = this.api.getProfilePic(this.login.getCurrentUser().user.username);
  contextSelection: string = null;
  
  private sub : Subscription = null;
  private chartInit : boolean = false;
  private words: any;

  constructor(
    public login : LoginService,
    public notification : NotificationService,
    public groupManager : GroupManagerService,
    public ws: WebsocketService,
    private api : ApiService,
    private screenMngr: ScreenManagerService,
    private trn: TranslateService
  ) {
    
  }
  
  private getSelection(): string {
    let t: string = null;
    if (window.getSelection) {
      t = window.getSelection().toString();
    } else if (document.getSelection && document.getSelection().type !== 'Control') {
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
    let mc : string;
    if (this.groupManager.sysInfo.ver.indexOf('SIM') === 0) {
      this.simulated = true;
      mc = '703';
    }
    else if (cpu.indexOf('E3825') !== -1)
      mc = '703';
    else if (cpu.indexOf('neon') !== -1 || cpu.toLowerCase().indexOf('arm') !== -1)
      mc = '301';
    else
      mc = '702';
    this.mcImage = 'assets/pics/mc/' + mc + '.png';
  }
  
  private updateCharts() {
    const sysInfo = this.groupManager.sysInfo;
    if (sysInfo === null)
      return;
    let layout = {
      title: 'Disk',
      height: 230,
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        b: 30,
        t: 40,
        pad: 0
      },
      paper_bgcolor: 'transparent'
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
        pad: 0
      },
      paper_bgcolor: 'transparent'
    };
    let data = [{
      values: [sysInfo.diskSize - sysInfo.freeDiskSpace, sysInfo.freeDiskSpace],
      labels: this.words['home.chart_space'],
      type: 'pie',
      marker: {
        colors: colors
      }
    }];
    let data2 = [{
      values: [sysInfo.ramSize - sysInfo.freeRamSpace, sysInfo.freeRamSpace],
      labels: this.words['home.chart_ram'],
      type: 'pie',
      marker: {
        colors: colors
      }
    }];
    setTimeout(()=>{
      Plotly.newPlot(this.gDisk.nativeElement, data, layout, {staticPlot: true});
      Plotly.newPlot(this.gMem.nativeElement, data2, layout2, {staticPlot: true});
      this.chartInit = true;
    },200);
  }

  ngOnInit() {
    this.trn.get(['home.chart_ram', 'home.chart_space']).subscribe(words=>{
      this.words = words;
      this.notification.newMessage.subscribe(()=>{
        const objDiv = this.msgContainer.nativeElement;
        objDiv.scrollTop = objDiv.scrollHeight;
      });
      this.sub = this.groupManager.sysInfoLoaded.subscribe((loaded)=>{
        if (loaded) {
          this.afterSysInfoLoaded();
        }
      });
      window.addEventListener('resize',()=>{
        this.updateCharts();
      });
      this.screenMngr.controlsAnimating.subscribe(stat=>{
        if (!stat)
          this.updateCharts();
      });
    });
  }
  
  ngAfterViewInit() {
    setTimeout(()=>{this.viewInit = true;},0);
  }
  
  ngOnDestroy() {
    if (this.sub)
      this.sub.unsubscribe();
  }
  
  onContextMenu(e:MouseEvent) {
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

}