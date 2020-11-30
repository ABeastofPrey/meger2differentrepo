import { SysLogSnackBarService } from './../../../../../sys-log/services/sys-log-snack-bar.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  DataService,
  WebsocketService,
  MCQueryResponse,
  ProjectManagerService,
  ApiService,
} from '../../../../../core';
import { IoModule } from '../../../../../core/models/io/io-module.model';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Io } from '../../../../../core/models/io/io.model';
import { NgZone, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {UpdateDialogComponent} from '../../../../../../components/update-dialog/update-dialog.component';
import {YesNoDialogComponent} from '../../../../../../components/yes-no-dialog/yes-no-dialog.component';
import { UtilsService } from '../../../../../../../app/modules/core/services/utils.service';
import { Subject } from 'rxjs';

export class TreeNode {
  children: TreeNode[] = [];
  name: string;
  module: IoModule;
  isModuleNode: boolean;

  constructor(name: string, io: IoModule, isModule: boolean) {
    this.name = name;
    this.module = io;
    if (isModule) {
      this.children = [
        new TreeNode('ios.inputs', io, false),
        new TreeNode('ios.outputs', io, false),
      ];
    }
  }
}

@Component({
  selector: 'io-mapping',
  templateUrl: './io-mapping-screen.component.html',
  styleUrls: ['./io-mapping-screen.component.css'],
})
export class IoMappingScreenComponent implements OnInit {

  /* TREE VARIABLES */
  treeControl: NestedTreeControl<TreeNode>;
  dataSource: MatTreeNestedDataSource<TreeNode>;

  /* Current mapping variables */
  activeModule: ActiveModule = null;

  /* Data interval */
  private interval: number = null;

  private words: {};
  private notifier: Subject<boolean> = new Subject();
  private changeNodeEvent: EventEmitter<TreeNode> = new EventEmitter<TreeNode>();

  constructor(
    private data: DataService,
    private ws: WebsocketService,
    private zone: NgZone,
    private ref: ChangeDetectorRef,
    public prj: ProjectManagerService,
    private trn: TranslateService,
    private dialog: MatDialog,
    private api: ApiService,
    public utils: UtilsService,
    private snackbarService: SysLogSnackBarService
  ) {
    this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.trn.get(['changeOK', 'changeError', 'ios.updating','ios.updating_confirm','button.cancel','button.update']).subscribe(words => {
      this.words = words;
    });
  }

  ngOnInit() {
    this.data.dataLoaded.pipe(takeUntil(this.notifier)).subscribe(stat=>{
      if (!stat) return;
      this.zone.run(()=>{
        this.dataSource.data = this.buildTree();
      });
      this.changeNodeEvent.pipe(debounceTime(500)).subscribe(node => {
        this.changeNode(node);
      })
    });
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  private buildTree(): TreeNode[] {
    const data: TreeNode[] = [];
    const modules = this.data.ioModules;
    for (const m of modules) {
      data.push(new TreeNode(m.name, m, true));
    }
    return data;
  }

  private changeNode(n: TreeNode): void {
    this.activeModule = {
      io: n.module,
      showInputs: n.name === 'ios.inputs',
    };
    // // Check need to get range info or not.
    // if (this.interval !== null) {
    //   if (this.activeModule.showInputs && this.activeModule.io.inputs.length !== 0) {
    //     return;
    //   }
    //   if (!this.activeModule.showInputs && this.activeModule.io.outputs.length !== 0) {
    //     return;
    //   }
    // };

    // GET INITIAL RANGE INFO
    this.getRangeInfo().then(() => {
      this.startDataRefreshInterval();
    });
  }

  selectNode(n: TreeNode) {
    this.changeNodeEvent.emit(n);
  }

  getRangeInfo() {
    const cmd = '?iomap_get_range_info(';
    return Promise.resolve()
      .then(() => {
        if (this.activeModule.showInputs) {
          const start = this.activeModule.io.firstInput;
          const end = this.activeModule.io.lastInput;
          return this.ws.query(cmd + 1 + ',' + start + ',' + end + ')');
        } else {
          const start = this.activeModule.io.firstOutput;
          const end = this.activeModule.io.lastOutput;
          return this.ws.query(cmd + 0 + ',' + start + ',' + end + ')');
        }
      })
      .then((ret: MCQueryResponse) => {
        if (this.activeModule.showInputs) {
          this.activeModule.io.setInputs(ret.result);
        }
        else this.activeModule.io.setOutputs(ret.result);
      });
  }

  toggleSimulated(e: MatSlideToggleChange, io: Io) {
    const newVal = e.checked ? 1 : 0;
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws
      .query(
        '?iomap_set_info(' + ioType + ',' + io.id + ',"sim","' + newVal + '")'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0') e.source.checked = !e.source.checked;
        else io.simulated = !io.simulated;
      });
  }

  updateName(e: {target: {value: string}}, io: Io) {
    const newVal = e.target.value;
    if(!newVal) {
        return;
    }
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws
      .query(
        '?iomap_set_info(' + ioType + ',' + io.id + ',"name","' + newVal + '")'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0') {
          e.target.value = io.name;
          this.snackbarService.openTipSnackBar(this.words['changeError']);

        } else {
          io.name = newVal;
          this.snackbarService.openTipSnackBar('changeOK');
          }
      });
  }

  updateDescription(e: {target: {value: string}}, io: Io) {
    const newVal = e.target.value;
    if(!newVal) {
        return;
    }
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws
      .query(
        '?iomap_set_info(' + ioType + ',' + io.id + ',"desc","' + newVal + '")'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0') {
          e.target.value = io.description;
          this.snackbarService.openTipSnackBar(this.words['changeError']);
        } else {
          io.description = newVal;
          this.snackbarService.openTipSnackBar('changeOK');
          }
      });
  }

  refresh() {
    this.dialog.open(YesNoDialogComponent, {
      disableClose: true,
      data: {
        title: this.words['ios.updating'],
        msg: this.words['ios.updating_confirm'],
        yes: this.words['button.update'],
        no: this.words['button.cancel'],
      },
      maxWidth: '400px'
    }).afterClosed().subscribe(ret => {
      if (!ret) return;
      clearInterval(this.interval);
      this.dialog.open(UpdateDialogComponent, {
        disableClose: true,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        closeOnNavigation: false,
        data: this.words['ios.updating'],
        id: 'update',
      });
      this.ws.updateFirmwareMode = true;
      this.ws.query('?iomap_remap'); // ALSO REBOOTS MC!
      setTimeout(() => {
        let ok = false;
        const interval = setInterval(() => {
          if (ok) return;
          this.api.getFile('isWebServerAlive.HTML').then(ret => {
            if (ok) return;
            ok = true;
            clearInterval(interval);
            const URL = window.location.href;
            const i = URL.indexOf('?');
            const finalURL = i === -1 ? URL : URL.substring(0,i);
            const newURL = finalURL + '?from=io';
            console.log(newURL);
            window.location.href = newURL;
          }).catch(err => {

          });
        }, 2000);
      }, 10000);
    });
  }

  private cachedIOs: string = '';

  startDataRefreshInterval() {
    if (this.interval) clearInterval(this.interval);
    this.zone.runOutsideAngular(() => {
      this.interval = window.setInterval(() => {
        const ioType = this.activeModule.showInputs ? 1 : 0;
        let start, end;
        if (this.activeModule.showInputs) {
          start = this.activeModule.io.firstInput;
          end = this.activeModule.io.lastInput;
        } else {
          start = this.activeModule.io.firstOutput;
          end = this.activeModule.io.lastOutput;
        }
        this.ws
          .query('cyc5,' + ioType + ',' + start + ',' + end)
          .then((ret: MCQueryResponse) => {
            // Check whether io was changed so that we need to re-render the screen or not.
            if (ret.result === this.cachedIOs) return;
            this.cachedIOs = ret.result;
            const parts = ret.result.split(';');
            if (ioType === 1) {
              for (let i = 0; i < parts.length; i++) {
                if (parts[i].length === 0) continue;
                const innerparts = parts[i].split(',');
                this.activeModule.io.inputs[i].value = innerparts[1] === '1';
              }
            } else {
              for (let i = 0; i < parts.length; i++) {
                if (parts[i].length === 0) continue;
                const innerparts = parts[i].split(',');
                this.activeModule.io.outputs[i].value = innerparts[1] === '1';
              }
            }
            this.ref.detectChanges();
          });
      }, !this.utils.isTablet ? 200 : 1000);
    });
  }

  toggleValue(e: MatSlideToggleChange, io: Io) {
    const newVal = e.checked ? 1 : 0;
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws
      .query(
        '?iomap_set_info(' + ioType + ',' + io.id + ',"VALUE","' + newVal + '")'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0') {
          e.source.checked = !e.source.checked;
        } else {
          io.value = e.checked;
        }
      });
  }

  hasNestedChild = (_: number, nodeData: TreeNode) =>
    nodeData.children.length > 0;

  private _getChildren = (node: TreeNode) => node.children;
}

interface ActiveModule {
  io: IoModule;
  showInputs: boolean;
}
