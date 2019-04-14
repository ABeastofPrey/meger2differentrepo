import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {LoginService} from '../../modules/core/services/login.service';
import {CommonService} from '../../modules/core/services/common.service';

@Component({
  selector: 'app-auth-pass-dialog',
  templateUrl: './auth-pass-dialog.component.html',
  styleUrls: ['./auth-pass-dialog.component.css']
})
export class AuthPassDialogComponent implements OnInit {
  
  val: string = '';
  username: string;

  constructor(
    public cmn: CommonService,
    private login: LoginService,
    private dialogRef: MatDialogRef<string>
  ) { }

  ngOnInit() {
    this.username = this.login.getCurrentUser().user.username;
  }
  
  confirm() {
    if (this.val.length === 0)
      return;
    this.dialogRef.close(this.val);
  }

}
