import { Component, OnInit } from '@angular/core';
import {
  DataService,
  WebsocketService,
  MCQueryResponse,
  LoginService,
  ApiService,
} from '../../../core';
import { environment } from '../../../../../environments/environment';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.css'],
})
export class BugReportComponent implements OnInit {
  private env = environment;
  private words: any;

  contact: string = '';
  isSending: boolean = false;
  email = new FormControl('', [Validators.required, Validators.email]);
  msg = new FormControl('', [Validators.required, Validators.minLength(5)]);

  constructor(
    private data: DataService,
    private ws: WebsocketService,
    private login: LoginService,
    private api: ApiService,
    private ref: MatDialogRef<any>,
    private snack: MatSnackBar,
    private trn: TranslateService
  ) {}

  ngOnInit() {
    this.trn.get(['']).subscribe(words => {
      this.words = words;
    });
  }

  report() {
    this.isSending = true;
    const data = this.data;
    const promises = [
      this.ws.query('?sys.information'),
      this.ws.query('?sys.serialNumber'),
      this.ws.query('?errorhistory'),
    ];
    Promise.all(promises).then((ret: MCQueryResponse[]) => {
      const info =
        '\n\n---------------------------------------------------------------------------------------------------\n' +
        ret[0].result +
        '\n' +
        ret[1].result +
        '\n---------------------------------------------------------------------------------------------------\n' +
        'Cabinet:\t\t\t' +
        data.cabinetVer +
        '\n' +
        'CS+:\t\t\t' +
        this.env.gui_ver +
        '\n' +
        'Web Server:\t\t\t' +
        data.JavaVersion +
        '\n' +
        'TP.LIB:\t\t\t' +
        data.TPVersion +
        '\n' +
        'Pallet:\t\t\t' +
        data.palletLibVer +
        '\n' +
        'Grippers:\t\t\t' +
        data.gripperLibVer +
        '\n' +
        'Payloads:\t\t\t' +
        data.payloadLibVer +
        '\n' +
        'LBN:\t\t\t' +
        data.LeadByNoseLibVer +
        '\n' +
        'IOMAP:\t\t\t' +
        data.iomapVer +
        '\n' +
        'MCU:\t\t\t' +
        data.mcuVer +
        '\n\n';
      const user = this.login.getCurrentUser().user;
      const userInfo =
        user.fullName + '(' + user.username + '): ' + user.permission;
      this.trn.get('help.bug_body').subscribe(body => {
        body = encodeURIComponent(
          body +
            '\n\n------------------------------------------------------\n\n' +
            this.msg.value
        );
        const url =
          'mailto://csbugs@servotronix.com?subject=ControlStudio+%20Bug%20Report&body=' +
          body;
        this.api.bugReport(info, userInfo, ret[2].result).then(ret => {
          if (ret) {
            this.api.downloadSysZip();
            setTimeout(() => {
              window.location.href = url;
            }, 7000);
          }
        });
        this.isSending = false;
        this.ref.close();
      });
    });
  }
}
