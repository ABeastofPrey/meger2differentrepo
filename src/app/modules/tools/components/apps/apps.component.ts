import { CabinetUpdateDialogComponent } from './../cabinet-update-dialog/cabinet-update-dialog.component';
import { CommonService } from './../../../core/services/common.service';
import { TaskService } from './../../../core/services/task.service';
import { environment } from './../../../../../environments/environment';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoginService } from '../../../../modules/core/services/login.service';
import {
  ApiService,
  UploadResult,
} from '../../../../modules/core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { WebsocketService } from '../../../../modules/core/services/websocket.service';
import { UpdateDialogComponent } from '../../../../components/update-dialog/update-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';
import { MCQueryResponse, DataService, TpStatService } from '../../../core';
import { FactoryRestoreComponent } from '../factory-restore/factory-restore.component';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';
import { InstallPluginComponent } from '../../../../modules/plugins/install-plugin/install-plugin.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PluginsService } from '../../../../modules/plugins/plugins.service';

@Component({
  selector: 'apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css'],
})
export class AppsComponent implements OnInit {
  /**
   * The key to store the upgrade version in the local storage.
   */
  private readonly OS_VERSION: string = 'osVersion';
  /**
   * The key to store the gui version in the local storage.
   */
  private readonly GUI_VERSION: string = 'guiVersion';
  /**
   * The key to store the web server version in the local storage.
   */
  private readonly WEBSERVER_VERSION: string = 'webServerVersion';
  /**
   * The key to store the softMC version in the local storage.
   */
  private readonly SOFT_MC_VERSION: string = 'softMCVersion';
  /**
   * The key to store the library version in the local storage.
   */
  private readonly LIB_VERSION: string = 'libraryVersion';

  /**
   * The query to get the os upgrade version.
   */
  private readonly OS_VERSION_QUERY: string = '?vi_getreleaseversion';

  @ViewChild('upload') uploadInput: ElementRef;

  @ViewChild('uploadPlugin') uploadPluginElementRef: ElementRef;

  private words: {};
  private _factoryAvailable = false;
  private _interval: number;

  private noticer: Subject<any> = new Subject<any>();

  constructor(
    public login: LoginService,
    private api: ApiService,
    private dialog: MatDialog,
    private snackbarService: SysLogSnackBarService,
    private ws: WebsocketService,
    private trn: TranslateService,
    public utils: UtilsService,
    public data: DataService,
    private task: TaskService,
    public cmn: CommonService,
    private pluginService: PluginsService
  ) {
    this.trn.get('apps').subscribe(words => {
      this.words = words;
    });
  }

  get factoryAvailable() {
    return this._factoryAvailable;
  }

  ngOnInit() {
    this.checkFactoryAvailable();
    this._interval = window.setInterval(() => {
      this.checkFactoryAvailable();
    }, 2000);
  }

  private async checkFactoryAvailable() {
    const tasks = await this.task.getList();
    this._factoryAvailable = tasks.some(t => {
      return t.name === 'FACTORY.LIB';
    });
  }

  ngOnDestroy() {
    clearInterval(this._interval);
    this.noticer.complete();
    this.noticer.unsubscribe();
  }

  cabinetUpdate() {
    if (this.cmn.isCloud) return;
    this.dialog.open(CabinetUpdateDialogComponent,{
      maxWidth: '600px',
      hasBackdrop: false
    }).afterClosed().subscribe(async ret=>{
      if (ret) {
        await this.ws.query('sys.en = 0');
        window.location.href = '/cabinet-update/';
      }
    });
  }

  uploadIPK() {
    if (this.cmn.isCloud) return;
    this.uploadInput.nativeElement.click();
  }

  restore() {
    if (this.cmn.isCloud) return;
    this.dialog.open(FactoryRestoreComponent);
  }

