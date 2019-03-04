import { Component, OnInit } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewProjectDialogComponent} from '../new-project-dialog/new-project-dialog.component';
import {WebsocketService, MCQueryResponse, ProjectManagerService, ApiService, UploadResult, ProjectVerificationResult, TpStatService} from '../../../core';
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
import {TranslateService} from '@ngx-translate/core';
import {TreeNode} from '../../../file-tree/components/mc-file-tree/mc-file-tree.component';
import {UpdateDialogComponent} from '../../../../components/update-dialog/update-dialog.component';
import {NewFileDialogComponent} from '../../../file-tree/components/new-file-dialog/new-file-dialog.component';
import {SingleInputDialogComponent} from '../../../../components/single-input-dialog/single-input-dialog.component';

@Component({
  selector: 'program-toolbar',
  templateUrl: './program-toolbar.component.html',
  styleUrls: ['./program-toolbar.component.css']
})
export class ProgramToolbarComponent implements OnInit {
  
  onFocus: boolean = false;
  currMenu: number = -1;
  
  private words: any;
  private fromBackup: boolean;
  
  @ViewChild('uploadFiles') uploadFiles: ElementRef;
  @ViewChild('upload') uploadInput: ElementRef;
  
  
  toggleFocus() { this.onFocus = !this.onFocus; }
  doImport(fromBackup: boolean) {
    this.uploadInput.nativeElement.click();
    this.fromBackup = fromBackup;
  }

  constructor(
    private dialog: MatDialog,
    private ws: WebsocketService,
    public prj: ProjectManagerService,
    private snack: MatSnackBar,
    public prgService: ProgramEditorService,
    private api: ApiService,
    private utl: UtilsService,
    private trn: TranslateService,
    public stat: TpStatService
  ) {
    this.trn.get(
      ['projects.toolbar','error.err','button.cancel','button.delete',
        'success','dismiss','button.overwrite','are_you_sure',
        'files.confirm_delete','files.err_delete','files.success_delete',
        'files.confirm_upload','button.upload','files.success_upload',
        'restore.restoring','files.dir_name','projects.toolbar.new_folder',
        'button.create'
      ]
    ).subscribe(words=>{
      this.words = words;
    });
  }

  ngOnInit() { }
  
