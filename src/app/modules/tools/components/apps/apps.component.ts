import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {LoginService} from '../../../../modules/core/services/login.service';
import {ApiService, UploadResult} from '../../../../modules/core/services/api.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {HttpErrorResponse} from '@angular/common/http';
import {WebsocketService} from '../../../../modules/core/services/websocket.service';
import {FirmwareUpdateComponent} from '../firmware-update/firmware-update.component';

@Component({
  selector: 'apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {
  
  @ViewChild('upload') uploadInput: ElementRef;

  constructor(
    public login: LoginService,
    private api: ApiService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private ws: WebsocketService
  ) { }

  ngOnInit() {
  }
  
  uploadIPK() { this.uploadInput.nativeElement.click(); }
  
  onUploadFilesChange(e:any) {
    let ref = this.dialog.open(YesNoDialogComponent,{
      width: '400px',
      data: {
        title: 'Update softMC Firmware',
        msg: "softMC Will disconnect in the process. Please make sure you've saved all changes before proceeding.",
        yes: 'UPDATE FIRMWARE',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (!ret) {
        e.target.value = null;
        return;
      }
      let dialog = this.dialog.open(FirmwareUpdateComponent,{
        disableClose: true,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        closeOnNavigation: false
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
              this.snack.open('ERROR UPLOADING ' + f.name,'DISMISS');
              break;
            case -3:
              this.snack.open('INVALID EXTENSION IN ' + f.name,'DISMISS');
              break;
            case -3:
              this.snack.open('PERMISSION DENIED','DISMISS');
              break;
          }
        });
      }
      e.target.value = null;
    });
  }

}
