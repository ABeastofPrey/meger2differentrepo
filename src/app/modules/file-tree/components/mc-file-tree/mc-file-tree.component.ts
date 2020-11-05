import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  MatTreeNestedDataSource,
  MatDialog,
  MatSnackBar,
} from '@angular/material';
import {
  ApiService,
  ProjectManagerService,
  UploadResult,
  LoginService,
  MCFileSearchResult,
} from '../../../core';
import { of, Subject, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FileFilterService } from '../../file-filter.service';
import { ProgramEditorService } from '../../../program-editor/services/program-editor.service';
import { TranslateService } from '@ngx-translate/core';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { NewFileDialogComponent } from '../new-file-dialog/new-file-dialog.component';
import { SingleInputDialogComponent } from '../../../../components/single-input-dialog/single-input-dialog.component';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { UtilsService } from '../../../core/services/utils.service';
import { HttpParams } from '@angular/common/http';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'mc-file-tree',
  templateUrl: './mc-file-tree.component.html',
  styleUrls: ['./mc-file-tree.component.css'],
})
export class McFileTreeComponent implements OnInit {

//   @ViewChild('searchInput', { static: false }) searchInput: ElementRef;
  @ViewChild('menuDiv', { static: false }) menuDiv: ElementRef;

  nestedTreeControl: NestedTreeControl<TreeNode>;
  nestedDataSource: MatTreeNestedDataSource<TreeNode>;

  nestedTreeControlContent: NestedTreeControl<TreeNodeContent>;
  nestedDataSourceContent: MatTreeNestedDataSource<TreeNodeContent>;

  unfilteredDataSource: TreeNode[];
  lastSelectedNode: TreeNode = null;
  filterByString = '';
  env = environment;
  isRefreshing = false;
  enableSelect = false;
  selectBusy = false;
  searchIn = 'names';

  private _aborting = false;
  private _sub: Subscription = null;

  /*
   * CONTEXT MENU
   */
  menuVisible = false;
  menuLeft = '0';
  menuTop = '0';
  private menuHeight = 0;

  private notifier: Subject<boolean> = new Subject();
  private lastSearchTimeout: number = null;
  private words: {};

  constructor(
    private api: ApiService,
    private prj: ProjectManagerService,
    private filterService: FileFilterService,
    private service: ProgramEditorService,
    private trn: TranslateService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private login: LoginService,
    private utils: UtilsService,
    private router: Router
  ) {
    
  }

