import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { WebsocketService, MCQueryResponse } from '../../../core';

@Component({
  selector: 'app-open-project-dialog',
  templateUrl: './open-project-dialog.component.html',
  styleUrls: ['./open-project-dialog.component.css'],
})
export class OpenProjectDialogComponent implements OnInit {
  project: string = null;
  projects: string[];

  constructor(
    public dialogRef: MatDialogRef<any>,
    private ws: WebsocketService
  ) {}

  open() {
    this.dialogRef.close(this.project);
  }

  ngOnInit() {
    this.ws.query('?prj_get_list_of_projects').then((ret: MCQueryResponse) => {
      if (ret.result.length > 0) this.projects = ret.result.split(',');
    });
  }
}
