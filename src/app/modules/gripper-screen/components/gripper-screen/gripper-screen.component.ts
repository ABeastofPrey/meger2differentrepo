import { Component, OnInit, Injectable } from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener, MatSelectChange, MatSlideToggleChange, MatDialog, MatSnackBar} from '@angular/material';
import {FlatTreeControl} from '@angular/cdk/tree';
import {of as ofObservable, Observable, BehaviorSubject} from 'rxjs';
import {GripperTestDialogComponent} from '../gripper-test-dialog/gripper-test-dialog.component';
import {WebsocketService, MCQueryResponse, DataService} from '../../../core';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {SingleInputDialogComponent} from '../../../../components/single-input-dialog/single-input-dialog.component';

/**
 * Node for to-do item
 */
export class GripperTableNode {
  children: GripperTableNode[];
  item: string;
  nodeType : string;
  parent: GripperTableNode;
}

/** Flat to-do item node with expandable and level information */
export class GripperTableFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange: BehaviorSubject<GripperTableNode[]> = new BehaviorSubject<GripperTableNode[]>([]);

  get data(): GripperTableNode[] { return this.dataChange.value; }

  constructor(private ws: WebsocketService) {
    this.initialize();
  }

  initialize() {
    this.ws.query('?grp_end_effector_get_list').then((ret:MCQueryResponse)=>{
      if (ret.err || ret.result.length === 0)
        return;
      let data: GripperTableNode[] = [];
      let promises : Promise<any>[] = [];
      let efs = ret.result.split(',');
      for (let ef of efs) {
        promises.push(this.ws.query('?grp_get_gripper_list("' + ef + '")'));
      }
      Promise.all(promises).then((ret: MCQueryResponse[])=>{
        for (let i = 0; i < efs.length; i++) {
          let children: GripperTableNode[] = [];
          let ef = new EndEffector();
          for (let grp of ret[i].result.split(',')) {
            let child = new Gripper();
            child.item = grp;
            children.push(child);
            child.parent = ef;
          }
          ef.children = children;
          ef.item = efs[i];
          data.push(ef);
        }
        this.dataChange.next(data);
      });
    });
  }

  insertItem(parent: GripperTableNode, name: string) {
    let child: GripperTableNode;
    if (parent === null || parent === undefined) {
      child = new EndEffector();
      child.item = name;
      child.children = [];
    } else if (parent.nodeType === 'ef') {
      child = new Gripper();
      child.item = name;
      child.parent = parent;
    }
    if (parent && parent.children) {
      parent.children.unshift(child);
    } else {
      this.data.unshift(child);
    }
    this.dataChange.next(this.data);
  }
  
  deleteItem(node: GripperTableNode) {
    let index = this.data.indexOf(node);
    if (index > -1) {
      this.data.splice(index,1);
      this.dataChange.next(this.data);
    } else {
      for (let n of this.data) {
        index = n.children.indexOf(node);
        if (index > -1) {
          n.children.splice(index,1);
          this.dataChange.next(this.data);
          return;
        }
      }
    }
  }
}

@Component({
  selector: 'gripper-screen',
  templateUrl: './gripper-screen.component.html',
  styleUrls: ['./gripper-screen.component.css'],
  providers: [ChecklistDatabase]
})
export class GripperScreenComponent implements OnInit {
  
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap: Map<GripperTableFlatNode, GripperTableNode> = new Map<GripperTableFlatNode, GripperTableNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap: Map<GripperTableNode, GripperTableFlatNode> = new Map<GripperTableNode, GripperTableFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: GripperTableFlatNode | null = null;

  /** The new item's name */
  newItemName: string = '';

  treeControl: FlatTreeControl<GripperTableFlatNode>;
  treeFlattener: MatTreeFlattener<GripperTableNode, GripperTableFlatNode>;
  dataSource: MatTreeFlatDataSource<GripperTableNode, GripperTableFlatNode>;
  
