import { ProjectManagerService } from './../../../core/services/project-manager.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  MatDialogRef,
  MatChipInputEvent,
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material';
import { WebsocketService, MCQueryResponse } from '../../../core';
import { FormControl } from '@angular/forms';
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
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];

  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('prjInput', { static: false }) prjInput: ElementRef<
    HTMLInputElement
  >;

  constructor(
    public dialogRef: MatDialogRef<ProjectDeleteDialogComponent>,
    private ws: WebsocketService,
    private prj: ProjectManagerService
  ) {}

  ngOnInit() {
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
    this.selected.push(event.option.viewValue);
    this.prjInput.nativeElement.value = '';
    this.prjCtrl.setValue(null);
  }

  delete() {
    this.dialogRef.close(this.selected);
  }
}
