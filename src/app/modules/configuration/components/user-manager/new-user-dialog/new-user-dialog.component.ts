import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../../../../../modules/core/services/api.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { UserWithPic } from '../user-mngr/user-mngr.component';
import { LoginService } from '../../../../core';
import { FormControl, Validators, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.css'],
})
export class NewUserDialogComponent implements OnInit {

  username = '';
  password = '';
  permission = -1;

  private wordErr: string;

  fullNameControl = new FormControl('', [
    Validators.required,
    Validators.pattern('[A-Za-z]+ {1}[A-Za-z]+( [A-Za-z]+)*'),
  ]);

  private checkPasswords: ValidatorFn = ctrl=>{ // here we have the 'passwords' group
    const confirmPass = ctrl.value as string;
    return this.password === confirmPass ? null : { mismatch: true };
  }

  passwordConfirm = new FormControl('', [
    Validators.required,
    this.checkPasswords,
  ]);

  constructor(
    private api: ApiService,
    private snack: MatSnackBar,
    private ref: MatDialogRef<boolean>,
    private trn: TranslateService,
    public login: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: UserWithPic
  ) {}

  ngOnInit() {
    if (this.data) {
      const user: UserWithPic = this.data;
      this.username = user.username;
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
          this.username,
          this.password,
          this.fullNameControl.value,
          this.permission
        )
        .then((res: string) => {
          if (res) this.ref.close(true);
          else this.snack.open(this.wordErr, '', { duration: 2000 });
        });
    }
    this.api
      .signup(
        this.username,
        this.password,
        this.fullNameControl.value,
        this.permission
      )
      .then((res: string) => {
        if (res) this.ref.close(true);
        else this.snack.open(this.wordErr, '', { duration: 2000 });
      });
  }
}
