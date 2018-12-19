import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../modules/core/services/login.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Errors} from '../core/models/errors.model';
import {MatDialog} from '@angular/material';
import {ServerDisconnectComponent} from '../../components/server-disconnect/server-disconnect.component';
import {ApiService, WebsocketService} from '../core';
import {environment} from '../../../environments/environment';
import {trigger, state, style, transition, animate, animateChild, group, query} from '@angular/animations';

@Component({
  selector: 'login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.css'],
  animations: [
    trigger('login',[
      state('out',style({backgroundColor: '#eee'})),
      state('in',style({backgroundColor: '#FAFAFA'})),
      transition('out => in',group([query('*',[animateChild()]),animate('1s')])),
    ]),
    trigger('fade',[
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.5s ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('cardIsToolbar',[
      state('card',style({
        width: '50%',
        height: '75%'
      })),
      state('toolbar',style({
        width: '100%',
        maxWidth: '100%',
        height: '64px',
        top: 0,
        left: 0,
        transform: 'translate(0)',
        boxShadow: 'none'
      })),
      transition('card => toolbar',[animate('1s ease-in-out')])
    ])
  ]
})
export class LoginScreenComponent implements OnInit {
  
  ver : string;
  username: string = '';
  password: string = '';
  isSubmitting: boolean = false;
  authForm: FormGroup;
  errors: Errors = {error: null};
  isVersionOK: boolean = true;
  appName: string = environment.appName;

  constructor(
    public login: LoginService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private api: ApiService,
    private ws: WebsocketService
  ) {
    this.api.get('/cs/api/java-version').subscribe((ret:{ver:string})=>{
      this.isVersionOK = ret.ver.startsWith(environment.compatible_webserver_ver);
      if (!this.isVersionOK) {
        this.errors.error =
          'Please use web server v' + environment.compatible_webserver_ver +
          ' (current is v' + ret.ver + ')';
      }
    });
    this.ver = environment.gui_ver;
    this.authForm = this.fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required]
    });
  }
  
  submitForm() {
    this.isSubmitting = true;
    this.errors = {error: null};
    const credentials = this.authForm.value;
    this.login
    .attemptAuth(credentials)
    .subscribe(
      data => {
        // TIMEOUT FOR WEBSOCKET CONNECTION
        setInterval(()=>{
          if (!this.ws.connected) {
            this.errors.error = "Can't establish a websocket connection.";
            this.isSubmitting = false;
          }
        },2000);
        this.ws.isConnected.subscribe(stat=>{
          if (stat) {
            setTimeout(()=>{
              this.router.navigateByUrl('/')
            },1200);
          }
        });
      },
      err => {
        if (err.type === 'error')
          this.errors.error = "Can't connect to softMC";
        else
          this.errors = err;
        this.isSubmitting = false;
      }
    );
  }

  ngOnInit() {
    
  }
  
  ngAfterViewInit() {
    this.route.queryParams.subscribe(params=>{
      if (params['serverDisconnected']) {
        this.router.navigate(this.route.snapshot.url,{queryParams:{}});
        setTimeout(()=>{ // TO FINISH THE ANIMATION TRANSITION
          this.dialog.open(ServerDisconnectComponent);
        }, 500);
      }
    });
  }

}
