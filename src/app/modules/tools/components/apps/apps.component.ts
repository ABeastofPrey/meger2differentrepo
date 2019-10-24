import { environment } from './../../../../../environments/environment';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoginService } from '../../../../modules/core/services/login.service';
import {
  ApiService,
  UploadResult,
} from '../../../../modules/core/services/api.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { WebsocketService } from '../../../../modules/core/services/websocket.service';
import { UpdateDialogComponent } from '../../../../components/update-dialog/update-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';
import { MCQueryResponse, DataService } from '../../../core';
import { FactoryRestoreComponent } from '../factory-restore/factory-restore.component';

@Component({
  selector: 'apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css'],
})
export class AppsComponent implements OnInit {
  /**
   * The key to store the upgrade version in the local storage.
   */
  private readonly OSVersion: string = 'osVersion';
  /**
   * The key to store the gui version in the local storage.
   */
  private readonly GUIVersion: string = 'guiVersion';
  /**
   * The key to store the web server version in the local storage.
   */
  private readonly WebServerVersion: string = 'webServerVersion';
  /**
   * The key to store the softMC version in the local storage.
   */
  private readonly SoftMCVersion: string = 'softMCVersion';
  /**
   * The key to store the library version in the local storage.
   */
  private readonly LibraryVersion: string = 'libraryVersion';

  /**
   * The query to get the os upgrade version.
   */
  private readonly OSVersionQuery: string = '?vi_getreleaseversion';

  @ViewChild('upload', { static: false }) uploadInput: ElementRef;

  private words: any;

  constructor(
    public login: LoginService,
    private api: ApiService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private ws: WebsocketService,
    private trn: TranslateService,
    public utils: UtilsService,
    public data: DataService
  ) {
    this.trn.get('apps').subscribe(words => {
      this.words = words;
    });
  }

  ngOnInit() {}

  uploadIPK() {
    this.uploadInput.nativeElement.click();
  }

  restore() {
    this.dialog.open(FactoryRestoreComponent);
  }

  reboot() {
    let ref = this.dialog.open(YesNoDialogComponent, {
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
          let interval = setInterval(() => {
            if (ok) return;
            this.api
              .getFile('isWebServerAlive.HTML')
              .then(ret => {
                ok = true;
                clearInterval(interval);
                location.reload(true);
              })
              .catch(err => {});
          }, 2000);
        }, 10000);
      }
    });
  }

  /**
   * Store the version information before OS upgrade.
   */
  private storeVersionInfo() {
    this.ws.query(this.OSVersionQuery).then((result: MCQueryResponse) => {
      localStorage.removeItem(this.OSVersion);
      localStorage.setItem(this.OSVersion, result.result);
      localStorage.removeItem(this.GUIVersion);
      localStorage.setItem(this.GUIVersion, environment.gui_ver);
      localStorage.removeItem(this.WebServerVersion);
      localStorage.setItem(this.WebServerVersion, this.data.JavaVersion);
      localStorage.removeItem(this.SoftMCVersion);
      localStorage.setItem(this.SoftMCVersion, this.data.MCVersion);
      localStorage.removeItem(this.LibraryVersion);
      localStorage.setItem(this.LibraryVersion, this.data.cabinetVer);
    });
  }

  onUploadFilesChange(e: any) {
    const file: File = e.target.files[0];
    this.storeVersionInfo();
    if (file && file.name.toUpperCase() === 'MCU_FW.ZIP') {
      let dialog = this.dialog.open(UpdateDialogComponent, {
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
              this.snack.open(this.words['err_mcu'], '', { duration: 1500 });
            }
            dialog.close();
          });
        } else dialog.close();
      });
      return;
    }
    let ref = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: this.words['firmware_confirm'],
    });
    ref.afterClosed().subscribe(ret => {
      if (!ret) {
        e.target.value = null;
        return;
      }
      let dialog = this.dialog.open(UpdateDialogComponent, {
        disableClose: true,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        closeOnNavigation: false,
        data: this.words['updating'],
        id: 'update',
      });
      for (let f of e.target.files) {
        this.api.uploadIPK(f).then(
          (ret: UploadResult) => {
            if (ret.success) {
              this.ws.updateFirmwareMode = true;
              this.ws.send('?user sys_reboot(0,0,0)', true);
              setTimeout(() => {
                let ok = false;
                let interval = setInterval(() => {
                  if (ok) return;
                  this.api.getFile('isWebServerAlive.HTML').then(() => {
                    ok = true;
                    clearInterval(interval);
                    location.href = location.href + '?from=firmware';
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
              case -2:
                this.trn
                  .get(['files.err_upload', 'dismiss'], { name: f.name })
                  .subscribe(words => {
                    this.snack.open(
                      words['files.err_upload'],
                      words['dismiss']
                    );
                  });
                break;
              case -3:
                this.trn
                  .get(['files.err_ext', 'dismiss'], { name: f.name })
                  .subscribe(words => {
                    this.snack.open(words['files.err_ext'], words['dismiss']);
                  });
                break;
              case -3:
                this.trn
                  .get(['files.err_permission', 'dismiss'])
                  .subscribe(words => {
                    this.snack.open(
                      words['files.err_upload'],
                      words['dismiss']
                    );
                  });
                break;
            }
          }
        );
      }
      e.target.value = null;
    });
  }
}
