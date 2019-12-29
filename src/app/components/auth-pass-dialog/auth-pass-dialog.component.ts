import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './../../modules/core/services/api.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { LoginService } from '../../modules/core/services/login.service';
import { CommonService } from '../../modules/core/services/common.service';

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
    @Inject(MAT_DIALOG_DATA) public data: {
      withModeSelector?: boolean,
      currentMode: string
    }
  ) {}

  ngOnInit() {
    this.mode = this.data.currentMode;
    this.username = this.login.getCurrentUser().user.username;
  }

  async confirm() {
    if (this.val.length === 0) return;
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
