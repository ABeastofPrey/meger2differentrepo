import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatSliderChange } from '@angular/material';
import { NewProjectDialogComponent } from '../new-project-dialog/new-project-dialog.component';
import {
  WebsocketService,
  MCQueryResponse,
  ProjectManagerService,
  ApiService,
  UploadResult,
  ProjectVerificationResult,
  TpStatService,
  LoginService,
} from '../../../core';
import { OpenProjectDialogComponent } from '../open-project-dialog/open-project-dialog.component';
import { ProgramEditorService } from '../../services/program-editor.service';
import { NewAppDialogComponent } from '../toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import { SaveAsDialogComponent } from '../toolbar-dialogs/save-as-dialog/save-as-dialog.component';
import { RenameDialogComponent } from '../toolbar-dialogs/rename-dialog/rename-dialog.component';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { NewLibDialogComponent } from '../toolbar-dialogs/new-lib-dialog/new-lib-dialog.component';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilsService } from '../../../core/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TreeNode } from '../../../file-tree/components/mc-file-tree/mc-file-tree.component';
import { UpdateDialogComponent } from '../../../../components/update-dialog/update-dialog.component';
import { NewFileDialogComponent } from '../../../file-tree/components/new-file-dialog/new-file-dialog.component';
import { SingleInputDialogComponent } from '../../../../components/single-input-dialog/single-input-dialog.component';
import { CommonService } from '../../../core/services/common.service';
import { ProjectDeleteDialogComponent } from '../project-delete-dialog/project-delete-dialog.component';
import {NewDependencyDialogComponent} from '../toolbar-dialogs/new-dependency-dialog/new-dependency-dialog.component';

@Component({
  selector: 'program-toolbar',
  templateUrl: './program-toolbar.component.html',
  styleUrls: ['./program-toolbar.component.scss'],
})
export class ProgramToolbarComponent implements OnInit {
  onFocus = false;
  currMenu = -1;

  private words: {};
  private fromBackup: boolean;

  @ViewChild('uploadFiles', { static: false }) uploadFiles: ElementRef;
  @ViewChild('upload', { static: false }) uploadInput: ElementRef;

