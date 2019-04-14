import { Component, OnInit, Inject } from '@angular/core';
import {ApiService} from '../../../../../modules/core/services/api.service';
import {MatSnackBar, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {UserWithPic} from '../user-mngr/user-mngr.component';
import {LoginService} from '../../../../core';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.css']
})
export class NewUserDialogComponent implements OnInit {
  
  username : string = '';
  password : string = '';
  passwordConfirm: string = '';
  fullName : string = '';
  permission : number = -1;
  
  private wordErr: string;

  constructor(
    private api: ApiService,
    private snack : MatSnackBar,
    private ref : MatDialogRef<any>,
    private trn: TranslateService,
    public login: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data) {
      const user: UserWithPic = this.data;
      this.username = user.username;
      this.fullName = user.fullName;
      this.permission = user.permission;
    }
    this.trn.get('userManager.err').subscribe(word=>{
      this.wordErr = word;
    });
  }
  
  create() {
    if (this.data) {
      return this.api.editUser(this.username, this.password, this.fullName, this.permission)
      .then((res:string)=>{
        if (res)
          this.ref.close(true);
        else
          this.snack.open(this.wordErr,'',{duration:2000});
      });
    }
    this.api.signup(this.username,this.password,this.fullName,this.permission)
    .then((res:string)=>{
      if (res)
        this.ref.close(true);
      else
        this.snack.open(this.wordErr,'',{duration:2000});
    });
  }

}
