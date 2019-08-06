import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  WebsocketService,
  ProjectManagerService,
  MCQueryResponse,
  DataService,
} from '../../../../core';

@Component({
  selector: 'app-new-app-dialog',
  templateUrl: './new-app-dialog.component.html',
  styleUrls: ['./new-app-dialog.component.css'],
})
export class NewAppDialogComponent implements OnInit {
  name: string;
  submitting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  create() {
    if (this.isValueInvalid()) return;
    const name = this.name.toUpperCase();
    const proj = this.prj.currProject.value;
    this.submitting = true;
    const cmd = (!this.data.newBackgroundTask) ? `?prj_add_app("${proj.name}","${name}")` : `BKG_addBgTask("${proj.name}", "${name}")`;
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if ((!this.data.newBackgroundTask) && (ret.result !== '0' || ret.err)) {
          this.submitting = false;
        } else if (this.data.newBackgroundTask && ret.err) {
          console.warn(`Create background task ${name} failed.`);
          this.dialogRef.close();
        } else {
          this.dataService
            .refreshDomains()
            .then(() => this.prj.refreshAppList(proj, true))
            .then(() => {
              this.prj.onExpand.emit(!this.data.newBackgroundTask ? 0 : 1);
            });
          this.dialogRef.close();
        }
      });
  }

  ngOnInit() {
    this.name = '';
  }

  isValueInvalid() {
    return !this.name || this.name.length === 0 || this.submitting;
  }
}
