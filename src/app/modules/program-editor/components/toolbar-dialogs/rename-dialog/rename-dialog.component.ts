import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  WebsocketService,
  ProjectManagerService,
  MCQueryResponse,
} from '../../../../core';

@Component({
  selector: 'app-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.css'],
})
export class RenameDialogComponent implements OnInit {
  name: string;
  submitting = false;

  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent, void>,
    private ws: WebsocketService,
    private prj: ProjectManagerService
  ) {}

  rename() {
    const name = this.name.toUpperCase();
    const proj = this.prj.currProject.value.name;
    this.submitting = true;
    this.ws
      .query('?prj_rename_project("' + proj + '","' + name + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0' || ret.err) this.submitting = false;
        else {
          this.prj.getCurrentProject().then(() => {
            this.prj.onExpand.emit(0);
          });
          this.dialogRef.close();
        }
      });
  }

  ngOnInit() {
    this.name = '';
  }
}
