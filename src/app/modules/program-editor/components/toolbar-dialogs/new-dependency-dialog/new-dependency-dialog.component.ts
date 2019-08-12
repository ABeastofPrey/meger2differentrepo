import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {WebsocketService, ProjectManagerService, DataService, MCQueryResponse} from '../../../../core';

@Component({
  selector: 'app-new-dependency-dialog',
  templateUrl: './new-dependency-dialog.component.html',
  styleUrls: ['./new-dependency-dialog.component.css'],
})
export class NewDependencyDialogComponent implements OnInit {
  
  name: string;
  submitting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    private data: DataService
  ) {}

  create() {
    if (this.isValueInvalid()) return;
    const name = this.name.toUpperCase() + '.ULB';
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

  ngOnInit() {
    this.name = '';
  }

  isValueInvalid() {
    return !this.name || this.name.length === 0 || this.submitting || this.name.includes('.');
  }
}
