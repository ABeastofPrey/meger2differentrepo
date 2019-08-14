import { Component, OnInit, ViewChild } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource, MatDialog } from '@angular/material';
import { of as observableOf, Subscription } from 'rxjs';
import {
  ProgramEditorService
} from '../../services/program-editor.service';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {
  MCFile,
  ProjectManagerService,
  DataService,
  WebsocketService,
  MCQueryResponse,
  LoginService,
} from '../../../core';
import { MCProject } from '../../../core/models/project/mc-project.model';
import { ElementRef } from '@angular/core';
import { NewAppDialogComponent } from '../toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import { NewLibDialogComponent } from '../toolbar-dialogs/new-lib-dialog/new-lib-dialog.component';
import { NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SingleInputDialogComponent } from '../../../../components/single-input-dialog/single-input-dialog.component';
import { CdkDragDrop, moveItemInArray, DragDrop } from '@angular/cdk/drag-drop';
import { CommonService } from '../../../core/services/common.service';
import {NewDependencyDialogComponent} from '../toolbar-dialogs/new-dependency-dialog/new-dependency-dialog.component';

export const projectPoints = 'pPoints';

const leafTypes = [
  'File',
  'Data',
  'Library',
  'Macros',
  'Settings',
  projectPoints,
  'Errors',
  'Dependency',
  'Frames',
  'Pallets',
  'Grippers',
  'Vision',
  'Conveyor',
  'IO',
  'Payloads',
  'BG'
];
const disableWhenProjectActive = [
  'DATA',
  'MACROS',
  'SETTINGS',
  'ERRORS',
  'FRAMES',
  'PALLETS',
  'GRIPPERS',
  'PAYLOADS',
  projectPoints.toUpperCase(),
];

class TreeNode {
  name: string;
  type: string;
  children: TreeNode[] = [];
  projectNameRef: string;
  parent: TreeNode;
  ref: any = null; /* REFERENCE TO AN APP, LIB, ETC... */

  constructor(
    name: string,
    typeStr: string,
    projectNameRef: string,
    parent: TreeNode
  ) {
    this.name = name;
    this.type = typeStr;
    this.projectNameRef = projectNameRef;
    this.parent = parent;
  }
}

@Component({
  selector: 'program-editor-side-menu',
  templateUrl: './program-editor-side-menu.component.html',
  styleUrls: ['./program-editor-side-menu.component.css'],
})
export class ProgramEditorSideMenuComponent implements OnInit {
  @ViewChild('menu', { static: false }) menu: ElementRef;

  nestedTreeControl: NestedTreeControl<TreeNode>;
  nestedDataSource: MatTreeNestedDataSource<TreeNode>;
  lastSelectedNode: TreeNode = null;
  lastSelectedFile: MCFile = null;
  currProject: MCProject = null;
  menuVisible: boolean = false;
  menuLeft: string = '0';
  menuTop: string = '0';

  public bgtCount = 0;
  public projectPoints = projectPoints;
  private _getChildren = (node: TreeNode) => {
    return observableOf(node.children);
  };
  private subscriptions: Subscription[] = [];
  private words: any;
  private lastDragIndex: number = -1;

