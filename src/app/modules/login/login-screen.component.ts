import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../modules/core/services/login.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Errors } from '../core/models/errors.model';
import { MatDialog } from '@angular/material';
import { ServerDisconnectComponent } from '../../components/server-disconnect/server-disconnect.component';
import { ApiService, WebsocketService } from '../core';
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
    trigger('login', [
      state('out', style({ backgroundColor: '#eee' })),
      state('in', style({ backgroundColor: '#FAFAFA' })),
      transition(
        'out => in',
        group([query('*', [animateChild()]), animate('1s')])
      ),
    ]),
    trigger('init', [
      state('out', style({ backgroundColor: '#fff' })),
      state('in', style({ backgroundColor: '#eee' })),
      transition(
        'out => in',
        group([query('*', [animateChild()]), animate('1s')])
      ),
    ]),
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
  ],
})
export class LoginScreenComponent implements OnInit {
  ver: string;
  username: string = '';
  password: string = '';
  isSubmitting: boolean = false;
  authForm: FormGroup;
  errors: Errors = { error: null };
  isVersionOK: boolean = true;
  appName: string = '';
  platform: string = null;
  compInit: boolean = false;

  private notifier: Subject<boolean> = new Subject();

  public get loginBgImgUrl(): string {
    const imgName = this.utils.IsKuka ? 'kuka_robot_bg.jpg' : 'robot_bg.jpg';
    const imgUrl = `assets/pics/${imgName}`;
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
          setTimeout(() => {
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
            if (this.cmn.isTablet) this.cmn.goFullScreen();
            setTimeout(() => {
              if (this.ws.connected) {
                this.router.navigateByUrl('/');
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

  ngOnInit() {
    this.platform = navigator.platform;
    this.api.get('/cs/api/java-version').subscribe((ret: { ver: string }) => {
      this.isVersionOK = ret.ver.includes(environment.compatible_webserver_ver);
      if (!this.isVersionOK) {
        const params = {
          ver: environment.compatible_webserver_ver,
          current: ret.ver,
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
          this.router.navigateByUrl('/');
          init = true;
        }
      });
    this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(conn => {
      if (!init && !this.isSubmitting && conn && this.login.getCurrentUser()) {
        this.router.navigateByUrl('/');
        init = true;
      }
    });
    setTimeout(() => {
      this.compInit = true;
    }, 200);
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  ngAfterViewInit() {
    (document.activeElement as HTMLElement).blur();
    this.route.queryParams.pipe(takeUntil(this.notifier)).subscribe(params => {
      if (params['serverDisconnected']) {
        this.router.navigate(this.route.snapshot.url, { queryParams: {} });
        setTimeout(() => {
          // TO FINISH THE ANIMATION TRANSITION
          this.dialog.open(ServerDisconnectComponent);
        }, 500);
      }
    });
  }
}
