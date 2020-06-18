import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../../../../../modules/core/services/api.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { UserWithPic } from '../user-mngr/user-mngr.component';
import { LoginService } from '../../../../core';
import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import {UtilsService} from '../../../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.css'],
})
export class NewUserDialogComponent implements OnInit {

  permission = -1;

  private wordErr: string;

  private checkUsername: ValidatorFn = ctrl=>{
    const name = ctrl.value as string;
    if (name.trim().length === 0) {
      return {empty: true};
    }
    if (name.toLowerCase() === 'admin' || name.toLowerCase() === 'super') {
      return {reserved: true};
    }
    return null;
  }

  private checkPassword: ValidatorFn = ctrl=>{
    const pass = ctrl.value as string;
    if (!this.passwordConfirm) return null;
    if (pass.trim().length === 0) {
      this.passwordConfirm.disable();
      return { empty: true };
    }
    this.passwordConfirm.enable();
    return null;
  }

  private checkPasswords: ValidatorFn = ctrl=>{ // here we have the 'passwords' group
    if (!this.passwordValidator) {
      ctrl.disable();
      return null;
    }
    const pass = this.passwordValidator.value;
    const confirmPass = ctrl.value as string;
    return pass === confirmPass ? null : { mismatch: true };
  }

  fullNameControl = new FormControl('', [
    Validators.required,
    Validators.pattern('[A-Za-z]+ {1}[A-Za-z]+( [A-Za-z]+)*'),
  ]);

  userNameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.pattern('\\w+'),
    this.checkUsername
  ]);

  passwordValidator = new FormControl('', [
    Validators.required,
    this.checkPassword,
  ]);

  passwordConfirm = new FormControl('', [
    Validators.required,
    this.checkPasswords,
  ]);

  constructor(
    private api: ApiService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private ref: MatDialogRef<boolean>,
    private trn: TranslateService,
    public login: LoginService,
    private utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: UserWithPic
  ) {}

  ngOnInit() {
    if (this.data) {
      const user: UserWithPic = this.data;
      this.userNameControl.setValue(user.username);
      this.userNameControl.disable();
      this.fullNameControl.setValue(user.fullName);
      this.permission = user.permission;
    }
    this.trn.get('userManager.err').subscribe(word => {
      this.wordErr = word;
    });
  }


  create() {
    if (this.data) {
      return this.api
        .editUser(
          this.userNameControl.value,
          this.passwordValidator.value,
          this.fullNameControl.value,
          this.permission
        )
        .then((res: string) => {
          if (res) this.ref.close(true);
          else {
            //   this.snack.open(this.wordErr, '', { duration: 2000 });
              this.snackbarService.openTipSnackBar(this.wordErr);
          }
        });
    }
    this.api
      .signup(
        this.userNameControl.value,
        this.passwordValidator.value,
        this.fullNameControl.value,
        this.permission
      )
      .then((res: string) => {
        if (res) this.ref.close(true);
        else {
            // this.snack.open(this.wordErr, '', { duration: 2000 });
            this.snackbarService.openTipSnackBar(this.wordErr);
        }
      });
  }
}
