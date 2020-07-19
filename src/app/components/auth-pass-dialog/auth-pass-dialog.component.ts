import { TpStatService } from './../../modules/core/services/tp-stat.service';
import { ApiService } from './../../modules/core/services/api.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoginService } from '../../modules/core/services/login.service';
import { CommonService } from '../../modules/core/services/common.service';
import { DataService } from '../../modules/core/services/data.service';

@Component({
  selector: 'app-auth-pass-dialog',
  templateUrl: './auth-pass-dialog.component.html',
  styleUrls: ['./auth-pass-dialog.component.css'],
})
export class AuthPassDialogComponent implements OnInit {
  
  val = '';
  username = '';
  mode = '';
  isError = false;

  constructor(
    public cmn: CommonService,
    private login: LoginService,
    private dialogRef: MatDialogRef<AuthPassDialogComponent,string | {}>,
    private api: ApiService,
    private stat: TpStatService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: {
      withModeSelector?: boolean,
      currentMode: string
    }
  ) {}

  ngOnInit() {
    this.mode = this.stat.mode;
    this.username = this.login.getCurrentUser().user.username;
  }

  async confirm() {
    if (this.val.length === 0) return;
    if (this.data.withModeSelector) {
      // authenticate with web server
      const auth = await this.api.confirmSafetyPass(this.val);
      if (!auth) {
        // wrong password
        this.isError = true;
        return;
      }
      const ret = await this.stat.setMode(this.mode);
      if (ret) {
        this.dialogRef.close(this.mode);
      } else {
        this.isError = true;
      }
      return;
    }
    try {
      const ret = await this.api.confirmPass(this.username, this.val);
      if (ret) {
        this.dialogRef.close(this.mode);
      } else {
        this.isError = true;
      }
    } catch (err) {
      console.log(err);
    }
  }
}