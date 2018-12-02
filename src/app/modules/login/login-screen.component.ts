import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../modules/core/services/login.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Errors} from '../core/models/errors.model';
import {MatDialog} from '@angular/material';
import {ServerDisconnectComponent} from '../../components/server-disconnect/server-disconnect.component';
import {ApiService, WebsocketService} from '../core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.css']
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
  
  private timeout: any;

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
    this.timeout = setTimeout(()=>{
      this.errors.error = 'Trying to connect to softMC...';
    },3000);
    this.login
    .attemptAuth(credentials)
    .subscribe(
      data => {
        clearTimeout(this.timeout);
        // TIMEOUT FOR WEBSOCKET CONNECTION
        setInterval(()=>{
          if (!this.ws.connected) {
            this.errors.error = "Can't establish a websocket connection.";
            this.isSubmitting = false;
          }
        },2000);
        this.ws.isConnected.subscribe(stat=>{
          if (stat) {
            this.router.navigateByUrl('/')
          }
        });
      },
      err => {
        clearTimeout(this.timeout);
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
