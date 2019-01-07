import { Component, OnInit, ViewChild } from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource, MatDialog} from '@angular/material';
import {of as observableOf, Subscription} from 'rxjs';
import {ProgramEditorService, getStatusString} from '../../services/program-editor.service';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {MCFile, ProjectManagerService, DataService, WebsocketService, MCQueryResponse} from '../../../core';
import {MCProject} from '../../../core/models/project/mc-project.model';
import {ElementRef} from '@angular/core';
import {NewAppDialogComponent} from '../toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import {NewLibDialogComponent} from '../toolbar-dialogs/new-lib-dialog/new-lib-dialog.component';
import {NgZone} from '@angular/core';

const leafTypes = [
  'File','Data','Library','Macros','Settings','Errors','Dependency','Frames',
  'Pallets','Grippers','Vision','Conveyor','IO','Payloads'
];
const disableWhenProjectActive = [
 'DATA','MACROS','SETTINGS','ERRORS','FRAMES','PALLETS','GRIPPERS','PAYLOADS'
];

@Component({
  selector: 'program-editor-side-menu',
  templateUrl: './program-editor-side-menu.component.html',
  styleUrls: ['./program-editor-side-menu.component.css']
})
export class ProgramEditorSideMenuComponent implements OnInit {
  
  @ViewChild('menu') menu : ElementRef;
  
  nestedTreeControl: NestedTreeControl<TreeNode>;
  nestedDataSource: MatTreeNestedDataSource<TreeNode>;
  lastSelectedNode: TreeNode = null;
  lastSelectedFile: MCFile = null;
  currProject: MCProject = null;
  menuVisible: boolean = false;
  menuLeft: string = '0';
  menuTop: string = '0';
  
  private _modeToggle: string = 'prj';
  private _getChildren = (node: TreeNode) => {return observableOf(node.children); };
  private subscriptions: Subscription[] = [];
  
  get modeToggle() { return this._modeToggle; }
  set modeToggle(val:string) {
    this._modeToggle = val;
    if (val === 'mc')
      this.service.mode = 'editor';
  }

  constructor(
    public service : ProgramEditorService,
    private dialog : MatDialog,
    public prj: ProjectManagerService,
    private data: DataService,
    private ws: WebsocketService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.subscriptions.push(this.prj.currProject.subscribe(proj=>{
      if (proj) {
        this.currProject = proj;
        this.zone.run(()=>{
          this.refreshData();
        });
      } else {
        this.nestedDataSource._data.next(null);
        this.nestedTreeControl.dataNodes = [];
      }
    }));
    this.subscriptions.push(this.prj.onAppStatusChange.subscribe(stat=>{
      if (this.service.mode === null || this.prj.activeProject && disableWhenProjectActive.includes(this.service.mode.toUpperCase()))
        this.service.mode = 'editor';
    }));
    this.subscriptions.push(this.prj.onExpand.subscribe(name=>{
      const appsNode = this.nestedDataSource.data[0];
      this.nestedTreeControl.expand(appsNode);
    }));
    this.subscriptions.push(this.prj.onExpandLib.subscribe((ret:{app:string,lib:string})=>{
      const appsNode = this.nestedDataSource.data[0];
      for (let app of appsNode.children) {
        if (app.name === ret.app) {
          this.nestedTreeControl.expand(appsNode);
          this.nestedTreeControl.expandDescendants(app);
          return;
        }
      }
    }));
  }
  
  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
  
  isNodeDisabled(node:TreeNode) {
    if (!this.prj.activeProject)
      return false;
    if (disableWhenProjectActive.includes(node.type.toUpperCase()))
      return true;
    return false;
  }
  
