import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  WebsocketService,
  ProjectManagerService,
  MCQueryResponse,
  DataService,
} from '../../../../core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-app-dialog',
  templateUrl: './new-app-dialog.component.html',
  styleUrls: ['./new-app-dialog.component.css'],
})
export class NewAppDialogComponent implements OnInit {

  submitting = false;

  dialogForm = new FormGroup({
    val: new FormControl('',[Validators.required, Validators.pattern('[a-zA-Z]+(\\w*)$'),Validators.maxLength(32)])
  });

  constructor(
    public dialogRef: MatDialogRef<NewAppDialogComponent, void>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: {
      newBackgroundTask: boolean,
      title: string,
      placeholder: string
    }
  ) {}

  create() {
    if (this.submitting || this.dialogForm.invalid) return;
    const name = (this.dialogForm.controls['val'].value as string).toUpperCase();
    const proj = this.prj.currProject.value;
    this.submitting = true;
    const cmd = 
        (!this.data.newBackgroundTask) ? 
          `?prj_add_app("${proj.name}","${name}")` :
          `BKG_addBgTask("${proj.name}", "${name}")`;
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

  public change(value: string): void {
      this.dialogForm.controls.val.setValue(value);
      this.dialogForm.controls.val.markAsTouched();
  }

  ngOnInit() {  }
}
