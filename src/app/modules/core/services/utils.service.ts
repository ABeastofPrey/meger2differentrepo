import { AuthPassDialogComponent } from '../../../components/auth-pass-dialog/auth-pass-dialog.component';
import { Injectable } from '@angular/core';
import { WebsocketService, errorString } from './websocket.service';
import { TpStatService } from './tp-stat.service';
import { TaskService } from './task.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UpdateDialogComponent } from '../../../components/update-dialog/update-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import {
  environment as env,
  Platform,
} from '../../../../environments/environment';
import { DataService } from './data.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';

/*
 * THIS CONTAINS ALL KINDS OF UTILS THAT SHOULD BE USED ACCROSS THE APP
 */
@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private words: {};
  private upperRightOverlayEle = document.getElementById('overlaycover');
  private globalOverlayWrappers: HTMLCollectionOf<Element>;

  constructor(
    private ws: WebsocketService,
    private stat: TpStatService,
    private task: TaskService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private dialog: MatDialog,
    private trn: TranslateService,
    public dataService: DataService,
    private overlayContainer: OverlayContainer,
  ) {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode !== null) {
      env.useDarkTheme = darkMode === '1';
    }
    this.trn.get(['utils.success', 'acknowledge']).subscribe(words => {
      this.words = words;
    });
    this.stat.onlineStatus.subscribe(stat=>{
      if (!stat) {
        this.removeShrinkStretchOverlay();
      }
    });
  }

  /* Download a text file */
  downloadFromText(fileName: string, content: string) {
    // tslint:disable-next-line: no-any
    const windowObj = window as any;
    const createObjectURL = 
        (windowObj.URL || windowObj.webkitURL || {}).createObjectURL || (()=>{});
    let blob = null;
    const fileType = "application/octet-stream";
    windowObj.BlobBuilder = windowObj.BlobBuilder || 
                         windowObj.WebKitBlobBuilder || 
                         windowObj.MozBlobBuilder || 
                         windowObj.MSBlobBuilder;
    if(windowObj.BlobBuilder){
      const bb = new windowObj.BlobBuilder();
      bb.append(content);
      blob = bb.getBlob(fileType);
    }else{
      blob = new Blob([content], {type : fileType});
    }
    const url = createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  resetAllDialog(title: string) {
    const dialog = this.dialog.open(UpdateDialogComponent, {
      disableClose: true,
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      closeOnNavigation: false,
      data: title,
      id: 'update',
    });
    this.resetAll(true).then(result => {
      if (result) {
        // RESET ALL SUCCESS
        this.stat.onlineStatus.subscribe(stat => {
          if (stat) {
            this.ws.updateFirmwareMode = false;
            dialog.close();
          }
        });
      } else {
        dialog.close();
      }
    }).catch(err=>{
      console.log('ERROR IN RESET ALL DIALOG:',err);
    });
  }

  /*
   * IF THE USER USES A TABLET, AND CHANGES THE MODE (T1,T2...) SO FIRST HE
   * WILL BE PROMPT TO ENTER A PASSWORD.
   */
  changeMode() {
    this.dialog.open(AuthPassDialogComponent, {
      minWidth: '400px',
      data: {
        withModeSelector: true
      }
    });
  }

  sleep(time) {
    return new Promise(resolve=>{
      setTimeout(resolve, time);
    });
  }

  resetAll(loadautoexec?: boolean): Promise<boolean> {
    return this.stat
      .resetAll()
      .then(() => {
        return this.task.resetAll();
      })
      .then(ret => {
        if (!env.production) console.log('sys.en = 0');
        return this.ws.query('sys.en = 0');
      })
      .then(() => {
        if (!env.production) console.log('reset all');
        return this.ws.query('reset all');
      })
      .then(ret => {
        if (!env.production) console.log('reset all returned:', ret);
        if (ret.err) {
          this.trn
            .get('utils.err_reset', { result: errorString(ret.err) })
            .subscribe(err => {
                // this.snack.open(err, this.words['acknowledge']);
                this.snackbarService.openTipSnackBar(err);
            });
          return Promise.reject(false);
        }
        //   this.snack.open(this.words['utils.success'], null, { duration: 1500 });
          this.snackbarService.openTipSnackBar("utils.success");
        this.stat.startTpLibChecker();
        if (loadautoexec) {
          if (!env.production) console.log('loading autoexec.prg...');
          return this.ws.query('load autoexec.prg');
        }
      })
      .then(() => {
        if (!env.production) console.log('reset all done');
        return true;
      }).catch(err=>{
        return false;
      });
  }

  get PlatformList(): Platform[] {
    const platformList: Platform[] = [];
    for (const value of Object.values(env.platforms) as Platform[]) {
      platformList.push(value);
    }
    return platformList;
  }

  get IsKuka(): boolean {
    return env.platform.name === env.platforms.Kuka.name;
  }

  get isDarkMode(): boolean {
    return env.useDarkTheme;
  }

  set isDarkMode(val: boolean) {
    env.useDarkTheme = val;
    localStorage.setItem('darkMode',val?'1':'0');
  }

  get IsNotKuka(): boolean {
    return env.platform.name !== env.platforms.Kuka.name;
  }

  get isDebug(): boolean {
    return !env.production;
  }

  get theme(): string {
    return env.platform.name;
  }

  get IsScara(): boolean {
    return this.dataService.robotType === 'SCARA' ? true : false;
  }

  hiddenOverlayWrappers(): void {
    this.globalOverlayWrappers = document.getElementsByClassName('cdk-global-overlay-wrapper');
    if (this.globalOverlayWrappers && this.globalOverlayWrappers.length > 1) {
      for (let i = 0; i < this.globalOverlayWrappers.length - 1; i++) {
        if(this.globalOverlayWrappers[i].getElementsByTagName("sys-log-snack-bar").length > 0){
            continue;
        }
        this.globalOverlayWrappers[i].classList.add('global-hidden');
      }
    }
  }

  displayOverlayWrappers(): void {
    if (this.globalOverlayWrappers && this.globalOverlayWrappers.length >= 1) {
      for (let i = 0; i < this.globalOverlayWrappers.length; i++) {
        this.globalOverlayWrappers[i].classList.remove('global-hidden');
      }
    }
  }

  shrinkOverlay(): void {
    this.hiddenOverlayWrappers();
    this.overlayContainer.getContainerElement().classList.add('shrink-overlay');
    this.overlayContainer.getContainerElement().classList.remove('stretch-overlay');
    this.upperRightOverlayEle.classList.add('upper-right-conner-overlay-stretch');
    this.upperRightOverlayEle.classList.remove('upper-right-conner-overlay-shrink');
  }

  stretchOverlay(): void {
    this.displayOverlayWrappers();
    this.overlayContainer.getContainerElement().classList.remove('shrink-overlay');
    this.overlayContainer.getContainerElement().classList.add('stretch-overlay');
    this.upperRightOverlayEle.classList.remove('upper-right-conner-overlay-stretch');
    this.upperRightOverlayEle.classList.add('upper-right-conner-overlay-shrink');
  }

  removeShrinkStretchOverlay(): void {
    this.overlayContainer.getContainerElement().classList.remove('shrink-overlay');
    this.overlayContainer.getContainerElement().classList.remove('stretch-overlay');
    this.upperRightOverlayEle.classList.remove('upper-right-conner-overlay-stretch');
    this.upperRightOverlayEle.classList.remove('upper-right-conner-overlay-shrink');
  }

  public limitValidator(min: number, max: number, canBeDecimal = true, leftClosedInterval = true, rightClosedInterval = true): ValidatorFn {
    return ({ value }: AbstractControl): { [key: string]: any } | null => {
      if (value !== 0 && !!value === false) {
        return null;
      }
      let forbidden =
        Number(value) > max ||
        Number(value) < min ||
        (canBeDecimal ? false : (Number(value) % 1 !== 0)); // Check decimal number.
      if (!leftClosedInterval) {
        forbidden = Number(value) === min ? true : forbidden;
      }
      if (!rightClosedInterval) {
        forbidden = Number(value) === max ? true : forbidden;
      }
      if (Number(value).toString() === 'NaN') {
        forbidden = true;
      }
      return forbidden ? { limit: { min, max, value } } : null;
    };
  }

  parseINIString(data){
    var regex = {
      section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
      param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
      comment: /^\s*;.*$/
    };
    var value = {};
    var lines = data.split(/[\r\n]+/);
    var section = null;
    lines.forEach(function(line){
      if (regex.comment.test(line)) {
        return;
      } else if (regex.param.test(line)) {
        var match = line.match(regex.param);
        if (section) {
          value[section][match[1]] = match[2];
        } else {
          value[match[1]] = match[2];
        }
      } else if (regex.section.test(line)) {
          var match = line.match(regex.section);
          value[match[1]] = {};
          section = match[1];
      } else if (line.length == 0 && section) {
          section = null;
      };
    });
    return value;
  }
  
}
