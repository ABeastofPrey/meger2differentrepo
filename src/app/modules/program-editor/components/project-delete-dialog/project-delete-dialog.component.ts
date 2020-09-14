import { SysLogSnackBarService } from './../../../sys-log/services/sys-log-snack-bar.service';
import { ProjectManagerService } from './../../../core/services/project-manager.service';
import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import {
  MatDialogRef,
  MatChipInputEvent,
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MAT_DIALOG_DATA,
} from '@angular/material';
import { WebsocketService, MCQueryResponse } from '../../../core';
import { FormControl, Validators } from '@angular/forms';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-project-delete-dialog',
  templateUrl: './project-delete-dialog.component.html',
  styleUrls: ['./project-delete-dialog.component.css'],
})
export class ProjectDeleteDialogComponent implements OnInit {
  projects: string[] = [];
  selected: string[] = [];
  prjCtrl = new FormControl();
  openProjectCtrl = new FormControl(null,[Validators.required]);
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  current = false;

  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('prjInput', { static: false }) prjInput: ElementRef<
    HTMLInputElement
  >;

  constructor(
    public dialogRef: MatDialogRef<ProjectDeleteDialogComponent>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    private snack: SysLogSnackBarService,
    @Inject(MAT_DIALOG_DATA) private data: { current?: boolean }
  ) {}

  ngOnInit() {
    if (this.data) {
      this.current = this.data.current;
    }
    this.ws.query('?prj_get_list_of_projects').then((ret: MCQueryResponse) => {
      if (ret.result.length > 0) {
        this.projects = ret.result.split(',').filter(p=>{
          return p !== this.prj.currProject.value.name;
        });
      }
    });
  }

  remove(prj: string): void {
    const index = this.selected.indexOf(prj);
    if (index >= 0) {
      this.selected.splice(index, 1);
    }
  }

  onSelected(event: MatAutocompleteSelectedEvent): void {
    const val = event.option.viewValue;
    if (this.selected.includes(val)) {
      this.snack.openTipSnackBar('projects.delete-dialog.err_exists');
      return;
    }
    this.selected.push(event.option.viewValue);
    this.prjInput.nativeElement.value = '';
    this.prjCtrl.setValue(null);
  }

  delete() {
    this.dialogRef.close(this.data && this.data.current ? [this.openProjectCtrl.value] : this.selected);
  }
}