  constructor(
    public service: ProgramEditorService,
    private dialog: MatDialog,
    public prj: ProjectManagerService,
    private data: DataService,
    private ws: WebsocketService,
    private zone: NgZone,
    private trn: TranslateService,
    private dd: DragDrop,
    private login: LoginService,
    private cmn: CommonService
  ) {
    this.trn
      .get([
        'projectTree.dirty',
        'button.discard',
        'button.save',
        'button.delete',
        'button.cancel',
        'projectTree.del_app_msg',
        'projectTree.del_lib_msg',
        'projectTree.del_dep_msg',
        'projects.toolbar.rename',
        'projects.toolbar.app_name',
        'button.rename',
        'projects.toolbar.save_as',
        'projectTree.del_bg_msg',
        'projects.toolbar.task_name',
      ])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.subscriptions.push(
      this.prj.currProject.subscribe(proj => {
        if (proj) {
          this.currProject = proj;
          this.zone.run(() => {
            this.refreshData();
          });
        } else {
          this.currProject = null;
          this.nestedDataSource._data.next(null);
          this.nestedTreeControl.dataNodes = [];
        }
      })
    );
    this.subscriptions.push(
      this.prj.onAppStatusChange.subscribe(stat => {
        if (
          this.service.mode === null ||
          (this.prj.activeProject &&
            disableWhenProjectActive.includes(this.service.mode.toUpperCase()))
        )
          this.service.mode = 'editor';
      })
    );
    this.subscriptions.push(
      this.prj.onExpand.subscribe((expandNodeIndex = 0) => {
        const appsNode = this.nestedDataSource.data[expandNodeIndex];
        this.nestedTreeControl.expand(appsNode);
      })
    );
    this.subscriptions.push(
      this.prj.onExpandDep.subscribe(name => {
        const depsNode = this.nestedDataSource.data[1];
        this.nestedTreeControl.expand(depsNode);
      })
    );
    this.subscriptions.push(
      this.prj.onExpandLib.subscribe((ret: { app: string; lib: string }) => {
        const appsNode = this.nestedDataSource.data[0];
        for (let app of appsNode.children) {
          if (app.name === ret.app) {
            this.nestedTreeControl.expand(appsNode);
            this.nestedTreeControl.expandDescendants(app);
            return;
          }
        }
      })
    );
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    let data = this.nestedDataSource.data;
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.nestedDataSource._data.next(data);
  }

