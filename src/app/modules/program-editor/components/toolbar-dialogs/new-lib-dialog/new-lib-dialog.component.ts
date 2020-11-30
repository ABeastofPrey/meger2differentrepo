import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  WebsocketService,
  ProjectManagerService,
  MCQueryResponse,
} from '../../../../core';
import { App } from '../../../../core/models/project/mc-project.model';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-lib-dialog',
  templateUrl: './new-lib-dialog.component.html',
  styleUrls: ['./new-lib-dialog.component.css'],
})
export class NewLibDialogComponent implements OnInit {

  appName: string;
  apps: App[];
  submitting = false;
  libName: FormControl;

  constructor(
    public dialogRef: MatDialogRef<NewLibDialogComponent, void>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.appName = data;
  }

  create() {
    const name = this.libName.value.toUpperCase();
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

  change(value: string): void {
      this.libName.setValue(value);
      this.libName.markAsTouched();
  }

  ngOnInit() {
    this.libName = new FormControl('',[
      Validators.maxLength(32),
      Validators.required,
      Validators.pattern('[a-zA-Z]+(\\w*)$')
    ]);
    this.apps = this.prj.currProject.value.apps;
  }
}
