import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource, MatDialog, MatSnackBar} from '@angular/material';
import {ApiService, ProjectManagerService, UploadResult} from '../../../core';
import {of, Subscription} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {FileFilterService} from '../../file-filter.service';
import {ProgramEditorService} from '../../../program-editor/services/program-editor.service';
import {TranslateService} from '@ngx-translate/core';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {NewFileDialogComponent} from '../new-file-dialog/new-file-dialog.component';
import {SingleInputDialogComponent} from '../../../../components/single-input-dialog/single-input-dialog.component';

@Component({
  selector: 'mc-file-tree',
  templateUrl: './mc-file-tree.component.html',
  styleUrls: ['./mc-file-tree.component.css']
})
export class McFileTreeComponent implements OnInit {
  
  @ViewChild('searchInput') searchInput: ElementRef;
  
  nestedTreeControl: NestedTreeControl<TreeNode>;
  nestedDataSource: MatTreeNestedDataSource<TreeNode>;
  unfilteredDataSource: TreeNode[];
  lastSelectedNode: TreeNode = null;
  filterByString: string = "";
  env = environment;
  isRefreshing: boolean = false;
  enableSelect: boolean = false;
  
  /*
   * CONTEXT MENU
   */
  menuVisible: boolean = false;
  menuLeft: string = '0';
  menuTop: string = '0';
  
  private sub: Subscription;
  private lastSearchTimeout: any = null;
  private words: any;

  constructor(
    private api: ApiService,
    private prj: ProjectManagerService,
    private filterService: FileFilterService,
    private service: ProgramEditorService,
    private trn: TranslateService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {
    this.trn.get([
      'error.err','dismiss','success','projects.toolbar.new_folder',
      'projectTree.dirty','button.save','button.discard','files.dir_name',
      'button.create','projects.toolbar','button.overwrite','button.discard'
    ]).subscribe(words=>{
      this.words=words;
    });
    this.filterService.filteredData.subscribe((data:TreeNode[])=>{
      if (this.nestedDataSource) {
        this.nestedDataSource.data = data;
        this.nestedTreeControl.dataNodes = data;
        this.nestedTreeControl.expandAll();
        if (this.isRefreshing) {
          this.isRefreshing = false;
          setTimeout(()=>{
            this.searchInput.nativeElement.focus();
          },0);
        }
      }
    });
  }

  ngOnInit() {
    this.sub = this.prj.fileRefreshNeeded.subscribe(()=>{
      this.refreshFiles();
    });
    this.refreshFiles();
  }
  
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  
  openContextMenu(event:MouseEvent, node: TreeNode) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.lastSelectedNode = node;
    this.menuLeft = event.pageX + 5 + 'px';
    this.menuTop = event.pageY + 5 + 'px';
    this.menuVisible = true;
  }
  
  closeContextMenu() {
    this.menuVisible = false;
  }
  
  
  onSearchChange() {
    if (this.lastSearchTimeout)
      clearTimeout(this.lastSearchTimeout);
    const curr = this.filterByString;
    this.lastSearchTimeout = setTimeout(()=>{
      if (curr === this.filterByString) // not changed for 500 ms
        this.filterData();
    },400);
  }
  
  private refreshFiles() {
    this.isRefreshing = true;
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.prj.checklistSelection.clear();
    this.api.get('/cs/api/files').toPromise().then((ret:JsonNode)=>{
      const parent = new TreeNode(ret,null);
      this.unfilteredDataSource = [parent];
      this.nestedDataSource._data.next(this.unfilteredDataSource);
      this.nestedTreeControl.expand(parent);
      this.isRefreshing = false;
    });
  }
  
  private _getChildren = (node: TreeNode) => {
    return of(node.children);
  };
  
  hasNestedChild = (_: number, nodeData: TreeNode) => {
    return nodeData && nodeData.isFolder;
  };
  
  filterData() {
    if (this.filterByString.length <= 1)
      this.isRefreshing = true;
    if (this.filterByString.length === 0) {
      this.nestedDataSource.data = this.unfilteredDataSource;
      this.nestedTreeControl.dataNodes = this.unfilteredDataSource;
      this.nestedTreeControl.collapseAll();
      this.isRefreshing = false;
      return;
    }
    this.filterService.filter(this.unfilteredDataSource,this.filterByString);
  }
  
  toggleNode(node: TreeNode) {
    this.nestedTreeControl.toggle(node);
    if (!this.nestedTreeControl.isExpanded(node))
      this.nestedTreeControl.collapseDescendants(node);
  }
  
