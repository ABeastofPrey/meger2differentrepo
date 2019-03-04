import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {LoginService} from '../../../../modules/core/services/login.service';
import {ApiService, UploadResult} from '../../../../modules/core/services/api.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {HttpErrorResponse} from '@angular/common/http';
import {WebsocketService} from '../../../../modules/core/services/websocket.service';
import {UpdateDialogComponent} from '../../../../components/update-dialog/update-dialog.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {
  
  @ViewChild('upload') uploadInput: ElementRef;
  
  private words: any;

  constructor(
    public login: LoginService,
    private api: ApiService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private ws: WebsocketService,
    private trn: TranslateService
  ) {
    this.trn.get('apps').subscribe(words=>{
      this.words = words;
    });
  }

  ngOnInit() {
  }
  
  uploadIPK() { this.uploadInput.nativeElement.click(); }
  
  reboot() {
    let ref = this.dialog.open(YesNoDialogComponent,{
      width: '400px',
      data: this.words['reboot_confirm']
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        this.dialog.open(UpdateDialogComponent,{
          disableClose: true,
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          closeOnNavigation: false,
          data: this.words['rebooting'],
          id: 'update'
        });
        this.ws.updateFirmwareMode = true;
        this.ws.query('?user sys_reboot(0,0,0)');
        setTimeout(()=>{
          let ok = false;
          let interval = setInterval(()=>{
            if (ok)
              return;
            this.api.getFile("isWebServerAlive.HTML").then(ret=>{
              ok = true;
              clearInterval(interval);
              location.reload(true);
            }).catch(err=>{
            });
          },2000);
        },10000);
      }
    });
  }
  
  onUploadFilesChange(e:any) {
    let ref = this.dialog.open(YesNoDialogComponent,{
      width: '400px',
      data: this.words['firmware_confirm']
    });
    ref.afterClosed().subscribe(ret=>{
      if (!ret) {
        e.target.value = null;
        return;
      }
      let dialog = this.dialog.open(UpdateDialogComponent,{
        disableClose: true,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        closeOnNavigation: false,
        data: this.words['updating'],
        id: 'update'
      });
      for(let f of e.target.files) {
        this.api.uploadIPK(f).then((ret: UploadResult)=>{
          if (ret.success) {
            this.ws.updateFirmwareMode = true;
            this.ws.send('?user sys_reboot(0,0,0)');
            setTimeout(()=>{
              let ok = false;
              let interval = setInterval(()=>{
                if (ok)
                  return;
                this.api.getFile("isWebServerAlive.HTML").then(()=>{
                  ok = true;
                  clearInterval(interval);
                  location.href = location.href + '?from=firmware';
                });
              },2000);
            },10000);
          } else {
            dialog.close();
          }
        },(ret:HttpErrorResponse)=>{ // ON ERROR
          dialog.close();
          switch (ret.error.err) {
            case -2:
              this.trn.get(['files.err_upload','dismiss'],{name:f.name})
              .subscribe(words=>{
                this.snack.open(words['files.err_upload'],words['dismiss']);
              });
              break;
            case -3:
              this.trn.get(['files.err_ext','dismiss'],{name:f.name})
              .subscribe(words=>{
                this.snack.open(words['files.err_ext'],words['dismiss']);
              });
              break;
            case -3:
              this.trn.get(['files.err_permission','dismiss'])
              .subscribe(words=>{
                this.snack.open(words['files.err_upload'],words['dismiss']);
              });
              break;
          }
        });
      }
      e.target.value = null;
    });
  }

}
