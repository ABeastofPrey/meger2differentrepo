import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../modules/core/services/login.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Errors } from '../core/models/errors.model';
import { MatDialog } from '@angular/material';
import { ServerDisconnectComponent } from '../../components/server-disconnect/server-disconnect.component';
import { ApiService, WebsocketService, MCQueryResponse } from '../core';
import { environment } from '../../../environments/environment';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  animateChild,
  group,
  query,
} from '@angular/animations';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../core/services/utils.service';
import { CommonService } from '../core/services/common.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.5s ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('cardIsToolbar', [
      state(
        'card',
        style({
          width: '50%',
          height: 'auto',
        })
      ),
      state(
        'toolbar',
        style({
          width: '100%',
          maxWidth: '100%',
          height: '64px',
          top: 0,
          left: 0,
          transform: 'translate(0)',
          boxShadow: 'none',
          padding: 0,
          minHeight: 0,
        })
      ),
      transition('card => toolbar', [animate('1s ease-in-out')]),
    ]),
    trigger('robot1', [
      state('none, void', style({
          right: '-400px'
      })),
      state('shown', style({
          right: '24px'
      })),
      transition('none => shown', animate('1s 0.4s ease-out')),
      transition('shown => none', animate('1s ease-in'))
    ]),
    trigger('robot2', [
      state('none, void', style({
          left: '-400px'
      })),
      state('shown', style({
        left: '0px'
      })),
      transition('none => shown', animate('0.4s 0.6s ease-out')),
      transition('shown => none', animate('1s ease-in'))
    ]),
    trigger('conveyor', [
      state('none, void', style({
          left: '-1000px'
      })),
      state('shown', style({
          left: '-300px'
      })),
      transition('none => shown', animate('1s 0.2s ease-out')),
      transition('shown => none', animate('0.6s ease-in'))
    ]),
    trigger('cabinet', [
      state('none, void', style({
          left: '-400px'
      })),
      state('shown', style({
          left: '24px'
      })),
      transition('none => shown', animate('1s 0.2s ease-out')),
      transition('shown => none', animate('0.6s ease-in'))
    ]),
    trigger('floor', [
      state('none, void', style({
          bottom: '-300px'
      })),
      state('shown', style({
          bottom: '0px'
      })),
      transition('* => shown', animate('0.4s ease-out')),
      transition('shown => *', animate('0.4s 0.6s ease-in'))
    ])
  ],
})
export class LoginScreenComponent implements OnInit {
  
  ver: string;
  username = '';
  password = '';
  isSubmitting = false;
  authForm: FormGroup;
  errors: Errors = { error: null };
  isVersionOK = true;
  appName = '';
  platform: string = null;
  compInit = false;
  env = environment;
  pageLoaded = 'none';

  private notifier: Subject<boolean> = new Subject();
  private wsTimeout: number;

  get loginBgImgUrl(): string {
    const imgName = this.utils.IsKuka ? 'kuka_robot_bg.jpg' : 'stx1.jpg';
    const imgUrl = `/rs/assets/pics/${imgName}`;
    return imgUrl;
  }

  constructor(
    public login: LoginService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private api: ApiService,
    public ws: WebsocketService,
    private trn: TranslateService,
    public utils: UtilsService,
    public cmn: CommonService
  ) {
    this.appName = utils.IsKuka
      ? environment.appName_Kuka
      : environment.appName;
  }