  /* ANGULAR MATERIAL DEMO FUNCTIONS FOR CHECKBOX SELECTION */
  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TreeNode): boolean {
    if (!node) {
      return false;
    }
    if (!node.isFolder || node.children.length === 0)
      return this.prj.checklistSelection.isSelected(node);
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
    const result = descendants.some(child => this.prj.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
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
    descendants.every(child =>
      this.prj.checklistSelection.isSelected(child)
    );
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
  
  openFile(n:TreeNode) {
    if (this.service.isDirty && this.service.activeFile) {
      this.trn.get('projectTree.dirty_msg', {name: this.service.activeFile})
      .subscribe(word=>{
        this.dialog.open(YesNoDialogComponent,{
          data: {
            title: this.words['projectTree.dirty'],
            msg: word,
            yes: this.words['button.save'],
            no: this.words['button.discard']
          },
          width: '500px'
        }).afterClosed().subscribe(ret=>{
          if (ret) {
            this.service.save().then(()=>{
              this.openFile(n);
            });
          } else {
            this.service.isDirty = false;
            this.openFile(n);
          }
        });
        return;
      });
    }
    this.service.close();
    this.service.mode = 'editor';
    setTimeout(()=>{
      this.service.dragEnd.emit();
    },200);
    this.service.setFile(n.name, n.parent ? n.parent.decodedpath : '', null);
  }
  
  newFile(node: TreeNode) {
    this.dialog.open(NewFileDialogComponent).afterClosed().subscribe((ret:string)=>{
      if (ret) {
        const f = new File([new Blob([''])],ret);
        let path = '';
        if (node.isFolder && node.name !== 'SSMC')
          path = node.decodedpath;
        else if (node.parent && node.parent.name !== 'SSMC')
          path = node.parent.decodedpath;
        this.api.uploadToPath(f, false, path).then((result: UploadResult)=>{
          if (result.success) {
            this.snack.open(
              this.words['success'],
              this.words['dismiss'],
              {duration:1500}
            );
            this.prj.fileRefreshNeeded.emit();
            this.service.setFile(ret,null,null);
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
                  this.api.uploadToPath(f, true, path).then((result: UploadResult)=>{
                    if (result.success) {
                      this.snack.open(
                        this.words['success'],
                        this.words['dismiss'],
                        {duration:1500}
                      );
                      this.prj.fileRefreshNeeded.emit();
                      this.service.setFile(ret,null,null);
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
  
  newFolder(node: TreeNode) {
    this.dialog.open(SingleInputDialogComponent,{
      data: {
        icon: 'create_new_folder',
        title: this.words['projects.toolbar.new_folder'],
        placeholder: this.words['files.dir_name'],
        accept: this.words['button.create']
      }
    }).afterClosed().subscribe((name:string)=>{
      if (name) {
        let path = '';
        if (node.isFolder && node.name !== 'SSMC')
          path = node.decodedpath;
        else if (node.parent && node.parent.name !== 'SSMC')
          path = node.parent.decodedpath;
        this.api.createFolder(path + name).then(result=>{
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
  
  moveHere(node: TreeNode) {
    const selected = this.prj.checklistSelection.selected;
    if (selected.length === 0)
      return;
    let path = '';
    if (node.isFolder)
      path = node.path;
    else if (node.parent)
      path = node.parent.path;
    let files = '';
    for (let n of selected)
      files += n.path + ',';
    files = files.slice(0, -1); // remove last comma
    this.api.moveFiles(files,path).then(result=>{
      if (result) {
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

}

export class TreeNode {
  name: string;
  children: TreeNode[] = [];
  isFolder: boolean;
  parent: TreeNode;
  
  constructor(node:JsonNode | string, parent: TreeNode) {
    if (parent === null) {
      this.name = 'SSMC';
      this.isFolder = true;
      this.parent = null;
      this.children = new TreeNode(node, this).children;
      return;
    }
    this.parent = parent;
    if (typeof node === 'string') {
      this.name = node;
      this.isFolder = false;
      return;
    }
    this.name = node.path;
    this.isFolder = true;
    for (let c of node.children) {
      this.children.push(new TreeNode(c,this));
    }
    for (let f of node.files) {
      this.children.push(new TreeNode(f, this));
    }
  }
  
  get path() : string {
    let path = this.name;
    let parent = this.parent;
    if (parent === null || parent.name === 'SSMC')
      return path;
    // TRAVEL UP THE TREE UNTIL JUST BEFORE THE ROOT
    while (parent.parent && parent.parent.name !== 'SSMC') {
      path = parent.name + '$$' + path; // $$ will be replaced with "/"
      parent = parent.parent;
    }
    return path;
  }
  
  get decodedpath() : string {
    const path = this.path;
    const decoded = path.replace(new RegExp('\\$\\$','g'),'/') + '/';
    return decoded;
  }
}

interface JsonNode {
  path: string;
  children: JsonNode[];
  files: string[];
}