  toggleFocus(e: MouseEvent) {
    if (this.cmn.isTablet) {
      this.onFocus = (e.target as HTMLElement).tagName === 'LI';
    } else {
      this.onFocus = !this.onFocus;
    }
    if (!this.onFocus) {
      this.currMenu = 0;
    }
  }
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
    public stat: TpStatService,
    public login: LoginService,
    public cmn: CommonService,
    private utils: UtilsService
  ) {
    this.trn
      .get([
        'projects.toolbar',
        'error.err',
        'button.cancel',
        'button.delete',
        'success',
        'dismiss',
        'button.overwrite',
        'are_you_sure',
        'files.confirm_delete',
        'files.err_delete',
        'files.success_delete',
        'files.confirm_upload',
        'button.upload',
        'files.success_upload',
        'restore.restoring',
        'files.dir_name',
        'projects.toolbar.new_folder',
        'button.create',
      ])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {}

  new() {
    const ref = this.dialog.open(NewProjectDialogComponent);
    ref.afterClosed().subscribe(projectName => {
      if (projectName) {
        this.prgService.close();
        this.prj.stopStatusRefresh();
        this.ws
          .query('?prj_new_project("' + projectName + '")')
          .then((ret: MCQueryResponse) => {
            if (ret.result === '0') {
              this.prj.currProject.next(null);
              this.utl.resetAllDialog(
                this.words['projects.toolbar']['changing']
              );
            }
          });
      }
    });
  }

  open() {
    const ref = this.dialog.open(OpenProjectDialogComponent);
    ref.afterClosed().subscribe(projectName => {
      if (projectName) {
        this.prgService.close();
        this.ws
          .query('?prj_set_current_project("' + projectName + '")')
          .then((ret: MCQueryResponse) => {
            if (ret.result === '0') {
              this.prgService.close();
              this.ws.updateFirmwareMode = true;
              this.prj.currProject.next(null);
              this.utl.resetAllDialog(
                this.words['projects.toolbar']['changing']
              );
            } else {
              if(!this.utils.IsKuka) 
              {
                this.snack.open(
                  this.words['error.err'] +
                    ' ' +
                    ret.result +
                    ':' +
                    this.words['projects.toolbar']['err_change'],
                  '',
                  { duration: 1500 }
                );
              }
            }
          });
      }
    });
  }

  run() {
    const cmd = '?tp_run_project("' + this.prj.currProject.value.name + '",';
    this.ws.query(cmd + '0)').then((ret: MCQueryResponse) => {
      if (ret.result === '-1') {
        this.dialog
          .open(YesNoDialogComponent, {
            data: this.words['projects.toolbar']['dialog_conflict'],
          })
          .afterClosed()
          .subscribe(result => {
            const option = result ? '1)' : '2)';
            this.ws.query(cmd + option);
          });
      }
    });
  }

  stop() {
    this.ws.query('?prj_stop("' + this.prj.currProject.value.name + '")');
  }

  runAllBGTasks(): void {
    this.ws.query('call BKG_startBGTasks');
  }

  stopAllBGTasks(): void {
    this.ws.query('call BKG_stopBGTasks');
  }

  export() {
    this.prj.isLoading = true;
    return this.api
      .downloadProjectZip(this.prj.currProject.value.name)
      .then(() => {
        this.prj.isLoading = false;
      });
  }
  newApp() {
    this.dialog.open(NewAppDialogComponent, {
      data: {
        title: 'projects.toolbar.new_app',
        placeholder: 'projects.toolbar.app_name'
      }
    });
  }
  newLib() {
    this.dialog.open(NewLibDialogComponent);
  }
  newDep() {
    this.dialog.open(NewDependencyDialogComponent);
  }
  saveAs() {
    this.dialog.open(SaveAsDialogComponent);
  }
  rename() {
    this.dialog.open(RenameDialogComponent);
  }
  async delete() {
    this.prj.stopStatusRefresh();
    await new Promise(resolve=>{setTimeout(resolve,300)});
    const project = this.prj.currProject.value;
    this.trn
      .get('projects.toolbar.del_prj_title', { name: project.name })
      .subscribe(word => {
        this.dialog
          .open(YesNoDialogComponent, {
            data: {
              title: word,
              msg: this.words['projects.toolbar']['del_prj_msg'],
              yes: this.words['button.delete'],
              no: this.words['button.cancel'],
            },
          })
          .afterClosed()
          .subscribe(ret => {
            if (ret) {
              this.prgService.close();
              this.ws
                .query('?prj_delete_project("' + project.name + '")')
                .then((ret: MCQueryResponse) => {
                  if (ret.result === '0') {
                    this.prgService.mode = 'editor';
                    this.prj.getCurrentProject();
                  }
                });
            }
          });
      });
  }
  async deleteOthers() {
    this.prj.stopStatusRefresh();
    await new Promise(resolve=>{setTimeout(resolve,300)});
    this.dialog
      .open(ProjectDeleteDialogComponent)
      .afterClosed()
      .subscribe((ret: string[]) => {
        if (ret && ret.length > 0) {
          this.prgService.close();
          const promises = [];
          let isCurrent = false;
          this.prj.isLoading = true;
          for (const prj of ret) {
            promises.push(this.ws.query('?prj_delete_project("' + prj + '")'));
            if (this.prj.currProject.value.name === prj) isCurrent = true;
          }
          Promise.all(promises)
            .then((ret: MCQueryResponse[]) => {
              if (isCurrent) {
                this.prgService.mode = 'editor';
                this.prj.getCurrentProject();
              } else {
                this.prj.isLoading = false;
              }
            })
            .then(() => {
                this.snack.open(this.words['success'], this.words['dismiss'], {
                  duration: 1500,
                });             
            });
        }
      });
  }
  newFile() {
    this.dialog
      .open(NewFileDialogComponent)
      .afterClosed()
      .subscribe((ret: string) => {
        if (ret) {
          const f = new File([new Blob([''])], ret);
          this.api.upload(f, false).then((result: UploadResult) => {
            if (result.success) {
                this.snack.open(this.words['success'], this.words['dismiss'], {
                  duration: 1500,
                });           
              this.prj.fileRefreshNeeded.emit();
              this.prgService.setFile(ret, null, null, -1);
            } else if (result.err === -1) {
              this.trn
                .get('projects.toolbar.overwrite_file.msg', { name: ret })
                .subscribe(word => {
                  this.dialog
                    .open(YesNoDialogComponent, {
                      data: {
                        title: this.words['projects.toolbar']['overwrite_file'][
                          'title'
                        ],
                        msg: word,
                        yes: this.words['button.overwrite'],
                        no: this.words['button.cancel'],
                      },
                    })
                    .afterClosed()
                    .subscribe(overwrite => {
                      if (overwrite) {
                        this.api
                          .upload(f, true)
                          .then((result: UploadResult) => {
                            if (result.success) {
                                this.snack.open(
                                  this.words['success'],
                                  this.words['dismiss'],
                                  { duration: 1500 }
                                );                             
                              this.prj.fileRefreshNeeded.emit();
                              this.prgService.setFile(ret, null, null, -1);
                            } else {
                                this.snack.open(
                                  this.words['error.err'],
                                  this.words['dismiss'],
                                  { duration: 2000 }
                                );                              
                            }
                          });
                      }
                    });
                });
            } else {
                this.snack.open(this.words['error.err'], this.words['dismiss'], {
                  duration: 2000,
                });              
            }
          });
        }
      });
  }

  newFolder() {
    this.dialog
      .open(SingleInputDialogComponent, {
        data: {
          icon: 'create_new_folder',
          title: this.words['projects.toolbar.new_folder'],
          placeholder: this.words['files.dir_name'],
          accept: this.words['button.create'],
          regex: '[a-zA-Z]+(\\w*)$',
          maxLength: 32
        },
      })
      .afterClosed()
      .subscribe((name: string) => {
        if (name) {
          this.api.createFolder(name).then(result => {
            if (result) {
                this.snack.open(this.words['success'], this.words['dismiss'], {
                  duration: 1500,
                });             
              this.prj.fileRefreshNeeded.emit();
            } else {
                this.snack.open(this.words['error.err'], this.words['dismiss'], {
                  duration: 2000,
                });             
            }
          });
        }
      });
  }

  private importProject(fileName: string, projectName: string) {
    return this.api.importProject(fileName).then((ret: UploadResult) => {
      if (ret.success) {
        this.prgService.close();
        this.prgService.mode = 'editor';
        if(!this.utils.IsKuka)
        {
          this.snack.open(this.words['success'], '', { duration: 1500 });
        }
        if (projectName === this.prj.currProject.value.name) {
          return this.prj.getCurrentProject();
        }
      } else {
          this.snack.open(
            this.words['projects.toolbar']['err_import'],
            this.words['dismiss']
          );        
      }
    });
  }

  onUploadProjectFile(e: {target: {files: File[], value: File }}) {
    this.prj.isLoading = true;
    for (const f of e.target.files) {
      if (this.fromBackup) {
        // USER UPLOADS A BACKUP ZIP
        let count = 0;
        const targetCount = e.target.files.length;
        for (const f of e.target.files) {
          this.api.uploadIPK(f).then(
            (ret: UploadResult) => {
              // ON SUCCUESS
              count++;
              if (count === targetCount) {
                // REBOOT MC
                this.dialog.open(UpdateDialogComponent, {
                  disableClose: true,
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  closeOnNavigation: false,
                  data: this.words['restore.restoring'],
                  id: 'update',
                });
                this.ws.updateFirmwareMode = true;
                this.ws.query('?user sys_reboot(0,0,0)');
                setTimeout(() => {
                  let ok = false;
                  const interval = setInterval(() => {
                    if (ok) return;
                    this.api
                      .getFile('isWebServerAlive.HTML')
                      .then(ret => {
                        ok = true;
                        location.href = '/rs/?from=restore';
                      })
                      .catch(err => {});
                  }, 2000);
                }, 10000);
              }
            },
            (ret: HttpErrorResponse) => {
              // ON ERROR
              const words = [
                'files.err_upload',
                'files.err_ext',
                'files.err_permission',
              ];
              this.prj.isLoading = false;
              this.trn.get(words, { name: f.name }).subscribe(words => {
                switch (ret.error.err) {
                  default:
                    break;
                  case -2:
                      this.snack.open(
                        words['files.err_upload'],
                        this.words['dismiss']
                      );                   
                    break;
                  case -3:
                      this.snack.open(
                        words['files.err_ext'],
                        this.words['dismiss']
                      );                   
                    break;
                  case -4:
                      this.snack.open(
                        words['files.err_permission'],
                        this.words['dismiss']
                      );
                    break;
                }
              });
            }
          );
        }
        return;
      }
      // USER UPLOADS A PROJECT ZIP
      this.api.verifyProject(f).then(
        (verification: ProjectVerificationResult) => {
          if (verification.success) {
            // ZIP FILE IS UPLOADED AND VERIFIED
            const projectName = verification.project;
            // TRY TO IMPORT WITHOUT OVERWRITING
            let cmd = '?prj_import_project("' + projectName + '",0)';
            this.ws.query(cmd).then((ret: MCQueryResponse) => {
              if (ret.result === '0') {
                // PROJECT IMPORT IS OK - TELL WEB SERVER TO UNZIP THE FILE
                this.importProject(verification.file, projectName).then(() => {
                  //this.api.deleteProjectZip(verification.file);
                  this.prj.isLoading = false;
                });
              } else {
                // PROJECT EXISTS, ASK USER IF HE WANTS TO OVERWRITE
                this.trn
                  .get('projects.toolbar.overwrite_prj.msg', {
                    name: projectName,
                  })
                  .subscribe(word => {
                    this.dialog
                      .open(YesNoDialogComponent, {
                        data: {
                          title: this.words['projects.toolbar'][
                            'overwrite_prj'
                          ]['title'],
                          msg: word,
                          yes: this.words['button.overwrite'],
                          no: this.words['button.cancel'],
                        },
                      })
                      .afterClosed()
                      .subscribe(overwrite => {
                        if (overwrite) {
                          // TRY TO IMPORT WITH OVERWRITING
                          cmd = '?prj_import_project("' + projectName + '",1)';
                          this.ws.query(cmd).then((ret: MCQueryResponse) => {
                            if (ret.result === '0') {
                              // PROJECT IMPORT IS OK - TELL WEB SERVER TO UNZIP THE FILE
                              this.importProject(
                                verification.file,
                                projectName
                              );
                            } else {
                              // SOMETHING WENT WRONG, TELL SERVER TO DELETE THE FILE
                              this.api.deleteProjectZip(verification.file);
                              this.snack.open(
                                  this.words['projects.toolbar']['err_import'],
                                  this.words['dismiss']
                                );                             
                            }
                            this.prj.isLoading = false;
                          });
                        } else {
                          // USER CANCELED, TELL SERVER TO DELETE THE FILE
                          this.api.deleteProjectZip(verification.file);
                          this.prj.isLoading = false;
                        }
                      });
                  });
              }
            });
          } else {
            // ZIP FILE IS INVALID
            this.prj.isLoading = false;
            this.snack.open(
                this.words['projects.toolbar']['err_import_file'],
                this.words['dismiss']
              );            
          }
        },
        (ret: HttpErrorResponse) => {
          // ON ERROR
          this.prj.isLoading = false;
          const words = [
            'files.err_upload',
            'files.err_ext',
            'files.err_permission',
          ];
          this.trn.get(words, { name: f.name }).subscribe(words => {
            switch (ret.error.err) {
              default:
                break;
              case -2:
                  this.snack.open(
                    words['files.err_upload'],
                    this.words['dismiss']
                  );               
                break;
              case -3:
                this.snack.open(words['files.err_ext'], this.words['dismiss']);              
                break;
              case -4:
                  this.snack.open(
                    words['files.err_permission'],
                    this.words['dismiss']
                  );
                break;
            }
          });
        }
      );
    }
    e.target.value = null;
  }

  showUploadDialog() {
    this.uploadFiles.nativeElement.click();
  }

  onUploadFilesChange(e: {target: {files: File[], value: File }}) {
    const ref = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: this.words['are_you_sure'],
        msg: this.words['files.confirm_upload'],
        yes: this.words['button.upload'],
        no: this.words['button.cancel'],
      },
    });
    ref.afterClosed().subscribe(ret => {
      if (!ret) return;
      let count = 0;
      const targetCount = e.target.files.length;
      for (const f of e.target.files) {
        this.api.upload(f, true).then(
          (ret: UploadResult) => {
            // ON SUCCUESS
            count++;
            if (count === targetCount) {
              if (!this.utils.IsKuka) {
                this.snack.open(this.words['files.success_upload'], '', {
                  duration: 2000,
                });
              }
              this.prj.fileRefreshNeeded.emit();
            }
          },
          (ret: HttpErrorResponse) => {
            // ON ERROR
            const words = [
              'files.err_upload',
              'files.err_ext',
              'files.err_permission',
            ];
            this.trn.get(words, { name: f.name }).subscribe(words => {
              switch (ret.error.err) {
                default:
                  break;
                case -2:
                    this.snack.open(
                      words['files.err_upload'],
                      this.words['dismiss']
                    );                
                  break;
                case -3:
                    this.snack.open(
                      words['files.err_ext'],
                      this.words['dismiss']
                    );
                  break;
                case -4:
                    this.snack.open(
                      words['files.err_permission'],
                      this.words['dismiss']
                    );                  
                  break;
              }
            });
          }
        );
      }
    });
  }

  undo() {
    this.prgService.onUndo.emit();
  }
  redo() {
    this.prgService.onRedo.emit();
  }
  find() {
    this.prgService.onFind.emit();
  }
  replace() {
    this.prgService.onReplace.emit();
  }

  toggleRemote() {
    if (this.cmn.isTablet) return;
    this.stat.setMode(this.stat.mode === 'R' ? 'A' : 'R');
  }
  
  toggleDependencies() {
    const prj = this.prj.currProject.value;
    const loaded = prj.dependenciesLoaded;
    const name = prj.name;
    const cmd = loaded ? 'PRJ_UNLOAD_DEPENDENCIES' : 'PRJ_LOAD_DEPENDENCIES';
    this.ws.query('call ' + cmd + '("' + name + '")');
  }

  /*
   * DELETES A FOLDER STARTING WITH ITS SUBFOLDERS FIRST
   *
   * @param node
   * a TreeNode of a FOLDER with NO FILES AS DESCENDANTS
   */
  private deleteRecursivly(node: TreeNode): Promise<boolean> {
    if (node.children.length === 0) {
      return this.api.deleteFolder(node.path) as Promise<boolean>;
    }
    const promises: Array<Promise<boolean>> = [];
    for (const n of node.children) {
      if (n.isFolder && this.prj.checklistSelection.isSelected(n)) {
        promises.push(this.deleteRecursivly(n));
      }
    }
    return Promise.all(promises)
      .then((result: boolean[]) => {
        return result.every((result: boolean) => {
          return result;
        });
      })
      .then(result => {
        if (result) {
          return this.api.deleteFolder(node.path) as Promise<boolean>;
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
    if (selected.length === 0) return;
    const ref = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: this.words['are_you_sure'],
        msg: this.words['files.confirm_delete'],
        yes: this.words['button.delete'],
        no: this.words['button.cancel'],
      },
    });
    ref.afterClosed().subscribe(ret => {
      if (ret) {
        let promises = [];
        for (const n of selected) {
          if (!n.isFolder) {
            if (n.name === this.prgService.activeFile) {
              this.prgService.close();
            }
            promises.push(this.api.deleteFile(n.path));
          }
        }
        Promise.all(promises)
          .then((ret: boolean[]) => {
            // check if all results are true
            return ret.every((result: boolean) => {
              return result;
            });
          })
          .then(result => {
            if (result) {
              // ALL FILES DELETES SUCCESSFULY - CONTINUE TO DELETE FOLDERS..
              promises = [];
              for (const n of selected) {
                if (!n.isFolder || n.name === 'SSMC') continue;
                if (
                  n.parent === null ||
                  !this.prj.checklistSelection.isSelected(n.parent)
                ) {
                  promises.push(this.deleteRecursivly(n));
                }
              }
              return Promise.all(promises);
            } else {
              if (!this.utils.IsKuka) {
                this.snack.open(this.words['files.err_delete'], '', {
                  duration: 2000,
                });
              }
            }
          })
          .then((ret: boolean[]) => {
            if (ret) {
              const finalResult = ret.every((result: boolean) => {
                return result;
              });
              const msg = finalResult
                ? this.words['files.success_delete']
                : this.words['files.err_delete'];
              if (!this.utils.IsKuka) {
                this.snack.open(msg, '', { duration: 2000 });
              }
            }
          })
          .then(() => {
            this.prj.fileRefreshNeeded.emit();
          });
      }
    });
  }

  downloadFiles(fromSelected: boolean) {
    let files: string[];
    if (fromSelected) {
      const selected = this.prj.checklistSelection.selected.filter(node => {
        return node.name !== 'FWCONFIG';
      });
      if (selected.length === 0) return;
      files = [];
      for (const node of selected) {
        if (node.name === 'SSMC') continue;
        files.push(node.path);
      }
    } else {
      files = null;
    }
    this.prj.isLoading = true;
    return this.api
      .downloadZip(files)
      .then(
        () => {
          this.prj.isLoading = false;
        },
        err => {
          this.prj.isLoading = false;
          this.snack.open(this.words['error.err'], this.words['dismiss'], {
              duration: 2000,
            });         
        }
      )
      .catch(err => {
        this.prj.isLoading = false;
        this.snack.open(this.words['error.err'], this.words['dismiss'], {
            duration: 2000,
          });      
      });
  }

  onVrateChange(e: MatSliderChange | number) {
    const val = Number(e) || (e as MatSliderChange).value;
    this.prj.currProject.value.settings.vrate = val;
    const cmd = '?TP_SET_PROJECT_VRATE(' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.prj.currProject.value.settings.vrate = Number(ret.result);
    });
  }

  // If "add" is true --> +1, otherwise --> -1
  changeVrate(add: boolean) {
    const val = this.prj.currProject.value.settings.vrate + (add ? 1 : -1);
    if (val === 0 || val === 101) return;
    this.onVrateChange(val);
  }
}
