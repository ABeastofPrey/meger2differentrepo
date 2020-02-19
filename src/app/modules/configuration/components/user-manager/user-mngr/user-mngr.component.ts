import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../../modules/core/services/api.service';
import { LoginService } from '../../../../../modules/core/services/login.service';
import {
  MatTableDataSource,
  MatSort,
  MatDialog,
  MatSnackBar,
} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { YesNoDialogComponent } from '../../../../../components/yes-no-dialog/yes-no-dialog.component';
import { NewUserDialogComponent } from '../new-user-dialog/new-user-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'user-mngr',
  templateUrl: './user-mngr.component.html',
  styleUrls: ['./user-mngr.component.css'],
})
export class UserMngrComponent implements OnInit {
  dataSource: MatTableDataSource<UserWithPic> = new MatTableDataSource();
  selection: SelectionModel<UserWithPic> = new SelectionModel<UserWithPic>(
    true,
    []
  );

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  private words: {};

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    public login: LoginService,
    private trn: TranslateService
  ) {
    this.refreshUsers();
    this.trn
      .get(['userManager.delete', 'success', 'dismiss'])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  refreshUsers() {
    return this.api.getUsers().then((users: UserWithPic[]) => {
      for (const u of users) {
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
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: UserWithPic) =>
          this.selection.select(row)
        );
  }

  deleteSelected() {
    const ref = this.dialog.open(YesNoDialogComponent, {
      data: this.words['userManager.delete'],
    });
    ref.afterClosed().subscribe(ret => {
      if (ret) {
        const promises = [];
        const selected = this.selection.selected;
        for (const u of selected) {
          promises.push(this.api.deleteUser(u.username));
        }
        Promise.all(promises)
          .then(
            (ret: boolean[]) => {
              let success = true;
              for (const r of ret) success = success && r;
              if (success) {
                this.snack.open(
                  this.words['userManager.delete']['success'],
                  '',
                  { duration: 2000 }
                );
              }
              else if (selected.find(u=>u.username === 'admin')) {
                this.snack.open(this.words['userManager.delete']['fail2'], '', {
                  duration: 2000,
                });
              } else {
                this.snack.open(this.words['userManager.delete']['fail'], '', {
                  duration: 2000,
                });
              }
            },
            () => {
              this.snack.open(this.words['userManager.delete']['err'], '', {
                duration: 2000,
              });
            }
          )
          .then(() => {
            this.refreshUsers().then(() => {
              let found = false;
              for (const u of this.dataSource.data as UserWithPic[]) {
                if (u.username === this.login.getCurrentUser().user.username) {
                  found = true;
                }
              }
              if (!found) {
                // ACTIVE USER IS NOT ON THE LIST, PROBABLY DELETED
                this.login.logout();
              }
            });
          });
      }
    });
  }

  create() {
    const ref = this.dialog.open(NewUserDialogComponent,{
      minWidth: '320px'
    });
    ref.afterClosed().subscribe(ret => {
      if (ret) this.refreshUsers();
    });
  }

  editUser(row: UserWithPic) {
    this.dialog
      .open(NewUserDialogComponent, {
        data: row,
        minWidth: '320px'
      })
      .afterClosed()
      .subscribe(ret => {
        if (ret) {
          this.refreshUsers();
          this.snack.open(this.words['success'], this.words['dismiss'], {
            duration: 1500,
          });
        }
      });
  }
}

export interface UserWithPic {
  fullName: string;
  permission: number;
  username: string;
  pic: string;
}
