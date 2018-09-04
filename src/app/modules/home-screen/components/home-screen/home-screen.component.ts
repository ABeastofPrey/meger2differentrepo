import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {LoginService} from '../../../../modules/core/services/login.service';
import {NotificationService} from '../../../../modules/core/services/notification.service';
import {ApiService} from '../../../../modules/core/services/api.service';
import {GroupManagerService} from '../../../../modules/core/services/group-manager.service';
import {Subscription} from 'rxjs';

declare var Plotly;

const colors = ['#ffa726', 'rgb(0, 150, 150)'];

@Component({
  selector: 'home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.css']
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
  
  profileSrc: string = this.api.getProfilePic(this.login.getCurrentUser().user.username);
  
  private sub : Subscription = null;
  private chartInit : boolean = false;

  constructor(
    public login : LoginService,
    public notification : NotificationService,
    public groupManager : GroupManagerService,
    private api : ApiService
  ) {

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
      labels: ['Used Space', 'Free Space'],
      type: 'pie',
      marker: {
        colors: colors
      }
    }];
    let data2 = [{
      values: [sysInfo.ramSize - sysInfo.freeRamSpace, sysInfo.freeRamSpace],
      labels: ['Used RAM', 'Free RAM'],
      type: 'pie',
      marker: {
        colors: colors
      }
    }];
    setTimeout(()=>{
      Plotly.plot(this.gDisk.nativeElement, data, layout, {staticPlot: true});
      Plotly.plot(this.gMem.nativeElement, data2, layout2, {staticPlot: true});
      this.chartInit = true;
    },200);
  }

  ngOnInit() {
    this.notification.newMessage.subscribe(()=>{
      const objDiv = this.msgContainer.nativeElement;
      objDiv.scrollTop = objDiv.scrollHeight;
    });
    if (this.groupManager.sysInfo) {
      this.afterSysInfoLoaded();
    }
    this.sub = this.groupManager.sysInfoLoaded.subscribe((loaded)=>{
      if (loaded) {
        this.afterSysInfoLoaded();
      }
    });
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
  }
  
  onMessageLogClick() {
    this.contextMenuShown = false;
  }
  
  clear() {
    this.notification.clear();
    this.contextMenuShown = false;
  }

}