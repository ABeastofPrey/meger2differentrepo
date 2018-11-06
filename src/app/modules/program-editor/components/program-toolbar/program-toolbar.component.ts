import { Component, OnInit } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewProjectDialogComponent} from '../new-project-dialog/new-project-dialog.component';
import {WebsocketService, MCQueryResponse, ProjectManagerService, ApiService} from '../../../core';
import {OpenProjectDialogComponent} from '../open-project-dialog/open-project-dialog.component';
import {ProgramEditorService} from '../../services/program-editor.service';
import {NewAppDialogComponent} from '../toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import {SaveAsDialogComponent} from '../toolbar-dialogs/save-as-dialog/save-as-dialog.component';
import {RenameDialogComponent} from '../toolbar-dialogs/rename-dialog/rename-dialog.component';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {NewLibDialogComponent} from '../toolbar-dialogs/new-lib-dialog/new-lib-dialog.component';

@Component({
  selector: 'program-toolbar',
  templateUrl: './program-toolbar.component.html',
  styleUrls: ['./program-toolbar.component.css']
})
export class ProgramToolbarComponent implements OnInit {
  
  onFocus: boolean = false;
  currMenu: number = -1;
  
  toggleFocus() { this.onFocus = !this.onFocus; }

  constructor(
    private dialog: MatDialog,
    private ws: WebsocketService,
    public prj: ProjectManagerService,
    private snack: MatSnackBar,
    public prgService: ProgramEditorService,
    private api: ApiService
  ) { }

  ngOnInit() { }
  
  new() {
    const ref = this.dialog.open(NewProjectDialogComponent);
    ref.afterClosed().subscribe(projectName=>{
      if (projectName) {
        this.ws.query('?prj_new_project("' + projectName + '")').then((ret:MCQueryResponse)=>{
          if (ret.result === '0')
            this.prj.getCurrentProject();
          else
            this.snack.open('Error ' + ret + ": Can't create Project.",'',{duration:1500});
        });
      }
    });
  }
  
  open() {
    const ref = this.dialog.open(OpenProjectDialogComponent);
    ref.afterClosed().subscribe(projectName=>{
      if (projectName) {
        this.ws.query('?prj_set_current_project("' + projectName + '")').then((ret:MCQueryResponse)=>{
          if (ret.result === '0')
            this.prj.getCurrentProject();
          else
            this.snack.open('Error ' + ret + ": Can't change current project.",'',{duration:1500});
        });
      }
    });
  }
  
  run() {
    const cmd = '?tp_run_project("' + this.prj.currProject.value.name + '",';
    this.ws.query(cmd + '0)')
    .then((ret: MCQueryResponse)=>{
      console.log(ret);
      if (ret.result !== '0') {
        this.dialog.open(YesNoDialogComponent,{
          data: {
            title: 'Settings Conflict Detected',
            msg: 'Your project settings are different than the currently active settings. Which settings would you like to use?',
            yes: 'CURRENT SETTINGS',
            no: 'PROJECT SETTINGS'
          },
          width: '400px'
        }).afterClosed().subscribe(result=>{
          const option = result ? '1)' : '2)';
          this.ws.query(cmd+option);
        });
      }
    });
  }
  
  stop() {
    this.ws.query('?prj_stop("' + this.prj.currProject.value.name + '")');
  }
  
  newApp() { this.dialog.open(NewAppDialogComponent); }
  newLib() { this.dialog.open(NewLibDialogComponent); }
  export() { this.api.downloadProjectZip(this.prj.currProject.value.name); }
  saveAs() { this.dialog.open(SaveAsDialogComponent); }
  rename() { this.dialog.open(RenameDialogComponent); }
  delete() {
    const project = this.prj.currProject.value.name;
    this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Delete Project ' + project + '?',
        msg: 'All the project files will be removed permanently.',
        yes: 'DELETE',
        no: 'CANCEL'
      }
    }).afterClosed().subscribe(ret=>{
      if (ret) {
        this.ws.query('?prj_delete_project("' + project + '")').then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.prgService.close();
            this.prgService.mode = 'editor';
            this.prj.getCurrentProject();
          }
        });
      }
    });
  }

}
