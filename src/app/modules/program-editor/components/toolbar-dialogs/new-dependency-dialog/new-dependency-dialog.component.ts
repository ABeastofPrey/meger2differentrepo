import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {WebsocketService, ProjectManagerService, MCQueryResponse} from '../../../../core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-dependency-dialog',
  templateUrl: './new-dependency-dialog.component.html',
  styleUrls: ['./new-dependency-dialog.component.css'],
})
export class NewDependencyDialogComponent implements OnInit {
  
  submitting = false;

  dialogForm = new FormGroup({
    val: new FormControl('',[Validators.required, Validators.pattern('[a-zA-Z]+(\\w*)$'),Validators.maxLength(32)])
  });

  constructor(
    public dialogRef: MatDialogRef<NewDependencyDialogComponent, void>,
    private ws: WebsocketService,
    private prj: ProjectManagerService
  ) {}

  create() {
    if (this.submitting || this.dialogForm.invalid) return;
    const name = (this.dialogForm.controls['val'].value as string).toUpperCase() + '.ULB';
    const proj = this.prj.currProject.value;
    this.submitting = true;
    const cmd = '?prj_add_dependency("' + proj.name + '","USER","' + name + '")';
    this.ws
      .query(cmd)
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0' || ret.err) this.submitting = false;
        else {
          this.prj.refreshDependencies(proj).then(() => {
            this.prj.currProject.next(proj);
            this.prj.onExpandDep.emit(name);
          });
          this.dialogRef.close();
        }
      }
    );
  }

  public change(value: string): void {
    this.dialogForm.controls.val.setValue(value);
    this.dialogForm.controls.val.markAsTouched();
  }

  ngOnInit() {}
}