  ngOnInit() {
    this.trn
      .get([
        'copy',
        'error.err',
        'dismiss',
        'success',
        'projects.toolbar.new_folder',
        'projects.toolbar.copy_name',
        'projectTree.dirty',
        'button.save',
        'button.discard',
        'files.dir_name',
        'button.create',
        'projects.toolbar',
        'button.overwrite',
        'button.discard',
        'button.copy',
        'button.delete',
        'button.cancel',
        'are_you_sure',
        'files.confirm_delete',
        'files.success_delete',
        'files.err_delete',
      ])
      .subscribe(words => {
        this.words = words;
      });
    this.filterService.filteredData
      .pipe(takeUntil(this.notifier))
      .subscribe((data: TreeNode[]) => {
        if (this.nestedDataSource) {
          this.nestedDataSource.data = data;
          this.nestedTreeControl.dataNodes = data;
          this.nestedTreeControl.expandAll();
          if (this.isRefreshing) {
            this.isRefreshing = false;
          }
          setTimeout(() => {
            (document.activeElement as HTMLElement).blur();
          }, 0);
        }
      });
    this.prj.fileRefreshNeeded.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.refreshFiles();
    });
    this.refreshFiles();
    this.nestedTreeControlContent = new NestedTreeControl<TreeNodeContent>(this._getChildrenContent);
    this.nestedDataSourceContent = new MatTreeNestedDataSource();
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  onEnableSelectChange() {
    if (!this.enableSelect) return;
    this.selectBusy = true;
    setTimeout(()=>{
      this.selectBusy = false;
    },1000);
  }

  openContextMenu(event: MouseEvent, node: TreeNode) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.lastSelectedNode = node;
    const x = event.pageX + 5;
    const y = event.pageY + 5;
    if (this.menuHeight > 0) {
      this.updateMenuPosition(x, y);
    } else {
      this.menuVisible = true;
      setTimeout(() => {
        this.menuHeight = this.menuDiv.nativeElement.clientHeight - 5;
        this.updateMenuPosition(x, y);
      }, 200);
    }
  }

  private updateMenuPosition(x: number, y: number) {
    if (window.innerHeight - y < this.menuHeight) {
      y = window.innerHeight - this.menuHeight - 15;
    }
    this.menuLeft = x + 'px';
    this.menuTop = y + 5 + 'px';
    this.menuVisible = true;
  }

  closeContextMenu() {
    this.menuVisible = false;
  }

  onSearchChange(force?: boolean) {
    clearTimeout(this.lastSearchTimeout);
    const curr = this.filterByString;
    if (force) {
      return this.filterData();
    }
    if (this.searchIn === 'content') return;
    this.lastSearchTimeout = window.setTimeout(() => {
      if (curr === this.filterByString) {
        // not changed for 500 ms
        this.filterData();
      }
    }, 1500);
  }

  private refreshFiles() {
    this.isRefreshing = true;
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.prj.checklistSelection.clear();
    this.api
      .get('/cs/api/files')
      .toPromise()
      .then((ret: JsonNode) => {
        const parent = new TreeNode(ret, null);
        const data = [];
        if (this.login.isAdmin) {
          data.push(new TreeNode(null, null));
        }
        data.push(parent);
        this.unfilteredDataSource = data;
        this.nestedDataSource._data.next(this.unfilteredDataSource);
        this.nestedTreeControl.expand(parent);
        this.isRefreshing = false;
      });
  }

  private _getChildren = (node: TreeNode) => {
    return of(node.children);
  };

  private _getChildrenContent = (node: TreeNodeContent) => {
    return of(node.children);
  };

  hasNestedChild = (_: number, nodeData: TreeNode) => {
    return nodeData && nodeData.isFolder;
  };

  hasNestedChildContent = (_: number, nodeData: TreeNodeContent) => {
    return nodeData && nodeData.children;
  };

  getFileTextSearch(search: string, path: string) {
    let body = new HttpParams();
    body = body.set('search', search);
    body = body.set('path', path);
    return this.api.get('/cs/api/search', body);
  }

  filterData() {
    if (this.filterByString.length <= 1) this.isRefreshing = true;
    const contentSearch = this.searchIn === 'content';
    if (this.filterByString.length === 0) {
      if (contentSearch) {
        this.nestedDataSourceContent.data = [];
        this.nestedTreeControlContent.dataNodes = [];
        this.isRefreshing = false;
        this._aborting = false;
        return;
      }
      this.nestedDataSource.data = this.unfilteredDataSource;
      this.nestedTreeControl.dataNodes = this.unfilteredDataSource;
      this.nestedTreeControl.collapseAll();
      // expand SSMC
      this.nestedTreeControl.expand(this.nestedDataSource.data[1]);
      this.isRefreshing = false;
      return;
    }
    if (contentSearch) {
      this.isRefreshing = true;
      this._sub = this.getFileTextSearch(this.filterByString, '').subscribe((ret:MCFileSearchResult[])=>{
        if (this._aborting) {
          this._aborting = false;
          this.isRefreshing = false;
          return;
        }
        let data: TreeNodeContent[] = [];
        for (const result of ret) {
          data.push({
            file: result.name,
            path: result.path,
            children: result.lines.map(l=>{
              return {
                file: result.name,
                path: result.path,
                children: null,
                line: l.line,
                index: l.index
              };
            })
          });
        }
        if (this._aborting) {
          this._aborting = false;
          this.isRefreshing = false;
          return;
        }
        this.nestedDataSourceContent.data = data;
        this.nestedTreeControlContent.dataNodes = data;
        this.nestedTreeControlContent.expandAll();
        this.isRefreshing = false;
        this._aborting = false;
      });
      return;
    } else {
      this.filterService.filter(this.unfilteredDataSource, this.filterByString);
    }
  }

  toggleNode(node: TreeNode) {
    this.nestedTreeControl.toggle(node);
    if (!this.nestedTreeControl.isExpanded(node)) {
      this.nestedTreeControl.collapseDescendants(node);
    }
  }

  toggleContentNode(node: TreeNodeContent) {
    this.nestedTreeControlContent.toggle(node);
    if (!this.nestedTreeControlContent.isExpanded(node)) {
      this.nestedTreeControlContent.collapseDescendants(node);
    }
  }

  /* ANGULAR MATERIAL DEMO FUNCTIONS FOR CHECKBOX SELECTION */
  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TreeNode): boolean {
    if (!node) {
      return false;
    }
    if (!node.isFolder || node.children.length === 0) {
      return this.prj.checklistSelection.isSelected(node);
    }
    return node.children.every(c=>{
      return this.prj.checklistSelection.isSelected(c);
    });
    const descendants = this.nestedTreeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.prj.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeNode): boolean {
    if (!node) {
      return false;
    }
    const descendants = this.nestedTreeControl.getDescendants(node);
    return node.children.some(c=>{
      return this.prj.checklistSelection.isSelected(c);
    });
  }

  /** Toggle the item selection. Select/deselect all the descendants node */
  nodeSelectionToggle(node: TreeNode): void {
    if (!node) {
      return;
    }
    this.prj.checklistSelection.toggle(node);
    this.prj.checklistSelection.isSelected(node);
    const descendants = this.nestedTreeControl.getDescendants(node);
    this.prj.checklistSelection.isSelected(node)
      ? this.prj.checklistSelection.select(...descendants)
      : this.prj.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child => this.prj.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  leafSelectionToggle(node: TreeNode): void {
    this.prj.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TreeNode): void {
    let parent: TreeNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TreeNode): void {
    const nodeSelected = this.prj.checklistSelection.isSelected(node);
    const descendants = this.nestedTreeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.prj.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.prj.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.prj.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TreeNode): TreeNode | null {
    return node.parent;
  }

  openFile(n: TreeNode) {
    let path = n.parent ? n.parent.decodedPath : '';
    if (!path) path = null; // to handle files in SSMC
    if (this.service.activeFile === n.name && this.service.activeFilePath === path) return;
    if (this.service.isDirty && this.service.activeFile) {
      this.trn.get('projectTree.dirty_msg', { name: this.service.activeFile }).subscribe(word => {
        this.dialog.open(YesNoDialogComponent, {
          data: {
            title: this.words['projectTree.dirty'],
            msg: word,
            yes: this.words['button.discard'],
            no: this.words['button.cancel'],
            third: this.words['button.save'],
            thirdColor: 'primary',
            warnBtn: true
          },
          width: '500px',
        }).afterClosed().subscribe(ret => {
          if (ret === 3) {
            this.service.save().then(() => {
              this.openFile(n);
            });
          } else if (ret) {
            this.service.isDirty = false;
            this.openFile(n);
          } else {
            return;
          }
        });
      });
      return;
    }
    this.service.close();
    this.service.mode = 'editor';
    this.router.navigateByUrl('/projects');
    setTimeout(() => {
      this.service.dragEnd.emit();
    }, 200);
    if (n.name === 'FWCONFIG' && !this.login.isSuper) {
      this.service.showFwconfigEditor();
      return;
    }
    this.service.setFile(
      n.name,
      n.parent ? n.parent.decodedPath : '',
      null,
      -1
    );
  }

  openContentFile(n: TreeNodeContent) {
    const prefix = '/FFS0/SSMC/';
    const i = n.path.lastIndexOf('/');
    const path = n.path.substring(prefix.length,i+1);
    if (this.service.activeFile === n.file && this.service.activeFilePath === path) {
      this.service.skipToLine(n.index+1);
      return;
    };
    if (this.service.isDirty && this.service.activeFile) {
      this.trn.get('projectTree.dirty_msg', { name: this.service.activeFile }).subscribe(word => {
        this.dialog.open(YesNoDialogComponent, {
          data: {
            title: this.words['projectTree.dirty'],
            msg: word,
            yes: this.words['button.discard'],
            no: this.words['button.cancel'],
            third: this.words['button.save'],
            thirdColor: 'primary',
            warnBtn: true
          },
          width: '500px',
        }).afterClosed().subscribe(ret => {
          if (ret === 3) { //save
            this.service.save().then(() => {
              this.openContentFile(n);
            });
          } else if (ret) { // discard
            this.service.isDirty = false;
            this.openContentFile(n);
          } else { // cancel
            return;
          }
        });
      });
      return;
    }
    this.service.close();
    this.service.mode = 'editor';
    this.router.navigateByUrl('/projects');
    setTimeout(() => {
      this.service.dragEnd.emit();
    }, 200);
    if (n.file === 'FWCONFIG' && !this.login.isSuper) {
      this.service.showFwconfigEditor();
      return;
    }
    console.log(path);
    this.service.setFile(n.file,path,null,n.index+1);
  }

  abortSearch() {
    this.api.abortFileTextSearch();
    this._aborting = true;
    if (this._sub) {
      this._sub.unsubscribe();
    }
    this.filterByString = '';
    this.filterData();
  }

  newFile(node: TreeNode) {
    this.dialog
      .open(NewFileDialogComponent)
      .afterClosed()
      .subscribe((ret: string) => {
        if (ret) {
          const f = new File([new Blob([''])], ret);
          let path = '';
          if (node.isFolder && node.name !== 'SSMC') path = node.decodedPath;
          else if (node.parent && node.parent.name !== 'SSMC') {
            path = node.parent.decodedPath;
 }
          this.api.uploadToPath(f, false, path).then((result: UploadResult) => {
            if (result.success) {
            //   this.snack.open(this.words['success'], this.words['dismiss'], {
            //       duration: 1500,
            //     });
              this.snackbarService.openTipSnackBar("success");
              
              this.prj.fileRefreshNeeded.emit();
              this.service.setFile(ret, null, null, -1);
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
                          .uploadToPath(f, true, path)
                          .then((result: UploadResult) => {
                            if (result.success) {
                                // this.snack.open(
                                //   this.words['success'],
                                //   this.words['dismiss'],
                                //   { duration: 1500 }
                                // );   
                                this.snackbarService.openTipSnackBar("success");                          
                              this.prj.fileRefreshNeeded.emit();
                              this.service.setFile(ret, null, null, -1);
                            } else {
                                // this.snack.open(
                                //   this.words['error.err'],
                                //   this.words['dismiss'],
                                //   { duration: 2000 }
                                // );  
                                this.snackbarService.openTipSnackBar("error.err");                           
                            }
                          });
                      }
                    });
                });
            } else {
                // this.snack.open(this.words['error.err'], this.words['dismiss'], {
                //   duration: 2000,
                // });      
                this.snackbarService.openTipSnackBar("error.err");       
            }
          });
        }
      });
  }

  newFolder(node: TreeNode) {
    this.dialog
      .open(SingleInputDialogComponent, {
        data: {
          icon: 'create_new_folder',
          title: this.words['projects.toolbar.new_folder'],
          placeholder: this.words['files.dir_name'],
          accept: this.words['button.create']
        },
      })
      .afterClosed()
      .subscribe((name: string) => {
        if (name) {
          let path = '';
          if (node.isFolder && node.name !== 'SSMC') path = node.decodedPath;
          else if (node.parent && node.parent.name !== 'SSMC') {
            path = node.parent.decodedPath;
 }
          this.api.createFolder(path + name).then(result => {
            if (result) {
                // this.snack.open(this.words['success'], this.words['dismiss'], {
                //   duration: 1500,
                // });   
                this.snackbarService.openTipSnackBar("success");          
              this.prj.fileRefreshNeeded.emit();
            } else {
                // this.snack.open(this.words['error.err'], this.words['dismiss'], {
                //   duration: 2000,
                // });    
                this.snackbarService.openTipSnackBar("error.err");         
            }
          });
        }
      });
  }

  moveHere(node: TreeNode) {
    const selected = this.prj.checklistSelection.selected;
    if (selected.length === 0) return;
    let path = '';
    if (node.isFolder) path = node.path;
    else if (node.parent) path = node.parent.path;
    let files = '';
    for (const n of selected) files += n.path + ',';
    files = files.slice(0, -1); // remove last comma
    this.api.moveFiles(files, path).then(result => {
      if (result) {
        this.prj.fileRefreshNeeded.emit();
      } else {
        //   this.snack.open(this.words['error.err'], this.words['dismiss'], {
        //     duration: 2000,
        //   });    
          this.snackbarService.openTipSnackBar("error.err");   
      }
    });
  }

  copy(node: TreeNode) {
    if (node.name === 'SSMC' || node.name === 'FWCONFIG') return false;
    const i = node.name.lastIndexOf('.');
    const nameOnly = i === -1 ? node.name : node.name.substring(0, i);
    const copyName =
      nameOnly + '_COPY' + (i === -1 ? '' : node.name.substring(i));
    this.dialog
      .open(SingleInputDialogComponent, {
        data: {
          icon: 'file_copy',
          title: this.words['copy'],
          placeholder: this.words['projects.toolbar.copy_name'],
          initialValue: copyName,
          accept: this.words['button.copy']
        },
      })
      .afterClosed()
      .subscribe((name: string) => {
        if (!name || name.indexOf('/') !== -1) return;
        name = name.toUpperCase();
        const j = name.lastIndexOf('.');
        if ((j === -1 && i !== -1) || (j !== -1 && i === -1)) return;
        if (j !== -1) {
          const ext = name.substring(j + 1).trim();
          if (ext.length === 0 || !node.name.endsWith(ext)) return;
        }
        const fromPath = node.decodedPath;
        const toPath =
          (node.parent && node.parent.decodedPath
            ? node.parent.decodedPath
            : '') + name;
        this.api.copy(fromPath, toPath).then(result => {
          if (result) {
            //   this.snack.open(this.words['success'], this.words['dismiss'], {
            //     duration: 1500,
            //   });
              this.snackbarService.openTipSnackBar("success");
            this.prj.fileRefreshNeeded.emit();
          } else {
            //   this.snack.open(this.words['error.err'], this.words['dismiss'], {
            //     duration: 2000,
            //   });
              this.snackbarService.openTipSnackBar("error.err");
          }
        });
      });
  }

  private deleteRecursive(n: TreeNode) {
    let arr = [];
    if (n.isFolder) {
      for (const c of n.children) {
        arr = arr.concat(this.deleteRecursive(c));
      }
    }
    return Promise.all(arr).then(() => {
      return this.api.deleteFile(n.path);
    });
  }

  /*
   * Deletes a file or folder
   */
  delete(n: TreeNode) {
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
        if (!n.isFolder) {
          this.service.tabs.forEach((t,i) => {
            if (t.file === n.name) {
              this.service.closeTab(i);
            }
          });
        }
        this.deleteRecursive(n).then(ret => {
          const msg = ret
            ? this.words['files.success_delete']
            : this.words['files.err_delete'];
            // this.snack.open(msg, '', { duration: 2000 });
            this.snackbarService.openTipSnackBar(msg);
          if (ret) this.prj.fileRefreshNeeded.emit();
        });
      }
    });
  }
}