  getStatusString(stat: number) {
    return getStatusString(stat);
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
  
  runApp(app:string) {
    this.ws.query('?tp_run_app("' + this.currProject.name + '","' + app + '")');
  }
  
  openFile(n:TreeNode) {
    if (this.isNodeDisabled(n))
      return;
    if (this.service.isDirty && this.service.activeFile) {
      this.dialog.open(YesNoDialogComponent,{
        data: {
          title: 'File has changed',
          msg: 'Do you want to save your changes to "' + this.service.activeFile + '"?',
          yes: 'SAVE',
          no: 'DISCARD'
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
    }
    const projName = this.currProject.name;
    if (n.type !== 'File')
      this.service.close();
    if (n.type === 'Data') {
      this.ws.query('?tp_set_application("' + n.parent.name + '")')
      .then(()=>{
        return this.data.refreshDomains();
      }).then(()=>{
        this.service.mode = 'data';
      });
      return;
    }
    if (n.type === 'Settings') {
      this.service.mode = 'settings';
      return;
    }
    if (n.type === 'Frames') {
      this.service.mode = 'frames';
      return;
    }
    if (n.type === 'Pallets') {
      this.service.mode = 'pallets';
      return;
    }
    if (n.type === 'Grippers') {
      this.service.mode = 'grippers';
      return;
    }
    if (n.type === 'Vision') {
      this.service.mode = 'vision';
      return;
    }
    if (n.type === 'Conveyor') {
      this.service.mode = 'conveyor';
      return;
    }
    if (n.type === 'Errors') {
      this.service.mode = 'errors';
      return;
    }
    if (n.type === 'Macros') {
      this.service.mode = 'macros';
      return;
    }
    if (n.type === 'IO') {
      this.service.mode = 'io';
      return;
    }
    if (n.type === 'Payloads') {
      this.service.mode = 'payloads';
      return;
    }
    this.service.mode = 'editor';
    setTimeout(()=>{
      this.service.dragEnd.emit();
    },200);
    let path:string;
    if (n.type === 'File') {
      path = projName + '/' + n.parent.name + '/';
      this.service.setFile(n.parent.name + '.UPG', path, n.ref);
    } else if (n.type === 'Library') {
      const appName = n.parent.parent.name;
      path = projName + '/' + appName + '/LIBS/';
      this.service.setFile(n.name + '.ULB',path, n.ref);
    }
  }
  
  newApp() {
    this.menuVisible = false;
    this.dialog.open(NewAppDialogComponent);
  }
  
  newLib(appName?: string) {
    const app = appName || this.lastSelectedNode.parent.name;
    this.menuVisible = false;
    this.dialog.open(NewLibDialogComponent,{
      data: app
    });
  }
  
  deleteApp(app:string) {
    this.menuVisible = false;
    this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'DELETE ' + app + '?',
        msg: 'This operation cannot be undone, and will remove this application with all its data and libraries. Are you sure you wish to delete it?',
        yes: 'DELETE',
        no: 'CANCEL'
      },
      width: '500px'
    }).afterClosed().subscribe(ret=>{
      if (ret) {
        const prj = this.prj.currProject.value.name;
        this.ws.query('?prj_remove_app("' + prj + '","' + app + '")').then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.data.refreshDomains().then(()=>this.prj.getCurrentProject())
            .then(ret=>{
              this.prj.onExpand.emit();
            });
          }
        });
      }
    });
  }
  
  deleteLib() {
    this.menuVisible = false;
    const lib = this.lastSelectedNode.name;
    this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Delete Library ' + lib + '?',
        msg: 'This operation cannot be undone. Are you sure you wish to delete it?',
        yes: 'DELETE',
        no: 'CANCEL'
      },
      width: '500px'
    }).afterClosed().subscribe(ret=>{
      if (ret) {
        const prj = this.prj.currProject.value.name;
        const app = this.lastSelectedNode.parent.parent.name;
        const cmd = '?prj_remove_app_library("' + prj + '","' + app + '","' + 
                    lib + '")';
        this.ws.query(cmd).then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.prj.getCurrentProject().then(ret=>{
              this.prj.onExpandLib.emit({app: app, lib: null});
            });
          }
        });
      }
    });
  }
  
  openContextMenu(event:MouseEvent, node: TreeNode) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.selectNode(node);
    switch (node.type) {
      case 'Apps':
      case 'App':
      case 'Libraries':
      case 'Library':
        break;
      default:
        return;
    }
    this.menuLeft = event.pageX + 5 + 'px';
    this.menuTop = event.pageY + 5 + 'px';
    this.menuVisible = true;
  }
  
  closeContextMenu() {
    this.menuVisible = false;
  }
  
  refreshData() {
    let data : TreeNode[] = [];
    const p = this.currProject;
    let apps = new TreeNode('Apps', 'Apps', p.name,null);
    for (let app of p.apps) {
      let appNode = new TreeNode(app.name, 'App', p.name,apps);
      appNode.ref = app;
      let libsNode = new TreeNode('Libraries','Libraries',p.name,appNode);
      for (let lib of app.libs) {
        libsNode.children.push(new TreeNode(lib,'Library',p.name,libsNode));
      }
      let prgNode = new TreeNode('Program','File',p.name,appNode);
      prgNode.ref = app;
      appNode.children.push(prgNode);
      appNode.children.push(new TreeNode('Data','Data',p.name,appNode));
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
    let frames = new TreeNode('Motion Frames', 'Frames', p.name,null);
    let pallets = new TreeNode('Palletizing', 'Pallets', p.name,null);
    let grippers = new TreeNode('Grippers', 'Grippers', p.name,null);
    let io = new TreeNode('I/O Mapping', 'IO', p.name,null);
    let vision = new TreeNode('Vision', 'Vision', p.name,null);
    let conveyor = new TreeNode('Conveyor Tracking', 'Conveyor', p.name,null);
    let payloads = new TreeNode('Payloads', 'Payloads', p.name,null);
    data.push(apps);
    data.push(deps);
    data.push(settings);
    data.push(frames);
    data.push(pallets);
    data.push(grippers);
    data.push(io);
    data.push(payloads);
    data.push(errors);
    data.push(macros);
    data.push(vision);
    data.push(conveyor);
    this.nestedDataSource._data.next(data);
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
  ref: any = null; /* REFERENCE TO AN APP, LIB, ETC... */
  
  constructor(name:string,typeStr:string,projectNameRef:string, parent:TreeNode) {
    this.name = name;
    this.type = typeStr;
    this.projectNameRef = projectNameRef;
    this.parent = parent
  }
}