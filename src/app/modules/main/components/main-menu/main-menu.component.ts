import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {MatSnackBar, MatDialog} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {ApiService, LoginService, UploadResult, ScreenManagerService, TpStatService, ControlStudioScreen} from '../../../core';
import {Router} from '@angular/router';
import {TourService} from 'ngx-tour-md-menu';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';

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
    private stat: TpStatService
  ) { }
  
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
      .then((ret: UploadResult)=>{ // ON SUCCUESS
        this.snack.open('Success: All Files were uploaded!','',{duration:2000});
        this.profileSrc = this.api.getProfilePic(this.login.getCurrentUser().user.username);
      },(ret:HttpErrorResponse)=>{ // ON ERROR
        switch (ret.error.err) {
          case -2:
            this.snack.open('ERROR UPLOADING IMAGE','DISMISS');
            break;
          case -3:
            this.snack.open('INVALID FILE EXTENSION','DISMISS');
            break;
          case -3:
            this.snack.open('PERMISSION DENIED','DISMISS');
            break;
        }
      });
    }
  }

}