  isNodeDisabled(node: TreeNode) {
    if (!this.prj.activeProject) return false;
    if (disableWhenProjectActive.includes(node.type.toUpperCase())) return true;
    return false;
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

  runApp(app: string, isBG = false) {
    const cmd = isBG ? `BKG_runProgram("${this.currProject.name}", "${app}", ".BKG")` :
    '?tp_run_app("' + this.currProject.name + '","' + app + '")';
    this.ws.query(cmd).then((res: MCQueryResponse) => {
      if (res.err) {
        console.warn(res.err);
      }
    });
  }

  openFile(n: TreeNode) {
    if (this.isNodeDisabled(n)) return;
    if (this.service.isDirty && this.service.activeFile) {
      this.trn
        .get('projectTree.dirty_msg', { name: this.service.activeFile })
        .subscribe(word => {
          this.dialog
            .open(YesNoDialogComponent, {
              data: {
                title: this.words['projectTree.dirty'],
                msg: word,
                yes: this.words['button.save'],
                no: this.words['button.discard'],
              },
              width: '500px',
            })
            .afterClosed()
            .subscribe(ret => {
              if (ret) {
                this.service.save().then(() => {
                  this.openFile(n);
                });
              } else {
                this.service.isDirty = false;
                this.openFile(n);
              }
            });
        });
      return;
    }
    const projName = this.currProject.name;
    if (n.type !== 'File' && n.type !== 'Dependency') this.service.close();
    if (n.type === 'Data') {
      if (this.data.selectedDomain === n.parent.name) {
        this.service.mode = 'data';
        return;
      }
      this.service.busy = true;
      this.ws
        .query('?tp_set_application("' + n.parent.name + '")')
        .then(() => {
          return this.data.refreshDomains();
        })
        .then(() => {
          this.service.mode = 'data';
          this.service.busy = false;
        });
      return;
    }
    if (n.type === 'Settings') {
      this.service.mode = 'settings';
      return;
    }
    if (n.type === projectPoints) {
      this.service.mode = projectPoints;
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
    setTimeout(() => {
      this.service.dragEnd.emit();
    }, 200);
    let path: string;
    if (n.type === 'File') {
      path = projName + '/' + n.parent.name + '/';
      this.service.setFile(n.parent.name + '.UPG', path, n.ref, -1);
    } else if (n.type === 'Library') {
      const appName = n.parent.parent.name;
      path = projName + '/' + appName + '/LIBS/';
      this.service.setFile(n.name + '.ULB', path, n.ref, -1);
    } else if (n.type === 'BG') {
      path = projName + '/BKG/';
      this.service.setFile(n.name + '.BKG', path, n.ref, -1);
    } else if (n.type === 'Dependency') {
      path = projName + '/DEPENDENCIES/';
      this.service.setFile(n.name, path,n.ref, -1);
    }
  }

  newApp() {
    this.menuVisible = false;
    this.dialog.open(NewAppDialogComponent, {
      data: {
        title: 'projects.toolbar.new_app',
        placeholder: 'projects.toolbar.app_name'
      }
    });
  }
  newDep() {
    this.menuVisible = false;
    this.dialog.open(NewDependencyDialogComponent);
  }
  
  toggleDependencies() {
    const prj = this.prj.currProject.value;
    const loaded = prj.dependenciesLoaded;
    const name = prj.name;
    const cmd = loaded ? 'PRJ_UNLOAD_DEPENDENCIES' : 'PRJ_LOAD_DEPENDENCIES';
    this.ws.query('call ' + cmd + '("' + name + '")');
  }

  newLib(appName?: string) {
    const app = appName || this.lastSelectedNode.parent.name;
    this.menuVisible = false;
    this.dialog.open(NewLibDialogComponent, {
      data: app,
    });
  }

  deleteApp(app: string, isBG = false) {
    this.menuVisible = false;
    const title = isBG ? 'projectTree.del_bg_title' : 'projectTree.del_app_title';
    const msg = isBG ? 'projectTree.del_bg_msg' : 'projectTree.del_app_msg';
    this.trn.get(title, { name: app }).subscribe(word => {
      this.dialog
        .open(YesNoDialogComponent, {
          data: {
            title: word,
            msg: this.words[msg],
            yes: this.words['button.delete'],
            no: this.words['button.cancel'],
          },
          width: '500px',
        })
        .afterClosed()
        .subscribe(ret => {
          if (ret) {
            const prj = this.prj.currProject.value;
            const cmd = isBG ? `BKG_removeBgTask("${prj.name}", "${app}")` : '?prj_remove_app("' + prj.name + '","' + app + '")';
            this.ws
              .query(cmd)
              .then((ret: MCQueryResponse) => {
                if ((!isBG && ret.result === '0') || (isBG && !ret.err)) {
                  this.data
                    .refreshDomains()
                    .then(() => this.prj.refreshAppList(prj, true))
                    .then(ret => {
                      this.prj.onExpand.emit(isBG ? 1 : 0);
                    });
                }
              });
          }
        });
    });
  }

  renameApp(app: string, isBG = false) {
    const ph = isBG ? 'projects.toolbar.task_name' : 'projects.toolbar.app_name';
    this.dialog.open(SingleInputDialogComponent, {
        data: {
          icon: 'edit',
          title: this.words['projects.toolbar.rename'] + ' ' + app,
          placeholder: this.words[ph],
          accept: this.words['button.rename'],
        },
      }).afterClosed().subscribe((name: string) => {
        if (name) {
          name = name.toUpperCase();
          const prj = this.prj.currProject.value;
          const cmd = isBG ? `BKG_renameBgTask("${prj.name}", "${app}", "${name}")`
          : `?prj_rename_application("${prj.name}","${app}","${name}")`;
          this.ws.query(cmd).then((ret: MCQueryResponse) => {
            if (!isBG && (ret.err || ret.result !== '0') || (isBG && ret.err)) {
              return;
            }
            this.service.close();
            this.service.mode = null;
            this.prj.refreshAppList(prj, true);
          });
        }
      });
  }

  saveAppAs(app: string, isBG = false) {
    const ph = isBG ? 'projects.toolbar.task_name' : 'projects.toolbar.app_name';
    this.dialog
      .open(SingleInputDialogComponent, {
        data: {
          icon: 'save',
          title: app + ' - ' + this.words['projects.toolbar.save_as'] + '...',
          placeholder: this.words[ph],
          accept: this.words['button.save'],
        },
      })
      .afterClosed()
      .subscribe((name: string) => {
        if (name) {
          name = name.toUpperCase();
          const prj = this.prj.currProject.value;
          const cmd = isBG ? `BKG_saveAsBgTask("${prj.name}", "${app}", "${name}")` :
           '?prj_save_application_as("' + prj.name + '","' + app + '","' + name + '")';
          this.ws.query(cmd).then((ret: MCQueryResponse) => {
            if ((!isBG && (ret.err || ret.result !== '0')) || (isBG && ret.err)) {
              console.warn(ret.err);
              return;
            }
            this.service.close();
            this.prj.refreshAppList(prj, true).then(() => {
              const path = prj.name + '/' + name + '/';
              this.service.setFile(name + '.UPG', path, null, -1);
            });
          });
        }
      });
  }

  deleteLib() {
    this.menuVisible = false;
    const lib = this.lastSelectedNode.name;
    this.trn.get('projectTree.del_lib_title', { name: lib }).subscribe(word => {
      this.dialog
        .open(YesNoDialogComponent, {
          data: {
            title: word,
            msg: this.words['projectTree.del_lib_msg'],
            yes: this.words['button.delete'],
            no: this.words['button.cancel'],
          },
          width: '500px',
        })
        .afterClosed()
        .subscribe(ret => {
          if (ret) {
            const prj = this.prj.currProject.value;
            const app = this.lastSelectedNode.parent.parent.name;
            const cmd =
              '?prj_remove_app_library("' +
              prj.name +
              '","' +
              app +
              '","' +
              lib +
              '")';
            this.ws.query(cmd).then((ret: MCQueryResponse) => {
              if (ret.result === '0') {
                this.prj.refreshAppList(prj, true).then(ret => {
                  this.prj.onExpandLib.emit({ app: app, lib: null });
                });
              }
            });
          }
        });
    });
  }
  
  deleteDep() {
    this.menuVisible = false;
    const dep = this.lastSelectedNode.name;
    this.trn.get('projectTree.del_dep_title', { name: dep }).subscribe(word => {
      this.dialog
        .open(YesNoDialogComponent, {
          data: {
            title: word,
            msg: this.words['projectTree.del_dep_msg'],
            yes: this.words['button.delete'],
            no: this.words['button.cancel'],
            warnBtn: true
          },
          width: '500px',
        })
        .afterClosed()
        .subscribe(ret => {
          if (ret) {
            const prj = this.prj.currProject.value;
            const cmd =
              '?prj_delete_dependency("' +
              prj.name +
              '","USER","' +
              dep +
              '")';
            this.ws.query(cmd).then((ret: MCQueryResponse) => {
              if (ret.result === '0') {
                this.prj.refreshDependencies(prj).then(ret => {
                  this.prj.currProject.next(prj);
                  this.prj.onExpandDep.emit(dep);
                });
              }
            });
          }
        });
    });
  }

  openContextMenu(event: MouseEvent, node: TreeNode) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.selectNode(node);
    switch (node.type) {
      case 'Apps':
      case 'App':
      case 'Libraries':
      case 'Library':
      case 'Auxiliary':
      case 'BG':
      case 'Dependency':
      case 'Dependencies':
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
    let data: TreeNode[] = [];
    const p = this.currProject;
    let apps = new TreeNode('', 'Apps', p.name, null);
    for (let app of p.apps) {
      let appNode = new TreeNode(app.name, 'App', p.name, apps);
      appNode.ref = app;
      let libsNode = new TreeNode('', 'Libraries', p.name, appNode);
      for (let lib of app.libs) {
        libsNode.children.push(new TreeNode(lib, 'Library', p.name, libsNode));
      }
      let prgNode = new TreeNode('', 'File', p.name, appNode);
      prgNode.ref = app;
      appNode.children.push(prgNode);
      if (!this.login.isOperator && !this.login.isViewer) {
        appNode.children.push(new TreeNode('', 'Data', p.name, appNode));
        appNode.children.push(libsNode);
      }
      apps.children.push(appNode);
    }
    apps.children = apps.children.sort((n1, n2) => {
      return n1.name < n2.name ? -1 : 1;
    });
    let deps = new TreeNode('', 'Dependencies', p.name, null);
    for (let dep of p.dependencies) {
      deps.children.push(new TreeNode(dep, 'Dependency', p.name, deps));
    }
    let macros = new TreeNode('', 'Macros', p.name, null);
    let settings = new TreeNode('', 'Settings', p.name, null);
    let pPoints = new TreeNode('', projectPoints, p.name, null);
    let errors = new TreeNode('', 'Errors', p.name, null);
    let frames = new TreeNode('', 'Frames', p.name, null);
    let pallets = new TreeNode('', 'Pallets', p.name, null);
    let grippers = new TreeNode('', 'Grippers', p.name, null);
    let io = new TreeNode('', 'IO', p.name, null);
    let vision = new TreeNode('', 'Vision', p.name, null);
    let conveyor = new TreeNode('', 'Conveyor', p.name, null);
    let payloads = new TreeNode('', 'Payloads', p.name, null);
    // Auxiliary node
    const auxiliaryNode = new TreeNode('', 'Auxiliary', p.name, null);
    p.backgroundTaskList.forEach(item => {
      const prgNode = new TreeNode(item, 'BG', p.name, auxiliaryNode);
      auxiliaryNode.children.push(prgNode);
    });
    this.bgtCount = p.backgroundTaskList.length;

    data.push(apps);
    data.push(auxiliaryNode);
    data.push(deps);
    if (!this.login.isOperator && !this.login.isViewer) {
      data.push(settings);
      data.push(pPoints);
      data.push(frames);
      data.push(pallets);
    }
    if (!this.login.isViewer) {
      data.push(grippers);
      data.push(io);
      data.push(payloads);
    }
    /*data.push(errors);
      data.push(macros);
      data.push(vision);
      data.push(conveyor);*/
    this.nestedDataSource._data.next(data);
    if (!this.cmn.isTablet) this.setDragAndDrop();
  }

  hasNestedChild = (_: number, nodeData: TreeNode) => {
    return nodeData && !leafTypes.includes(nodeData.type);
  }

  public newBackgroundTask(): void {
    this.menuVisible = false;
    this.dialog.open(NewAppDialogComponent, {
      data: {
        title: 'projects.toolbar.new_bg_task',
        placeholder: 'projects.toolbar.new_bg_task_name',
        newBackgroundTask: true
      }
    });
  }

  private setDragAndDrop() {
    setTimeout(() => {
      let appsElement = document.getElementById('Apps-ul');
      if (appsElement) {
        let list = this.dd.createDropList(appsElement);
        list.lockAxis = 'y';
        list.withOrientation('vertical');
        list.sortingDisabled = false;
        let data = this.nestedDataSource.data;
        list.dropped.subscribe(e => {
          let data = this.nestedDataSource.data;
          data[0].children.splice(
            e.currentIndex,
            0,
            data[0].children.splice(e.previousIndex, 1)[0]
          );
          this.nestedDataSource.data = null;
          this.nestedDataSource.data = data;
          this.setDragAndDrop();
        });
        let dragRefs = [];
        for (let app of data[0].children) {
          let e = document.getElementById('App-' + app.name);
          if (e) {
            let ref = this.dd.createDrag(e);
            ref.data = app.name;
            dragRefs.push(ref);
          }
        }
        list.withItems(dragRefs);
      }
    }, 200);
  }
}
