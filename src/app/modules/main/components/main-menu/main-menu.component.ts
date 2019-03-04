import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {ApiService, LoginService, UploadResult, ScreenManagerService, TpStatService, ControlStudioScreen} from '../../../core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  
  @ViewChild('upload') uploadInput: ElementRef;
  
  profileSrc: string;
  tpOnline: boolean = false;

  constructor(
    public login : LoginService,
    private api : ApiService,
    private snack : MatSnackBar,
    public mgr: ScreenManagerService,
    private router: Router,
    public stat: TpStatService,
    private trn: TranslateService
  ) {
    
  }
  
  onClick(s: ControlStudioScreen) {
    if (s.requiresTpLib && !this.tpOnline)
      return;
    this.mgr.screen = s;
    this.router.navigateByUrl('/' + s.url);
  }

  ngOnInit() {
    this.stat.onlineStatus.subscribe(stat=>{
      this.tpOnline = stat;
    });
    this.profileSrc = this.api.getProfilePic(this.login.getCurrentUser().user.username);
    const route = this.router.url.substring(1);
    if (route.length === 0) {
      this.mgr.screen = this.mgr.screens[0];
      return;
    }
    for (let s of this.mgr.screens) {
      if (s.url.length === 0)
        continue;
      if (route.indexOf(s.url) === 0) {
        this.mgr.screen = s;
        break;
      }
    }
  }
  
  showUploadWindow() {
    if (this.login.getCurrentUser().user.username !== 'admin')
      this.uploadInput.nativeElement.click();
  }
  
  onUploadImage(event:any) {
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
      let file: File = fileList[0];
      this.api.uploadProfilePic(file,this.login.getCurrentUser().user.username)
      .then((ret: boolean)=>{
        if (ret) {
          this.trn.get('files.success_upload').subscribe(word=>{
            this.snack.open(word,'',{duration:2000});
          });
          this.profileSrc = this.api.getProfilePic(this.login.getCurrentUser().user.username);
        } else {
          this.trn.get('files.err_upload', {name: file.name}).subscribe(word=>{
            this.snack.open(word,'',{duration:2000});
          });
        }
      });
    }
  }

}
