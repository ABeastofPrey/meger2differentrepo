import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoginService } from '../../modules/core/services/login.service';
import { CommonService } from '../../modules/core/services/common.service';

@Component({
  selector: 'app-auth-pass-dialog',
  templateUrl: './auth-pass-dialog.component.html',
  styleUrls: ['./auth-pass-dialog.component.css'],
})
export class AuthPassDialogComponent implements OnInit {
  
  val: string = '';
  username: string;
  mode: string;

  constructor(
    public cmn: CommonService,
    private login: LoginService,
    private dialogRef: MatDialogRef<string>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.mode = this.data.currentMode;
    this.username = this.login.getCurrentUser().user.username;
  }

  confirm() {
    if (this.val.length === 0) return;
    const result = this.data.withModeSelector ? {
      mode: this.mode,
      pass: this.val
    } : this.val;
    this.dialogRef.close(result);
  }
}
