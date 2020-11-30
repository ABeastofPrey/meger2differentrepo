import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  WebsocketService,
  ProjectManagerService,
  MCQueryResponse,
} from '../../../../core';

@Component({
  selector: 'app-save-as-dialog',
  templateUrl: './save-as-dialog.component.html',
  styleUrls: ['./save-as-dialog.component.css'],
})
export class SaveAsDialogComponent implements OnInit {
  name: string;
  submitting = false;

  constructor(
    public dialogRef: MatDialogRef<SaveAsDialogComponent, void>,
    private ws: WebsocketService,
    private prj: ProjectManagerService
  ) {}

  async create() {
    this.prj.stopStatusRefresh();
    await new Promise(resolve=>{setTimeout(resolve,300)});
    const name = this.name.toUpperCase();
    const proj = this.prj.currProject.value.name;
    this.submitting = true;
    this.ws
      .query('?prj_save_project_as("' + proj + '","' + name + '")')
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