  reboot() {
    if (this.cmn.isCloud) return;
    const ref = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: this.words['reboot_confirm'],
    });
    ref.afterClosed().subscribe(ret => {
      if (ret) {
        this.dialog.open(UpdateDialogComponent, {
          disableClose: true,
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          closeOnNavigation: false,
          data: this.words['rebooting'],
          id: 'update',
        });
        this.ws.updateFirmwareMode = true;
        this.ws.query('?user sys_reboot(0,0,0)');
        setTimeout(() => {
          let ok = false;
          const interval = setInterval(() => {
            if (ok) return;
            this.api.getFile('isWebServerAlive.HTML').then(ret => {
              if (ok) return;
              ok = true;
              clearInterval(interval);
              window.location.reload();
            }).catch(err => {});
          }, 2000);
        }, 10000);
      }
    });
  }

  /**
   * Store the version information before OS upgrade.
   */
  private storeVersionInfo() {
    this.ws.query(this.OS_VERSION_QUERY).then(result => {
      localStorage.removeItem(this.OS_VERSION);
      localStorage.setItem(this.OS_VERSION, result.result);
      localStorage.removeItem(this.GUI_VERSION);
      localStorage.setItem(this.GUI_VERSION, environment.gui_ver);
      localStorage.removeItem(this.WEBSERVER_VERSION);
      localStorage.setItem(this.WEBSERVER_VERSION, this.data.JavaVersion);
      localStorage.removeItem(this.SOFT_MC_VERSION);
      localStorage.setItem(this.SOFT_MC_VERSION, this.data.MCVersion);
      localStorage.removeItem(this.LIB_VERSION);
      localStorage.setItem(this.LIB_VERSION, this.data.cabinetVer);
    });
  }

  onUploadFilesChange(e: { target: { files: File[]; value: File } }) {
    const file: File = e.target.files[0];
    this.storeVersionInfo();
    if (file && file.name.toUpperCase() === 'MCU_FW.ZIP') {
      const dialog = this.dialog.open(UpdateDialogComponent, {
        disableClose: true,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        closeOnNavigation: false,
        data: this.words['updating'],
        id: 'update',
      });
      this.api.uploadIPK(file).then((ret: UploadResult) => {
        e.target.value = null;
        if (ret.success) {
          this.ws.query('?UTL_UPDATE_MCU_FW').then((ret: MCQueryResponse) => {
            if (ret.result !== '0') {
                // this.snack.open(this.words['err_mcu'], '', { duration: 1500 });
              this.snackbarService.openTipSnackBar('err_mcu');
            }
            dialog.close();
          });
        } else dialog.close();
      });
      return;
    }
    const ref = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: this.words['firmware_confirm'],
    });
    ref.afterClosed().subscribe(ret => {
      if (!ret) {
        e.target.value = null;
        return;
      }
      const dialog = this.dialog.open(UpdateDialogComponent, {
        disableClose: true,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        closeOnNavigation: false,
        data: this.words['updating'],
        id: 'update',
      });
      for (const f of e.target.files) {
        this.api.uploadIPK(f).then(
          (ret: UploadResult) => {
            if (ret.success) {
              this.ws.updateFirmwareMode = true;
              this.ws.send('?user sys_reboot(0,0,0)', true);
              setTimeout(() => {
                let ok = false;
                const interval = setInterval(() => {
                  if (ok) return;
                  this.api.getFile('isWebServerAlive.HTML').then(() => {
                    if (ok) return;
                    ok = true;
                    clearInterval(interval);
                    const URL = window.location.href;
                    const i = URL.indexOf('?');
                    const finalURL = i === -1 ? URL : URL.substring(0,i);
                    const newURL = finalURL + '?from=firmware';
                    window.location.href = newURL;
                  });
                }, 2000);
              }, 10000);
            } else {
              dialog.close();
            }
          },
          (ret: HttpErrorResponse) => {
            // ON ERROR
            dialog.close();
            switch (ret.error.err) {
              default:
                break;
              case -2:
                this.trn
                  .get(['files.err_upload', 'dismiss'], { name: f.name })
                  .subscribe(words => {
                //   this.snack.open(
                //         words['files.err_upload'],
                //         words['dismiss']
                    //       );
                    this.snackbarService.openTipSnackBar('files.err_upload');
                  });
                break;
              case -3:
                this.trn
                  .get(['files.err_ext', 'dismiss'], { name: f.name })
                  .subscribe(words => {
                    //   this.snack.open(words['files.err_ext'], words['dismiss']);
                    this.snackbarService.openTipSnackBar('files.err_ext');
                  });
                break;
              case -3:
                this.trn
                  .get(['files.err_permission', 'dismiss'])
                  .subscribe(words => {
                //   this.snack.open(
                //         words['files.err_upload'],
                //         words['dismiss']
                //       );
                    this.snackbarService.openTipSnackBar('files.err_upload');
                  });
                break;
            }
          }
        );
      }
      e.target.value = null;
    });
  }

  public pluginDisabled: boolean = false;
  loadPluginFiles() {
    let unReadyTips = 'pluginInstall.unReady';
    if (this.cmn.isCloud || this.pluginDisabled) {
      this.snackbarService.openTipSnackBar(unReadyTips);
      return;
    }
    //plugin install is readied; robot is not runing and programs are not loading
    this.pluginService
      .inStallIsReady()
      .pipe(takeUntil(this.noticer))
      .subscribe(
        res => {
          if (!res) {
            this.pluginDisabled = false;
            this.snackbarService.openTipSnackBar(unReadyTips);
            return;
          }
          this.uploadPluginElementRef.nativeElement.click();
        },
        error => {
          this.pluginDisabled = false;
          this.snackbarService.openTipSnackBar(unReadyTips);
        }
      );
  }

  public pluginFiles: any;
  public onUploadFilesChangePlugin(e: {
    target: { files: File[]; value: File };
  }): void {
    this.pluginService
      .onUploadFilesChangePlugin(e)
      .subscribe((res: { error: string; file: File }) => {
        this.pluginFiles = null;
        if (res && res.error) {
          this.snackbarService.openTipSnackBar(res.error);
          return;
        }

        //check configfile right
        this.pluginService
          .readFile(res.file)
          .then((resConfig: { error?: string; successful?: boolean }) => {
            if (!resConfig || resConfig.error) {
              this.snackbarService.openTipSnackBar(resConfig.error);
              return;
            }

            this.dialog
              .open(InstallPluginComponent, {
                data: res.file,
                width: '480px',
                minHeight: '350px',
                maxHeight: '600px',
                hasBackdrop: true,
              })
              .afterClosed()
              .subscribe(res => {});
          });
      });
  }
}