  selectedNode : GripperTableNode = null;

  constructor(
    public data : DataService,
    private database: ChecklistDatabase,
    private ws: WebsocketService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<GripperTableFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }
  
  getLevel = (node: GripperTableFlatNode) => { return node.level; };

  isExpandable = (node: GripperTableFlatNode) => { return node.expandable; };

  getChildren = (node: GripperTableNode): Observable<GripperTableNode[]> => {
    return ofObservable(node.children);
  }

  hasChild = (_: number, _nodeData: GripperTableFlatNode) => { return _nodeData.expandable; };

  hasNoContent = (_: number, _nodeData: GripperTableFlatNode) => { return _nodeData.item === ''; };
  
  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: GripperTableNode, level: number) => {
    let flatNode = this.nestedNodeMap.has(node) && this.nestedNodeMap.get(node)!.item === node.item
      ? this.nestedNodeMap.get(node)!
      : new GripperTableFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }
  
  addNewItem(node: GripperTableFlatNode) {
    const title = 'Add ' + (node ? 'Gripper' : 'End Effector');
    this.dialog.open(SingleInputDialogComponent,{
      data: {
        icon: 'add',
        title: title,
        placeholder: 'Name',
        accept: title
      }
    }).afterClosed().subscribe((name:string)=>{
      if (name) {
        name = name.toUpperCase();
        if (node === null) { // ADD AN EF
          this.ws.query('?grp_end_effector_new("' + name + '")')
          .then((ret: MCQueryResponse)=>{
            if (ret.result === '0')
              this.database.insertItem(null,name);
          });
        } else {
          const ef = node.item;
          const parent = this.flatNodeMap.get(node);
          this.ws.query('?GRP_ADD_GRIPPER("' + ef + '","' + name + '")')
          .then((ret: MCQueryResponse)=>{
            if (ret.result === '0')
              this.database.insertItem(parent, name);
          });
        }
      }
    });
  }
  
  deleteNode(node: GripperTableFlatNode) {
    let fnode = this.flatNodeMap.get(node);
    if (!fnode.item)
      return this.database.deleteItem(fnode);
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Delete' + ' ' + fnode.item + '?',
        msg: '',
        yes: 'DELETE',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        if (fnode.nodeType === 'ef') {
          this.ws.query('?GRP_END_EFFECTOR_DELETE("' + fnode.item + '")')
          .then((ret: MCQueryResponse)=>{
            if (ret.result === '0') {
              if (fnode === this.selectedNode)
                this.selectedNode = null;
              this.database.deleteItem(fnode);
            }
          });
        } else {
          const cmd = '?GRP_DELETE_GRIPPER("' +
                      fnode.parent.item + '","' + fnode.item + '")';
          this.ws.query(cmd).then((ret: MCQueryResponse)=>{
            if (ret.result === '0') {
              if (fnode === this.selectedNode)
                this.selectedNode = null;
              this.database.deleteItem(fnode);
            }
          });
        }
      }
    });
  }
  
  setContent(node: GripperTableFlatNode) {
    let flatNode = this.flatNodeMap.get(node);
    this.selectedNode = flatNode;
    if (flatNode.nodeType === 'ef') {
      this.getEndEffectorData(<EndEffector>flatNode);
    } else {
      this.getGripperData(<Gripper>flatNode);
    }
  }
  
  test() {
    const grp = this.selectedNode.item;
    const ef = this.selectedNode.parent.item;
    this.dialog.open(GripperTestDialogComponent,{
      data:{
        grp: grp,
        ef: ef
      }
    });
  }
  
  private getEndEffectorData(ef: EndEffector) {
    const promises : Promise<any>[] = [
      this.ws.query('?GRP_END_EFFECTOR_GET_TOOL("' + ef.item + '")'),
      this.ws.query('?GRP_END_EFFECTOR_GET_SAFETY_DIN("' + ef.item + '")'),
      this.ws.query('?GRP_END_EFFECTOR_GET_DIN_RANGE("' + ef.item + '")')
      
    ];
    Promise.all(promises).then((ret: MCQueryResponse[])=>{
      ef.tool = ret[0].result;
      ef.dInput = Number(ret[1].result);
      let binary: string = "0000000" + (+ret[2].result).toString(2);
      binary = binary.substring(binary.length - 8);
      for (let i = 0; i < binary.length; i++) {
        ef.invert[i] = binary.charAt(i) === '1';
      }
    });
  }
  
  private getGripperData(grp: Gripper) {
    const ef_and_grp = '"' + grp.parent.item + '","' + grp.item + '"';
    const promises : Promise<any>[] = [
      this.ws.query('?GRP_GRIPPER_CONSIDER_TOOL_GET('+ef_and_grp+')'),
      this.ws.query('?GRP_GRIPPER_GET_TOOL('+ef_and_grp+')'),
      this.ws.query('?GRP_GRIPPER_DOUT_COMMAND_GET('+ef_and_grp+',1)'),
      this.ws.query('?GRP_GRIPPER_DOUT_COMMAND_GET('+ef_and_grp+',2)'),
      this.ws.query('?GRP_GRIPPER_DIN_FEEDBACK_GET('+ef_and_grp+',1)'),
      this.ws.query('?GRP_GRIPPER_DIN_FEEDBACK_GET('+ef_and_grp+',2)'),
      this.ws.query('?GRP_GRIPPER_COMMAND_INVERT_GET('+ef_and_grp+',1)'),
      this.ws.query('?GRP_GRIPPER_COMMAND_INVERT_GET('+ef_and_grp+',2)'),
      this.ws.query('?GRP_GRIPPER_FEEDBACK_INVERT_GET('+ef_and_grp+',1)'),
      this.ws.query('?GRP_GRIPPER_FEEDBACK_INVERT_GET('+ef_and_grp+',2)'),
      this.ws.query('?GRP_GRIPPER_GET_SLEEP_TIME('+ef_and_grp+',"OPEN")'),
      this.ws.query('?GRP_GRIPPER_GET_SLEEP_TIME('+ef_and_grp+',"CLOSE")')
    ];
    Promise.all(promises).then((ret: MCQueryResponse[])=>{
      grp.useTool = ret[0].result === '1';
      grp.tool = ret[1].result;
      grp.cmd1 = Number(ret[2].result);
      grp.cmd2 = Number(ret[3].result);
      grp.fb1 = Number(ret[4].result);
      grp.fb2 = Number(ret[5].result);
      grp.cmd1_invert = ret[6].result === '1';
      grp.cmd2_invert = ret[7].result === '1';
      grp.fb1_invert = ret[8].result === '1';
      grp.fb2_invert = ret[9].result === '1';
      grp.sleep_open = Number(ret[10].result);
      grp.sleep_close = Number(ret[11].result);
      grp.cmd2_enabled = grp.cmd2 > 0;
      grp.fb1_enabled = grp.fb1 > 0;
      grp.fb2_enabled = grp.fb2 > 0;
    });
  }
  
  updateEfInput() {
    const ef = (<EndEffector> this.selectedNode);
    const val = ef.dInput;
    let inv = '0b';
    for (let b of ef.invert){
      inv += (b ? '1' : '0');
    }
    const cmd='?GRP_END_EFFECTOR_SET_SAFETY_DIN("'+ef.item+'",'+val+','+inv+')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      console.log(ret);
      if (ret.result !== '0') {
        
      }
    });
    
  }
  
  updateGripperCmd(i:number) {
    const grp = this.selectedNode.item;
    const ef = this.selectedNode.parent.item;
    const g = (<Gripper> this.selectedNode);
    const inv = i === 1 ? (g.cmd1_invert ? 1 : 0) : (g.cmd2_invert ? 1 : 0);
    const val = i === 1 ? g.cmd1 : g.cmd2;
    const cmd = '?GRP_GRIPPER_DOUT_COMMAND_SET("' + ef + '","' + grp + '",' +
                i + ',' + val + ',' + inv + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result !== '0') {
        
      }
    });
  }
  
  updateGripperFb(i:number) {
    const grp = this.selectedNode.item;
    const ef = this.selectedNode.parent.item;
    const g = (<Gripper> this.selectedNode);
    const inv = i === 1 ? (g.fb1_invert ? 1 : 0) : (g.fb2_invert ? 1 : 0);
    const val = i === 1 ? g.fb1 : g.fb2;
    const cmd = '?GRP_GRIPPER_DIN_FEEDBACK_SET("' + ef + '","' + grp + '",' +
                i + ',' + val + ',' + inv + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result !== '0') {
        
      }
    });
  }
  
  updateEfTool(e:MatSelectChange) {
    const ef = this.selectedNode.item;
    this.ws.query('?GRP_END_EFFECTOR_SET_TOOL("' + ef + '","' + e.value+'")')
    .then((ret: MCQueryResponse)=>{
      if (ret.result !== '0') {
        
      }
    });
  }
  
  updateGripperSleep(openClose:string) {
    const grp = this.selectedNode.item;
    const ef = this.selectedNode.parent.item;
    const gripper:Gripper = (<Gripper> this.selectedNode);
    const val = openClose === 'OPEN' ? gripper.sleep_open : gripper.sleep_close;
    const cmd = '?GRP_GRIPPER_SET_SLEEP_TIME';
    this.ws.query(cmd+'("'+ef+'","'+grp+'","'+openClose+'",'+val+')')
    .then((ret: MCQueryResponse)=>{
      if (ret.result !== '0') {
        
      }
    });
    
  }
  
  updateGripperTool(e:MatSelectChange) {
    const grp = this.selectedNode.item;
    const ef = this.selectedNode.parent.item;
    const cmd = '?GRP_GRIPPER_SET_TOOL';
    this.ws.query(cmd + '("' + ef + '","' + grp + '","' + e.value + '")')
    .then((ret: MCQueryResponse)=>{
      if (ret.result !== '0') {
        
      }
    });
  }
  
  updateGripperUseTool(e:MatSlideToggleChange) {
    const grp = this.selectedNode.item;
    const ef = this.selectedNode.parent.item;
    const cmd = '?GRP_GRIPPER_CONSIDER_TOOL_SET';
    const val = e.checked ? '1' : '0';
    this.ws.query(cmd + '("' + ef + '","' + grp + '",' + val + ')')
    .then((ret: MCQueryResponse)=>{
       if (ret.result !== '0')  {
         
       }
    });
  }

  ngOnInit() {
  }
  
  ngOnDestroy() {
    let promises : Promise<any>[] = [];
    for (let ef of this.database.data) {
      if (ef.nodeType === 'ef') {
        const cmd = '?GRP_STORE_DATA("' + ef.item + '")';
        promises.push(this.ws.query(cmd));
      }
    }
    Promise.all(promises);
  }

}

export class EndEffector extends GripperTableNode {
  dInput : number = 0;
  tool : string;
  invert: boolean[] = [false,false,false,false,false,false,false,false];
  constructor() {
    super();
    this.nodeType = 'ef';
  }
}

export class Gripper extends GripperTableNode {
  cmd1: number = 0;
  cmd1_invert: boolean;
  cmd2: number = 0;
  cmd2_invert: boolean;
  cmd2_enabled: boolean;
  fb1: number = 0;
  fb1_invert: boolean;
  fb1_enabled: boolean;
  fb2: number = 0;
  fb2_invert: boolean;
  fb2_enabled: boolean;
  tool: string;
  useTool: boolean;
  sleep_open: number = 1000;
  sleep_close: number = 1000;
  constructor() {
    super();
    this.nodeType = 'grp';
  }
}
