import { Component, OnInit, ViewChild } from '@angular/core';
import {ApiService} from '../../../../../modules/core/services/api.service';
import {LoginService} from '../../../../../modules/core/services/login.service';
import {MatTableDataSource, MatSort, MatDialog, MatSnackBar} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {YesNoDialogComponent} from '../../../../../components/yes-no-dialog/yes-no-dialog.component';
import {NewUserDialogComponent} from '../new-user-dialog/new-user-dialog.component';
import {User} from '../../../../core/models/user.model';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'user-mngr',
  templateUrl: './user-mngr.component.html',
  styleUrls: ['./user-mngr.component.css']
})
export class UserMngrComponent implements OnInit {
  
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  selection:SelectionModel<UserWithPic>=new SelectionModel<UserWithPic>(true,[]);
  
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private api : ApiService,
    private dialog : MatDialog,
    private snack : MatSnackBar,
    private login : LoginService,
    private trn: TranslateService
  ) {
    this.refreshUsers();
  }

  ngOnInit() {
  }
  
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
  
  refreshUsers() {
    return this.api.getUsers().then((users:UserWithPic[])=>{
      for (let u of users) {
        u.pic = this.api.getProfilePic(u.username);
      }
      this.dataSource.data = users;
      this.selection.clear();
    });
  }
  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row:UserWithPic) => this.selection.select(row));
  }
  
  deleteSelected() {
    this.trn.get('userManager.delete').subscribe(data=>{
      let ref = this.dialog.open(YesNoDialogComponent,{
        data: data
      });
      ref.afterClosed().subscribe(ret=>{
        if (ret) {
          let promises : Promise<any>[] = [];
          for (let u of this.selection.selected) {
            promises.push(this.api.deleteUser(u.username));
          }
          Promise.all(promises).then((ret:boolean[])=>{
            let success = true;
            for (let r of ret)
              success = success && r;
            if (success)
              this.snack.open(data['success'],'',{duration:2000});
            else
              this.snack.open(data['fail'],'',{duration:2000});
          },()=>{
            this.snack.open(data['err'],'',{duration:2000});
          }).then(()=>{
            this.refreshUsers().then(()=>{
              let found = false;
              for (let u of <UserWithPic[]>this.dataSource.data) {
                if (u.username === this.login.getCurrentUser().user.username)
                  found = true;
              }
              if (!found) // ACTIVE USER IS NOT ON THE LIST, PROBABLY DELETED
                this.login.logout();
            });
          });
        }
      });
    });
  }
  
  create() {
    let ref = this.dialog.open(NewUserDialogComponent);
    ref.afterClosed().subscribe(ret=>{
      if (ret)
        this.refreshUsers();
    })
  }

}

interface UserWithPic {
  fullName: string;
  permission: number;
  username: string;
  pic: string;
}
