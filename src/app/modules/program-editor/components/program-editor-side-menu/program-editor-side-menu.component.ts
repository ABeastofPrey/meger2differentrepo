import { Component, OnInit } from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource, MatDialog, MatSnackBar} from '@angular/material';
import {of as observableOf} from 'rxjs';
import {NewProjectDialogComponent} from '../new-project-dialog/new-project-dialog.component';
import {NewProjectFileDialogComponent} from '../new-project-file-dialog/new-project-file-dialog.component';
import {ProgramEditorService} from '../../services/program-editor.service';
import {ApiService} from '../../../../modules/core/services/api.service';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {MCFile, ProjectManagerService} from '../../../core';
import {environment} from '../../../../../environments/environment';
import {MCProject} from '../../../core/models/project/mc-project.model';

const leafTypes = [
  'File','Data','Library','Macros','Settings','Errors','Dependency'
];

@Component({
  selector: 'program-editor-side-menu',
  templateUrl: './program-editor-side-menu.component.html',
  styleUrls: ['./program-editor-side-menu.component.css']
})
export class ProgramEditorSideMenuComponent implements OnInit {
  
  nestedTreeControl: NestedTreeControl<TreeNode>;
  nestedDataSource: MatTreeNestedDataSource<TreeNode>;
  lastSelectedNode: TreeNode = null;
  lastSelectedFile: MCFile = null;
  
  private _getChildren = (node: TreeNode) => {return observableOf(node.children); };

  constructor(
    public service : ProgramEditorService,
    private api : ApiService,
    private dialog : MatDialog,
    private snack: MatSnackBar,
    private prj: ProjectManagerService
  ) { }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.refreshData();
  }
  
  selectNode(node: TreeNode) {
    this.lastSelectedNode = node;
    this.lastSelectedFile = null;
  }
  
  selectFile(file: MCFile) {
    this.lastSelectedFile = file;
    this.lastSelectedNode = null;
  }
  
  toggleNode(node: TreeNode) {
    this.nestedTreeControl.toggle(node);
    if (!this.nestedTreeControl.isExpanded(node))
      this.nestedTreeControl.collapseDescendants(node);
  }
  
  openFile(n:TreeNode) {
    for (let f of this.service.files) {
      if (f.fileName === n.name)
        this.service.setFile(f);
    }
  }
  
  new() {
    let ref = this.dialog.open(NewProjectDialogComponent);
    ref.afterClosed().subscribe(projectName=>{
      if (projectName) {
        this.api.createProject(projectName).then((ret:number)=>{
          if (ret === 0)
            this.refreshData();
          else
            this.snack.open('Error ' + ret + ": Can't create Project.",'',{duration:1500});
        });
      }
    });
  }
  
  download(n:TreeNode) {
    let files = [];
    for (let node of n.children) {
      for (let f of node.children) {
        files.push(f.name);
      }
    }
    this.api.downloadZip(files);
  }
  
  deleteProject(n:TreeNode) {
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        yes: 'DELETE',
        no: 'CANCEL',
        title: 'Delete Project ' + n.name + '?',
        msg: 'The files associated with this project will NOT be deleted.'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        this.api.deleteProject(n.name).then(ret=>{
          if (ret === 0)
            this.refreshData();
        });
      }
    });
  }
  
  removeFileFromProject(n:TreeNode) {
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        yes: 'REMOVE FROM PROJECT',
        no: 'CANCEL',
        title: 'Remove File ' + n.name + ' from Project?',
        msg: 'The file will be removed from THIS project only.'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        this.api.deleteFileFromProject(n.projectNameRef, n.name).then(ret=>{
          if (ret === 0) {
            this.refreshData().then(()=>{
              for (let project of this.nestedDataSource.data) {
                if (project.name !== n.projectNameRef)
                  continue;
                this.nestedTreeControl.expand(project);
                for (let node of project.children) {
                  if (n.parent && node.name === n.parent.name) {
                    this.nestedTreeControl.expand(node);
                  }
                }
              }
            });
          }
        });
      }
    });
  }
  
  addFileToProject(n:TreeNode) {
    let ref = this.dialog.open(NewProjectFileDialogComponent,{
      data: n.type
    });
    ref.afterClosed().subscribe((fileName:string)=>{
      if (fileName) {
        this.api.addToProject(n.projectNameRef, fileName).then(ret=>{
          if (ret === 0) {
            this.refreshData().then(()=>{
              for (let project of this.nestedDataSource.data) {
                if (project.name !== n.projectNameRef)
                  continue;
                this.nestedTreeControl.expand(project);
                for (let node of project.children) {
                  if (node.name === n.name) {
                    this.nestedTreeControl.expand(node);
                  }
                }
              }
              this.service.refreshFiles();
            });
          } else {
            this.snack.open('Error ' + ret + ": Can't add file to project");
          }
        });
      }
    });
  }
  
  refreshData() {
    return this.prj.getMCProjects().then((ret:MCProject[])=>{
      let data : TreeNode[] = [];
      for (let p of ret) {
        let apps = new TreeNode('Apps', 'Apps', p.name,null);
        for (let app of p.apps) {
          let appNode = new TreeNode(app.name, 'App', p.name,apps);
          let libsNode = new TreeNode('Libraries','Libraries',p.name,appNode);
          for (let lib of app.libs) {
            libsNode.children.push(new TreeNode(lib,'Library',p.name,libsNode));
          }
          appNode.children.push(new TreeNode(app.name+'.UPG','File',p.name,appNode));
          appNode.children.push(new TreeNode('App Data','Data',p.name,appNode));
          appNode.children.push(libsNode);
          apps.children.push(appNode);
        }
        let deps = new TreeNode('Dependencies', 'Dependencies', p.name,null);
        for (let dep of p.dependencies) {
          deps.children.push(new TreeNode(dep,'Dependency',p.name,deps));
        }
        let macros = new TreeNode('Macros', 'Macros', p.name,null);
        let settings = new TreeNode('Settings', 'Settings', p.name,null);
        let errors = new TreeNode('User Errors', 'Errors', p.name,null);
        data.push(apps);
        data.push(deps);
        data.push(settings);
        data.push(errors);
        data.push(macros);
      }
      this.nestedDataSource.data = data;
    });
  }
  
  hasNestedChild = (_: number, nodeData: TreeNode) => {
    return nodeData && !leafTypes.includes(nodeData.type);
  };

}

class TreeNode {
  name: string;
  type: string;
  children: TreeNode[] = [];
  projectNameRef : string;
  parent : TreeNode;
  
  constructor(name:string,typeStr:string,projectNameRef:string, parent:TreeNode) {
    this.name = name;
    this.type = typeStr;
    this.projectNameRef = projectNameRef;
    this.parent = parent
  }
}