  new() {
    const ref = this.dialog.open(NewProjectDialogComponent);
    ref.afterClosed().subscribe(projectName=>{
      if (projectName) {
        this.ws.query('?prj_new_project("' + projectName + '")').then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.prj.currProject.next(null);
            this.utl.resetAllDialog(this.words['projects.toolbar']['changing']);
          }
          else
            this.snack.open(this.words['error.err'] + ' ' + ret + ':' + this.words['projects.toolbar']['err_create'],'',{duration:1500});
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
            this.utl.resetAllDialog(this.words['projects.toolbar']['changing']);
          } else
            this.snack.open(this.words['error.err'] + ' ' + ret + ':' + this.words['projects.toolbar']['err_change'],'',{duration:1500});
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
          data: this.words['projects.toolbar']['dialog_conflict'],
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
    this.trn.get('projects.toolbar.del_prj',{name: project}).subscribe(word=>{
      this.dialog.open(YesNoDialogComponent,{
        data: {
          title: word,
          msg: this.words['projects.toolbar']['del_prj_msg'],
          yes: this.words['button.delete'],
          no: this.words['button.cancel']
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
    });
  }
  
  newFile() {
    this.dialog.open(NewFileDialogComponent).afterClosed().subscribe((ret:string)=>{
      if (ret) {
        const f = new File([new Blob([''])],ret);
        this.api.upload(f, false).then((result: UploadResult)=>{
          if (result.success) {
            this.snack.open(
              this.words['success'],
              this.words['dismiss'],
              {duration:1500}
            );
            this.prj.fileRefreshNeeded.emit();
            this.prgService.setFile(ret,null,null);
          } else if (result.err === -1) {
            this.trn.get('projects.toolbar.overwrite_file.msg', {name: ret}).subscribe(word=>{
              this.dialog.open(YesNoDialogComponent,{
                data: {
                  title: this.words['projects.toolbar']['overwrite_file']['title'],
                  msg: word,
                  yes: this.words['button.overwrite'],
                  no: this.words['button.cancel']
                }
              }).afterClosed().subscribe(overwrite=>{
                if (overwrite) {
                  this.api.upload(f, true).then((result: UploadResult)=>{
                    if (result.success) {
                      this.snack.open(
                        this.words['success'],
                        this.words['dismiss'],
                        {duration:1500}
                      );
                      this.prj.fileRefreshNeeded.emit();
                      this.prgService.setFile(ret,null,null);
                    } else {
                      this.snack.open(
                        this.words['error.err'],
                        this.words['dismiss'],
                        {duration:2000}
                      );
                    }
                  });
                }
              });
            });
          } else {
            this.snack.open(
              this.words['error.err'],
              this.words['dismiss'],
              {duration:2000}
            );
          }
        });
      }
    });
  }
  
  newFolder() {
    this.dialog.open(SingleInputDialogComponent,{
      data: {
        icon: 'create_new_folder',
        title: this.words['projects.toolbar.new_folder'],
        placeholder: this.words['files.dir_name'],
        accept: this.words['button.create']
      }
    }).afterClosed().subscribe((name:string)=>{
      if (name) {
        this.api.createFolder(name).then(result=>{
          if (result) {
            this.snack.open(
              this.words['success'],
              this.words['dismiss'],
              {duration:1500}
            );
            this.prj.fileRefreshNeeded.emit();
          } else {
            this.snack.open(
              this.words['error.err'],
              this.words['dismiss'],
              {duration:2000}
            );
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
        this.snack.open(this.words['success'],'',{duration:1500});
        if (projectName === this.prj.currProject.value.name)
          return this.prj.getCurrentProject();
      } else {
        this.snack.open(this.words['projects.toolbar']['err_import'],this.words['dismiss']);
      }
    });
  }
  
  onUploadProjectFile(e:any) {
    for(let f of e.target.files) {
      if (this.fromBackup) { // USER UPLOADS A BACKUP ZIP
        let count = 0;
        let targetCount = e.target.files.length;
        for(let f of e.target.files) {
          this.api.uploadIPK(f).then((ret: UploadResult)=>{ // ON SUCCUESS
            count++;
            if (count === targetCount) {
              // REBOOT MC
              this.dialog.open(UpdateDialogComponent,{
                disableClose: true,
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                closeOnNavigation: false,
                data: this.words['restore.restoring'],
                id: 'update'
              });
              this.ws.updateFirmwareMode = true;
              this.ws.query('?user sys_reboot(0,0,0)');
              setTimeout(()=>{
                let ok = false;
                let interval = setInterval(()=>{
                  if (ok)
                    return;
                  this.api.getFile("isWebServerAlive.HTML").then(ret=>{
                    ok = true;
                    location.href = '/?from=restore';
                  }).catch(err=>{
                  });
                },2000);
              },10000);
            }
          },(ret:HttpErrorResponse)=>{ // ON ERROR
            const words = [
             'files.err_upload','files.err_ext','files.err_permission'
            ];
            this.trn.get(words, {name: f.name}).subscribe(words=>{
              switch (ret.error.err) {
                case -2:
                  this.snack.open(words['files.err_upload'],this.words['dismiss']);
                  break;
                case -3:
                  this.snack.open(words['files.err_ext'],this.words['dismiss']);
                  break;
                case -4:
                  this.snack.open(words['files.err_permission'],this.words['dismiss']);
                  break;
              }
            });
          });
        }
        return;
      }
      // USER UPLOADS A PROJECT ZIP
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
              this.trn.get('projects.toolbar.overwrite_prj.msg', {name: projectName}).subscribe(word=>{
                this.dialog.open(YesNoDialogComponent,{
                  data: {
                    title: this.words['projects.toolbar']['overwrite_prj']['title'],
                    msg: word,
                    yes: this.words['button.overwrite'],
                    no: this.words['button.cancel']
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
                        this.snack.open(this.words['projects.toolbar']['err_import'],this.words['dismiss']);
                      }
                    });
                  } else {  // USER CANCELED, TELL SERVER TO DELETE THE FILE
                    this.api.deleteProjectZip(verification.file);
                  }
                });
              });
            }
          });
        } else {
          // ZIP FILE IS INVALID
          this.snack.open(this.words['projects.toolbar']['err_import_file'],this.words['dismiss']);
        }
      },(ret:HttpErrorResponse)=>{ // ON ERROR
        const words = [
          'files.err_upload','files.err_ext','files.err_permission'
        ];
        this.trn.get(words, {name: f.name}).subscribe(words=>{
          switch (ret.error.err) {
            case -2:
              this.snack.open(words['files.err_upload'],this.words['dismiss']);
              break;
            case -3:
              this.snack.open(words['files.err_ext'],this.words['dismiss']);
              break;
            case -4:
              this.snack.open(words['files.err_permission'],this.words['dismiss']);
              break;
          }
        });
      });
    }
    e.target.value = null;
  }
  
  showUploadDialog() {
    this.uploadFiles.nativeElement.click();
  }
  
  onUploadFilesChange(e:any) {
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: this.words['are_you_sure'],
        msg: this.words['files.confirm_upload'],
        yes: this.words['button.upload'],
        no: this.words['button.cancel']
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (!ret)
        return;
      let count = 0;
      let targetCount = e.target.files.length;
      for(let f of e.target.files) {
        this.api.upload(f, true).then((ret: UploadResult)=>{ // ON SUCCUESS
          count++;
          if (count === targetCount) {
            this.snack.open(this.words['files.success_upload'],'',{duration:2000});
            this.prj.fileRefreshNeeded.emit();
          }
        },(ret:HttpErrorResponse)=>{ // ON ERROR
          const words = [
           'files.err_upload','files.err_ext','files.err_permission'
          ];
          this.trn.get(words, {name: f.name}).subscribe(words=>{
            switch (ret.error.err) {
              case -2:
                this.snack.open(words['files.err_upload'],this.words['dismiss']);
                break;
              case -3:
                this.snack.open(words['files.err_ext'],this.words['dismiss']);
                break;
              case -4:
                this.snack.open(words['files.err_permission'],this.words['dismiss']);
                break;
            }
          });
        });
      }
    });
  }
  
  undo() {this.prgService.onUndo.emit(); }
  redo() { this.prgService.onRedo.emit(); }
  find() { this.prgService.onFind.emit(); }
  replace() { this.prgService.onReplace.emit(); }
  
  toggleRemote() {
    switch(this.stat.mode) {
      case 'R':
        this.stat.mode = 'A';
        break;
      default:
        this.stat.mode = 'R';
        break;
    }
  }
  
  /*
   * DELETES A FOLDER STARTING WITH ITS SUBFOLDERS FIRST
   * 
   * @param node 
   * a TreeNode of a FOLDER with NO FILES AS DESCENDANTS
   */
  private deleteRecursivly(node: TreeNode) : Promise<boolean> {
    if (node.children.length === 0)
      return <Promise<boolean>>this.api.deleteFolder(node.path);
    let promises: Promise<boolean>[] = [];
    for (let n of node.children) {
      if (n.isFolder && this.prj.checklistSelection.isSelected(n))
        promises.push(this.deleteRecursivly(n));
    }
    return Promise.all(promises).then((result:boolean[])=>{
      return result.every((result:boolean)=>{return result;});
    }).then(result=>{
      if (result) {
        return <Promise<boolean>>this.api.deleteFolder(node.path);
      }
    });
  }
  
  /*
   * DELETES THE SELECTED FILES AND FOLDERS.
   * 
   * FOLDERS CANNOT BE DELETED IF THERE ARE FILES INSIDE, SO FIRST WE DELETE
   * THE FILES AND THEN THE FOLDERS FROM THE LEAVES AND UP TO THE ROOT FOLDER.
   */
  deleteFiles() {
    const selected = this.prj.checklistSelection.selected;
    if (selected.length === 0)
      return;
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: this.words['are_you_sure'],
        msg: this.words['files.confirm_delete'],
        yes: this.words['button.delete'],
        no: this.words['button.cancel']
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        let promises : Promise<any>[] = [];
        for (let n of selected) {
          if (!n.isFolder) {
            if (n.name === this.prgService.activeFile) {
              this.prgService.close();
            }
            promises.push(this.api.deleteFile(n.path));
          }
        }
        Promise.all(promises).then((ret:boolean[])=>{
          // check if all results are true
          return ret.every((result:boolean)=>{return result;});
        }).then(result=>{
          if (result) {
            // ALL FILES DELETES SUCCESSFULY - CONTINUE TO DELETE FOLDERS..
            promises = [];
            for (let n of selected) {
              if (!n.isFolder)
                continue;
              if (n.parent === null || !this.prj.checklistSelection.isSelected(n.parent))
                promises.push(this.deleteRecursivly(n));
            }
            return Promise.all(promises);
          }
          else
            this.snack.open(this.words['files.err_delete'],'',{duration:2000});
        }).then((ret:boolean[])=>{
          if (ret) {
            const finalResult = ret.every((result:boolean)=>{
              return result;
            });
            const msg = finalResult ? 
                      this.words['files.success_delete'] :
                      this.words['files.err_delete'];
            this.snack.open(msg,'',{duration:2000});
          }
        }).then(()=>{
          this.prj.fileRefreshNeeded.emit();
        });
      }
    });
  }
  
  downloadFiles(fromSelected: boolean) {
    let files : string[];
    if (fromSelected) {
      const selected = this.prj.checklistSelection.selected;
      if (selected.length === 0)
        return;
      files = [];
      for (let node of selected) {
        files.push(node.path);
      }
    } else {
      files = null;
    }
    return this.api.downloadZip(files);
  }

}