  private showWebsocketError() {
    this.trn.get('error.conn_ws').subscribe(err => {
      this.errors.error = err;
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = { error: null };
    const credentials = this.authForm.value;
    this.login.attemptAuth(credentials).subscribe(
      data => {
        if (data.user.license) {
          // TIMEOUT FOR WEBSOCKET CONNECTION
          this.wsTimeout = window.setTimeout(() => {
            if (!this.ws.connected) {
              this.ws.reset();
              this.showWebsocketError();
              this.isSubmitting = false;
              console.log('WS TIMEOUT');
            }
          }, 3000);
        }
        this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(stat => {
          if (stat) {
            // WEBSOCKET CONNECTED AFTER USER MANUALLY LOGGED IN
            // WE DELAY NAVIGATION BY 1200 ms FOR THE ANIMATION TO FINISH
            if (this.cmn.isTablet) this.cmn.goFullScreen();
            setTimeout(() => {
              if (this.ws.connected) {
                this.redirectToMain();
              } else {
                this.showWebsocketError();
              }
              this.isSubmitting = false;
            }, 1200);
          }
        });
      },
      err => {
        if (err.type === 'error') {
          this.trn.get('error.conn_mc').subscribe(err => {
            this.errors.error = err;
          });
        } else this.errors = err;
        this.isSubmitting = false;
      }
    );
  }
  
  private getEtag() : string {
    if (!this.env.production) return '';
    const req = new XMLHttpRequest();
    req.open('GET', this.api.api_url + '/rs/assets/scripts/conn.js', false);
    req.send(null);
    const etag = req.getResponseHeader('etag');
    return etag ? etag.trim() : '';
  }

  ngOnInit() {
    this.platform = navigator.platform;
    const etag = this.getEtag();
    const compWs = environment.compatible_webserver_ver;
    this.api.get('/cs/api/java-version').subscribe((ret: { ver: string }) => {
      if (etag.length > 0 && ret.ver !== etag) { // can only happen if page is cached
        // ask user to do hard reload
        this.isVersionOK = false;
        const err = this.cmn.isTablet ? 'error.invalid_etag_tablet' : 'error.invalid_etag';
        this.trn.get(err).subscribe(str => {
          this.errors.error = str;
        });
        return;
      }
      this.isVersionOK = ret.ver.includes(compWs);
      if (!this.isVersionOK) {
        const params = {
          ver: compWs,
          current: ret.ver.split(' ')[0],
        };
        this.trn.get('error.invalid_webserver', params).subscribe(str => {
          this.errors.error = str;
        });
      }
    });
    this.ver = environment.gui_ver.split(' ')[0];
    this.authForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.authForm.disable();
    if (this.ws.connected) {
      this.login.logout();
    }
    let init = false;
    this.login.isAuthenticated
      .pipe(takeUntil(this.notifier))
      .subscribe(auth => {
        if (!auth) {
          this.isSubmitting = false;
          return;
        }
        if (!init && !this.isSubmitting && auth && this.ws.connected) {
          // WEBSOCKET CONNECTED AND USER AUTHENTICATED - WE DON'T NEED TO LOGIN AND CAN GO TO MAIN SCREEN
          this.redirectToMain();
          init = true;
        }
      });
    this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(conn => {
      if (!init && !this.isSubmitting && conn && this.login.getCurrentUser()) {
        // WEBSOCKET CONNECTED AND USER AUTHENTICATED - WE DON'T NEED TO LOGIN AND CAN GO TO MAIN SCREEN
        this.redirectToMain();
        init = true;
      }
    });
    setTimeout(() => {
      this.compInit = true;
    }, 200);
  }
  
  
  /*
   * CALLED WHEN USER IS AUTHENTICATED FROM LOCALSTORAGE AND WEBSOCKET IS OPENED
   */
  private redirectToMain() {
    if (!this.cmn.isTablet) {
      return this.router.navigateByUrl('/');
    }
    this.ws.query('?tp_ver').then((ret:MCQueryResponse)=>{
      if (ret.err) {
        // DISCONNECT FROM WEBSOCKET
        clearTimeout(this.wsTimeout);
        this.login.logout();
        this.trn.get('error.tp_tablet').subscribe(err => {
          this.errors.error = err;
        });
        return;
      }
      this.router.navigateByUrl('/');
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
    this.compInit = false;
  }

  ngAfterViewInit() {
    (document.activeElement as HTMLElement).blur();
    setTimeout(()=>{
      this.authForm.enable();
    },1000);
    this.route.queryParams.pipe(takeUntil(this.notifier)).subscribe(params => {
      if (params['serverDisconnected']) {
        this.router.navigate(this.route.snapshot.url, { queryParams: {} });
        setTimeout(() => {
          // TO FINISH THE ANIMATION TRANSITION
          this.dialog.open(ServerDisconnectComponent);
        }, 500);
      }
    });
    this.pageLoaded = 'shown';
  }
}
