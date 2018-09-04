import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../../../modules/core/services/api.service';
import {MatSnackBar, MatDialogRef} from '@angular/material';

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

  constructor(
    private api: ApiService,
    private snack : MatSnackBar,
    private ref : MatDialogRef<any>
  ) { }

  ngOnInit() {
  }
  
  create() {
    this.api.signup(this.username,this.password,this.fullName,this.permission)
    .then((res:string)=>{
      console.log(res);
      if (res)
        this.ref.close(true);
      else
        this.snack.open("Error: Missing parameters or User already exists",'',{duration:2000});
    });
  }

}