interface TreeNodeContent {
  file: string,
  path: string,
  children: TreeNodeContent[];
  index?: number;
  line?: string;
}

export class TreeNode {
  name: string;
  children: TreeNode[] = [];
  isFolder: boolean;
  parent: TreeNode;
  ref: TreeNode; // for filtered data, reference the original node
  path: string;
  decodedPath: string;

  constructor(node: JsonNode | string, parent: TreeNode) {
    if (parent === null && node) {
      this.name = 'SSMC';
      this.isFolder = true;
      this.parent = null;
      this.children = new TreeNode(node, this).children;
      return;
    }
    if (node === null) {
      this.name = 'FWCONFIG';
      this.isFolder = false;
      this.parent = null;
      return;
    }
    this.parent = parent;
    if (typeof node === 'string') {
      // a leaf
      this.name = node;
      this.isFolder = false;
    } else {
      // a folder
      this.name = node.path;
      this.isFolder = true;
      for (const c of node.children) {
        this.children.push(new TreeNode(c, this));
      }
      for (const f of node.files) {
        this.children.push(new TreeNode(f, this));
      }
    }
    // SET PATH
    let path = this.name;
    this.path = path;
    if (parent === null || parent.name === 'SSMC') return;
    // TRAVEL UP THE TREE UNTIL JUST BEFORE THE ROOT
    while (parent.parent && parent.parent.name !== 'SSMC') {
      path = parent.name + '$$' + path; // $$ will be replaced with "/"
      parent = parent.parent;
    }
    this.path = path;
    // SET DECODED PATH
    this.decodedPath = path.replace(new RegExp('\\$\\$', 'g'), '/');
    if (this.isFolder) this.decodedPath += '/';
  }
}

interface JsonNode {
  path: string;
  children: JsonNode[];
  files: string[];
}
