import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  WebsocketService,
  ProjectManagerService,
  MCQueryResponse,
} from '../../../../core';
import { App } from '../../../../core/models/project/mc-project.model';

@Component({
  selector: 'app-new-lib-dialog',
  templateUrl: './new-lib-dialog.component.html',
  styleUrls: ['./new-lib-dialog.component.css'],
})
export class NewLibDialogComponent implements OnInit {
  name: string;
  appName: string;
  apps: App[];
  submitting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.appName = data;
  }

  create() {
    const name = this.name.toUpperCase();
    const proj = this.prj.currProject.value;
    const cmd =
      '?prj_add_app_library("' +
      proj.name +
      '","' +
      this.appName +
      '","' +
      name +
      '")';
    this.submitting = true;
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) this.submitting = false;
      else {
        this.prj.refreshAppList(proj, true).then(() => {
          this.prj.onExpandLib.emit({ app: this.appName, lib: name });
        });
        this.dialogRef.close();
      }
    });
  }

  ngOnInit() {
    this.name = '';
    this.apps = this.prj.currProject.value.apps;
  }
}
