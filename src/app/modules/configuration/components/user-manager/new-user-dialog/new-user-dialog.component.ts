import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../../../modules/core/services/api.service';
import {MatSnackBar, MatDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.css']
})
export class NewUserDialogComponent implements OnInit {
  
  username : string = '';
  password : string = '';
  fullName : string = '';
  permission : number = -1;
  
  private wordErr: string;

  constructor(
    private api: ApiService,
    private snack : MatSnackBar,
    private ref : MatDialogRef<any>,
    private trn: TranslateService
  ) { }

  ngOnInit() {
    this.trn.get('userManager.err').subscribe(word=>{
      this.wordErr = word;
    });
  }
  
  create() {
    this.api.signup(this.username,this.password,this.fullName,this.permission)
    .then((res:string)=>{
      if (res)
        this.ref.close(true);
      else
        this.snack.open(this.wordErr,'',{duration:2000});
    });
  }

}
