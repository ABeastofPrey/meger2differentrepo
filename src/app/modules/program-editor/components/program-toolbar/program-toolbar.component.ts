import { Component, OnInit } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewProjectDialogComponent} from '../new-project-dialog/new-project-dialog.component';
import {WebsocketService, MCQueryResponse, ProjectManagerService, ApiService, UploadResult, ProjectVerificationResult} from '../../../core';
import {OpenProjectDialogComponent} from '../open-project-dialog/open-project-dialog.component';
import {ProgramEditorService} from '../../services/program-editor.service';
import {NewAppDialogComponent} from '../toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import {SaveAsDialogComponent} from '../toolbar-dialogs/save-as-dialog/save-as-dialog.component';
import {RenameDialogComponent} from '../toolbar-dialogs/rename-dialog/rename-dialog.component';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {NewLibDialogComponent} from '../toolbar-dialogs/new-lib-dialog/new-lib-dialog.component';
import {ViewChild} from '@angular/core';
import {ElementRef} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilsService} from '../../../core/services/utils.service';

@Component({
  selector: 'program-toolbar',
  templateUrl: './program-toolbar.component.html',
  styleUrls: ['./program-toolbar.component.css']
})
export class ProgramToolbarComponent implements OnInit {
  
  onFocus: boolean = false;
  currMenu: number = -1;
  
  @ViewChild('upload') uploadInput: ElementRef;
  
  toggleFocus() { this.onFocus = !this.onFocus; }
  doImport() { this.uploadInput.nativeElement.click(); }

  constructor(
    private dialog: MatDialog,
    private ws: WebsocketService,
    public prj: ProjectManagerService,
    private snack: MatSnackBar,
    public prgService: ProgramEditorService,
    private api: ApiService,
    private utl: UtilsService
  ) { }

  ngOnInit() { }
  
  new() {
    const ref = this.dialog.open(NewProjectDialogComponent);
    ref.afterClosed().subscribe(projectName=>{
      if (projectName) {
        this.ws.query('?prj_new_project("' + projectName + '")').then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.prj.currProject.next(null);
            this.utl.resetAllDialog('Changing project...');
          }
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
          if (ret.result === '0') {
            this.prj.currProject.next(null);
            this.utl.resetAllDialog('Changing project...');
          } else
            this.snack.open('Error ' + ret.result + ": Can't change current project.",'',{duration:1500});
        });
      }
    });
  }
  
  run() {
    const cmd = '?tp_run_project("' + this.prj.currProject.value.name + '",';
    this.ws.query(cmd + '0)')
    .then((ret: MCQueryResponse)=>{
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
  
  export() {
    this.prj.isLoading = true;
    this.api.downloadProjectZip(this.prj.currProject.value.name);
    this.prj.isLoading = false;
  }
  newApp() { this.dialog.open(NewAppDialogComponent); }
  newLib() { this.dialog.open(NewLibDialogComponent); }
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
  
  private importProject(fileName: string, projectName: string) {
    return this.api.importProject(fileName).then((ret: UploadResult)=>{
      if (ret.success) {
        this.prgService.close();
        this.prgService.mode = 'editor';
        this.snack.open('SUCCESS!','',{duration:1500});
        if (projectName === this.prj.currProject.value.name)
          return this.prj.getCurrentProject();
      } else {
        this.snack.open('IMPORT FAILED!','DISMISS');
      }
    });
  }
  
  onUploadFilesChange(e:any) {
    for(let f of e.target.files) {
      this.api.verifyProject(f).then((verification: ProjectVerificationResult)=>{
        if (verification.success) {
          // ZIP FILE IS UPLOADED AND VERIFIED
          const projectName = verification.project;            
          // TRY TO IMPORT WITHOUT OVERWRITING
          let cmd = '?prj_import_project("' + projectName + '",0)';
          this.ws.query(cmd).then((ret: MCQueryResponse)=>{
            if (ret.result === '0') {
              // PROJECT IMPORT IS OK - TELL WEB SERVER TO UNZIP THE FILE
              this.importProject(verification.file, projectName);
            } else { // PROJECT EXISTS, ASK USER IF HE WANTS TO OVERWRITE
              this.dialog.open(YesNoDialogComponent,{
                data: {
                  title: 'Overwrite existing project?',
                  msg: 'Project ' + projectName + ' already exists. Do you want to overwrite it with the imported project?',
                  yes: 'OVERWRITE',
                  no: 'CANCEL'
                }
              }).afterClosed().subscribe(overwrite=>{
                if (overwrite) {
                  // TRY TO IMPORT WITH OVERWRITING
                  cmd = '?prj_import_project("' + projectName + '",1)';
                  this.ws.query(cmd).then((ret: MCQueryResponse)=>{
                    if (ret.result === '0') {
                      // PROJECT IMPORT IS OK - TELL WEB SERVER TO UNZIP THE FILE
                      this.importProject(verification.file, projectName);
                    } else { // SOMETHING WENT WRONG, TELL SERVER TO DELETE THE FILE
                      this.api.deleteProjectZip(verification.file);
                      this.snack.open('IMPORT FAILED!','DISMISS');
                    }
                  });
                } else {  // USER CANCELED, TELL SERVER TO DELETE THE FILE
                  this.api.deleteProjectZip(verification.file);
                }
              });
            }
          });
        } else {
          // ZIP FILE IS INVALID
          this.snack.open('Invalid project file!','DISMISS');
        }
      },(ret:HttpErrorResponse)=>{ // ON ERROR
        switch (ret.error.err) {
          case -2:
            this.snack.open('ERROR UPLOADING ' + f.name,'DISMISS');
            break;
          case -3:
            this.snack.open('INVALID EXTENSION IN ' + f.name,'DISMISS');
            break;
          case -3:
            this.snack.open('PERMISSION DENIED','DISMISS');
            break;
        }
      });
    }
    e.target.value = null;
  }
  
  undo() {this.prgService.onUndo.emit(); }
  redo() { this.prgService.onRedo.emit(); }
  find() { this.prgService.onFind.emit(); }
  replace() { this.prgService.onReplace.emit(); }

}
