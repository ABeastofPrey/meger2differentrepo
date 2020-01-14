import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
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
    private dialog: MatDialog,
    private trn: TranslateService,
    public dataService: DataService,
    private overlayContainer: OverlayContainer
  ) {
    this.trn.get(['utils.success', 'acknowledge']).subscribe(words => {
      this.words = words;
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
            .get('utils.err_reset', { result: ret.err.errMsg })
            .subscribe(err => {
              this.snack.open(err, this.words['acknowledge']);
            });
          return Promise.reject(false);
        }
        this.snack.open(this.words['utils.success'], null, { duration: 1500 });
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

  public limitValidator(min: number, max: number, canBeDecimal = true): ValidatorFn {
      return ({ value }: AbstractControl): { [key: string]: any } | null => {
          if (value !== 0 && !!value === false) {
              return null;
          }
          let forbidden =
              Number(value).toString() === 'NaN' ||
              Number(value) > max ||
              Number(value) < min ||
              (canBeDecimal ? false : (Number(value) % 1 !== 0)); // Check decimal number.
          return forbidden ? { limit: { min, max, value } } : null;
      };
  }
}
