import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ApiService,
  LoginService,
  ScreenManagerService,
  TpStatService,
  ControlStudioScreen,
} from '../../../core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../core/services/common.service';
import { environment } from '../../../../../environments/environment';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { UtilsService } from '../../../core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
  @ViewChild('upload') uploadInput: ElementRef;
  @Input('drawer') drawer: MatDrawer;

  profileSrc: string;
  tpOnline = false;
  env = environment;

  private notifier: Subject<boolean> = new Subject();

  /* TRUE when menu is busy (i.e: when uploading profile pic) */
  private _busy = false;
  get busy() {
    return this._busy;
  }

  constructor(
    public login: LoginService,
    private api: ApiService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    public mgr: ScreenManagerService,
    private router: Router,
    public stat: TpStatService,
    private trn: TranslateService,
    public cmn: CommonService,
    private utils: UtilsService
  ) {}

  onClick(s: ControlStudioScreen) {
    if (this.mgr.isScreenDisabled(s)) return;
    if (this.mgr.screen && this.mgr.screen.url === s.url) return;
    if (this.cmn.isTablet) this.drawer.close();
    this.router.navigateByUrl('/' + s.url).then(success=>{
      if (success) {
        this.mgr.screen = s;
      }
    });
    (document.activeElement as HTMLElement).blur();
  }

  ngOnInit() {
    this.stat.onlineStatus.pipe(takeUntil(this.notifier)).subscribe(stat => {
      this.tpOnline = stat;
    });
    this.profileSrc = this.api.getProfilePic(
      this.login.getCurrentUser().user.username
    );
    const route = this.router.url.substring(1);
    if (route.length === 0) {
      this.mgr.screen = this.mgr.screens[0];
      return;
    }
    for (const s of this.mgr.screens) {
      if (s.url.length === 0) continue;
      if (route.indexOf(s.url) === 0) {
        this.mgr.screen = s;
        break;
      }
    }
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  showUploadWindow() {
    if (this.utils.isTablet) return;
    const username = this.login.getCurrentUser().user.username;
    if (username !== 'admin' && username !== 'super' && !this.utils.isTablet) {
      this.uploadInput.nativeElement.click();
    }
  }

  onUploadImage(event: {target: {files: FileList}}) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this._busy = true;
      const file: File = fileList[0];
      this.api
        .uploadProfilePic(file, this.login.getCurrentUser().user.username)
        .then((ret: boolean) => {
          if (ret) {
            this.api.refreshProfilePic();
            this.trn.get('files.success_upload').subscribe(word => {
            //   this.snack.open(word, '', { duration: 2000 });
              this.snackbarService.openTipSnackBar(word);
            });
            this.profileSrc = this.api.getProfilePic(
              this.login.getCurrentUser().user.username
            );
          } else {
            this.trn
              .get('files.err_upload', { name: file.name })
              .subscribe(word => {
                // this.snack.open(word, '', { duration: 2000 });
                this.snackbarService.openTipSnackBar(word);
              });
          }
          this._busy = false;
        });
    }
  }
}
