import { SysLogSnackBarService } from './../../../sys-log/services/sys-log-snack-bar.service';
import { ProjectManagerService } from './../../../core/services/project-manager.service';
import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { WebsocketService, MCQueryResponse } from '../../../core';
import { FormControl, Validators } from '@angular/forms';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Platform } from '@angular/cdk/platform';
import { CustomKeyBoardDialogComponent } from '../../../../components/custom-key-board/custom-key-board-dialog/custom-key-board-dialog.component';
import { fromEvent } from 'rxjs';

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

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('prjInput') prjInput: ElementRef<
    HTMLInputElement
  >;

  constructor(
    public dialogRef: MatDialogRef<ProjectDeleteDialogComponent>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    private platform: Platform,
    private dialog: MatDialog,
    private snack: SysLogSnackBarService,
    @Inject(MAT_DIALOG_DATA) private data: { current?: boolean }
  ) {}

  ngOnInit() {
    if(this.isTablet) {
        fromEvent(document, 'mousedown').subscribe(this.preventLoseFocus.bind(this));
    }
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

  get isTablet(): boolean {
    return this.platform.ANDROID || this.platform.IOS;
  }

  remove(prj: string): void {
    const index = this.selected.indexOf(prj);
    if (index >= 0) {
      this.selected.splice(index, 1);
    }
  }

  // onSelected(event: MatAutocompleteSelectedEvent): void {
  //   const val = event.option.viewValue;
  //   if (this.selected.includes(val)) {
  //     this.snack.openTipSnackBar('projects.delete-dialog.err_exists');
  //     return;
  //   }
  //   this.selected.push(event.option.viewValue);
  //   this.prjInput.nativeElement.value = '';
  //   this.prjCtrl.setValue(null);
  // }

  onSelected(val: string): void {
    if (this.selected.includes(val)) {
      this.snack.openTipSnackBar('projects.delete-dialog.err_exists');
      return;
    }
    this.selected.push(val);
    this.prjInput.nativeElement.value = '';
    this.prjCtrl.setValue(null);
  }

  delete() {
    this.dialogRef.close(this.data && this.data.current ? [this.openProjectCtrl.value] : this.selected);
  }

  private preventLoseFocus(e: any): void {
    (e.target.getAttribute('class') && e.target.getAttribute('class').indexOf("projectDeleteDialog") > -1) ? "" : e.preventDefault();
  }

  onInputFocus() {
    setTimeout(() => {
        if (this.isTablet) {
            const option = { data: { type: 'string', value: this.prjCtrl.value }, width: '839px',
            height: '439.75px'};
            this.dialog.open(CustomKeyBoardDialogComponent, option).afterClosed().subscribe((res:{delete?: boolean,enter?: boolean,value?: any}) => {
                if(res === undefined || res.delete) return;
                this.prjCtrl.setValue(res.value);
                this.prjCtrl.markAsTouched();
                this.prjInput.nativeElement.value = res.value;

            });
        }
    }, 0);
  }
}
