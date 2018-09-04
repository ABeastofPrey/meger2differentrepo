import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import {NotificationService, LoginService, WatchService, DataService, TpStatService, CoordinatesService, ScreenManagerService, WebsocketService} from '../../../core';
import {Router, RouteConfigLoadStart, RouteConfigLoadEnd} from '@angular/router';
import {JogSettingsDialogComponent} from '../../../../components/jog-settings-dialog/jog-settings-dialog.component';
import {MatDialog, MatSidenav, MatSlideToggleChange} from '@angular/material';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {TourService} from 'ngx-tour-md-menu';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  
  isRouterLoading: boolean = false;
  mouseDownIndex : number = 0;
  screenWidth: number;
  tpOnline: boolean = false;
  
  @ViewChild('drawer') drawer : MatSidenav;
  
  private jogButtonPressed : boolean = false;
  private lastKeyDownTime : number = -1;
  private jogInterval : any;
  private motionFlag : boolean = false;

  constructor(
    public notification: NotificationService,
    public login: LoginService,
    public watch: WatchService,
    private router: Router,
    public data: DataService,
    public stat : TpStatService,
    public cooService: CoordinatesService,
    public screenManager: ScreenManagerService,
    private _zone: NgZone,
    private ws: WebsocketService,
    private dialog: MatDialog,
    private tour: TourService
  ) { }

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    window.addEventListener('resize',()=>{
      this.screenWidth = window.innerWidth;
    });
    this.drawer.openedChange.subscribe(()=>{
      window.dispatchEvent(new Event('resize'));
    });
    this.login.isAuthenticated.subscribe(auth=>{
      if (!auth)
        this.router.navigateByUrl('/login');
    });
    this.router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
          this.isRouterLoading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
          this.isRouterLoading = false;
      }
    });
    this.stat.onlineStatus.subscribe(stat=>{
      this.tpOnline = stat;
      if (!stat) { // TP LIB IS NOT AVAILABLE
        this.screenManager.openedControls = false;
      } else {
        if (localStorage.getItem('tourQuestion') === null) {
          localStorage.setItem('tourQuestion','true');
          this.dialog.open(YesNoDialogComponent,{
            data: {
              title: 'Welcome!',
              msg: 'Welcome to RoboStudio! Since this is your first time here, would you like a quick tour?',
              yes: 'YES, LET\'S GO!',
              no: 'NO, THANKS'
            }
          }).afterClosed().subscribe(ret=>{
            if (ret) {
              this.tour.start();
            }
          });
        }
      }
    });
  }
  
  mouseDown(i : number, e? : Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this._zone.runOutsideAngular(()=>{
      this.jogButtonPressed = true;
      var diff = 5000;
      if (this.lastKeyDownTime > 0) {
        diff = new Date().getTime() - this.lastKeyDownTime;
      }
      this.lastKeyDownTime = new Date().getTime();
      if (diff < 100)
        return;
      clearInterval(this.jogInterval);
      this.motionFlag = true;
      this.mouseDownIndex = i;
      this.ws.send('?tp_jog(' + i + ')');
      //console.log('jog');
      this.jogInterval = setInterval(()=>{
        if (this.motionFlag) {
          this.ws.send('?tp_jog(' + i + ')');
          window.navigator.vibrate(200);
          //console.log('jog');
        } else {
          clearInterval(this.jogInterval);
          this.ws.send("?tp_jog(0)");
        }
      },this.data._refreshCycle);
    });
  }
  
  mouseUp() {
    if (this.jogButtonPressed || this.stat.isMoving) {
      this.motionFlag = false;
      this.ws.send("?tp_jog(0)");
      clearInterval(this.jogInterval);
    }
    this.jogButtonPressed = false;
    this.mouseDownIndex = 0;
  }
  
  openJogSettings() {
    this.dialog.open(JogSettingsDialogComponent);
  }
  
  onJogEnableChange(e: MatSlideToggleChange) {
    this.stat.mode = (e.checked ? 'T1' : 'A');
  }

}
