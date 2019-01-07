import { Component, OnInit } from '@angular/core';
import {DataService, WebsocketService, MCQueryResponse, ProjectManagerService} from '../../../../../core';
import {IoModule} from '../../../../../core/models/io/io-module.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource, MatSlideToggleChange, MatSnackBar} from '@angular/material';
import {Io} from '../../../../../core/models/io/io.model';
import {NgZone} from '@angular/core';
import {ApplicationRef} from '@angular/core';

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
        new TreeNode('Inputs',io,false),
        new TreeNode('Outputs',io,false)
      ];
    }
  }
  
}

@Component({
  selector: 'io-mapping',
  templateUrl: './io-mapping-screen.component.html',
  styleUrls: ['./io-mapping-screen.component.css']
})
export class IoMappingScreenComponent implements OnInit {
  
  
  /* TREE VARIABLES */
  treeControl: NestedTreeControl<TreeNode>;
  dataSource: MatTreeNestedDataSource<TreeNode>;
  
  /* Current mapping variables */
  activeModule: ActiveModule = null;
  
  /* Data interval */
  private interval: any = null;

  constructor(
    private data: DataService,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private zone: NgZone,
    private ref: ApplicationRef,
    public prj: ProjectManagerService,
  ) {
    this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
    this.dataSource.data = this.buildTree();
  }
  
  ngOnDestroy() {
    if (this.interval)
      clearInterval(this.interval);
  }
  
  private buildTree() : TreeNode[] {
    let data : TreeNode[] = [];
    const modules = this.data.ioModules;
    for (let m of modules) {
      data.push(new TreeNode(m.name,m,true));
    }
    return data;
  }
  
  selectNode(n: TreeNode) {
    this.activeModule = {
      io: n.module,
      showInputs: n.name === 'Inputs'
    };
    // GET INITIAL RANGE INFO
    this.getRangeInfo().then(()=>{
      this.startDataRefreshInterval();
    });
  }
  
  getRangeInfo() {
    const cmd = '?iomap_get_range_info(';
    return Promise.resolve().then(()=>{
      if (this.activeModule.showInputs) {
        const start = this.activeModule.io.firstInput;
        const end = this.activeModule.io.lastInput;
        return this.ws.query(cmd + 1 + ',' + start + ',' + end + ')');
      } else {
        const start = this.activeModule.io.firstOutput;
        const end = this.activeModule.io.lastOutput;
        return this.ws.query(cmd + 0 + ',' + start + ',' + end + ')');
      }
    }).then((ret:MCQueryResponse)=>{
      if (this.activeModule.showInputs)
        this.activeModule.io.setInputs(ret.result);
      else
        this.activeModule.io.setOutputs(ret.result);
    });
  }
  
  toggleSimulated(e:MatSlideToggleChange, io: Io) {
    const newVal = e.checked ? 1 : 0;
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws.query('?iomap_set_info('+ioType+','+io.id+',"sim","'+newVal+'")')
    .then((ret: MCQueryResponse)=>{
      if (ret.result !== '0')
        e.source.checked = !e.source.checked;
      else
        io.simulated = !io.simulated;
    });
  }
  
  updateName(e:any, io:Io) {
    const newVal = e.target.value;
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws.query('?iomap_set_info('+ioType+','+io.id+',"name","'+newVal+'")')
    .then((ret: MCQueryResponse)=>{
      if (ret.result !== '0') {
        e.target.value = io.name;
        this.snack.open('An error occured, changes not saved','',{duration:2000});
      } else {
        io.name = newVal;
        this.snack.open('Changed saved','',{duration:1000});
      }
    });
  }
  
  updateDescription(e:any, io:Io) {
    const newVal = e.target.value;
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws.query('?iomap_set_info('+ioType+','+io.id+',"desc","'+newVal+'")')
    .then((ret: MCQueryResponse)=>{
      if (ret.result !== '0') {
        e.target.value = io.description;
        this.snack.open('An error occured, changes not saved','',{duration:2000});
      } else {
        io.description = newVal;
        this.snack.open('Changed saved','',{duration:1000});
      }
    });
  }
  
  startDataRefreshInterval() {
    if (this.interval)
      clearInterval(this.interval);
    this.zone.runOutsideAngular(()=>{
      this.interval = setInterval(()=>{
        const ioType = this.activeModule.showInputs ? 1 : 0;
        let start, end;
        if (this.activeModule.showInputs) {
          start = this.activeModule.io.firstInput;
          end = this.activeModule.io.lastInput;
        } else {
          start = this.activeModule.io.firstOutput;
          end = this.activeModule.io.lastOutput;
        }
        this.ws.query('?IOMAP_GET_CYCLIC_VALUES('+ioType+','+start+','+end+')')
        .then((ret: MCQueryResponse)=>{
          const parts = ret.result.split(';');
          if (ioType === 1) {
            for (let i=0; i<parts.length; i++) {
              if (parts[i].length === 0)
                continue;
              const innerparts = parts[i].split(',');
              this.activeModule.io.inputs[i].value = innerparts[1] === '1';
            }
          } else {
            for (let i=0; i<parts.length; i++) {
              if (parts[i].length === 0)
                continue;
              const innerparts = parts[i].split(',');
              this.activeModule.io.outputs[i].value = innerparts[1] === '1';
            }
          }
          this.ref.tick();
        });
      },200);
    });
  }
  
  toggleValue(e:MatSlideToggleChange, io: Io) {
    const newVal = e.checked ? 1 : 0;
    const ioType = this.activeModule.showInputs ? 1 : 0;
    this.ws.query('?iomap_set_info('+ioType+','+io.id+',"VALUE","'+newVal+'")')
    .then((ret: MCQueryResponse)=>{
      if (ret.result !== '0')
        e.source.checked = !e.source.checked;
      else
        io.value = !io.value;
    });
  }
  
  hasNestedChild = (_: number, nodeData: TreeNode) => nodeData.children.length > 0;

  private _getChildren = (node: TreeNode) => node.children;
}

interface ActiveModule {
  io: IoModule;
  showInputs: boolean;
}