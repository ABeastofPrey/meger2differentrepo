import { WebsocketService } from './../../../../core/services/websocket.service';
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
import {UtilsService} from '../../../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../../../sys-log/services/sys-log-snack-bar.service';

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
    private snackbarService: SysLogSnackBarService,
    public login: LoginService,
    private trn: TranslateService,
    private utils: UtilsService,
    private ws: WebsocketService
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
    return numSelected === numRows - 1;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: UserWithPic) => {
        if (row.username === this.login.getCurrentUser().user.username) return;
        this.selection.select(row)
      });
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
          if (u.username !== this.login.getCurrentUser().user.username) {
            promises.push(this.api.deleteUser(u.username));
          }
        }
        Promise.all(promises).then((ret: boolean[]) => {
          let success = true;
          for (const r of ret) success = success && r;
          if (success) {
              this.snackbarService.openTipSnackBar("userManager.delete.success");
          }
          else if (selected.find(u=>u.username === 'admin')) {
              this.snackbarService.openTipSnackBar("userManager.delete.fail2");
          } else {
              this.snackbarService.openTipSnackBar("userManager.delete.fail");
          }
        },
        () => {
            this.snackbarService.openTipSnackBar("userManager.delete.err");
        }).then(() => {
          this.refreshUsers();
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
        //   this.snack.open(this.words['success'], this.words['dismiss'], {
        //       duration: 1500,
        //     });
          this.snackbarService.openTipSnackBar("success");
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
