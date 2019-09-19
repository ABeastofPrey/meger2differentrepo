import { Component, OnInit, OnDestroy } from '@angular/core';
import { TopologyService } from '../../services/topology.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { Observable, of as observableOf } from 'rxjs';
import { Either } from 'ramda-fantasy';
import { isFalsy, isNotNil, isNotEmpty } from 'ramda-adjunct';
import {
  compose,
  bind,
  then,
  unless,
  split,
  last,
  equals,
  isNil,
  isEmpty,
  concat,
} from 'ramda';

export interface DeviceNode {
  name: string;
  children?: DeviceNode[];
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  name: string;
  level: number;
  expandable: boolean;
}

export const levelOrder = (root: DeviceNode) => {
  const res: DeviceNode[] = [];
  if (isNil(root)) {
    return res;
  }
  let temp: DeviceNode[] = [root];
  const innerOrder = (node: DeviceNode) => {
    if (isNotNil(node.children)) {
      temp = concat(temp, node.children);
    }
    res.push(node);
    temp.shift();
    if (isNotEmpty(temp)) {
      innerOrder(temp[0]);
    }
  };
  innerOrder(root);
  return res;
};

const getLevel = (node: FileFlatNode) => node.level;
const isExpandable = (node: FileFlatNode) => node.expandable;
const getChildren = (node: DeviceNode): Observable<DeviceNode[]> =>
  observableOf(node.children);
const transformer = (node: DeviceNode, level: number) => {
  let flatNode = new FileFlatNode();
  flatNode.name = node.name;
  flatNode.level = level;
  flatNode.expandable = !!node.children && node.children.length > 0;
  return flatNode;
};
const treeFlattener = new MatTreeFlattener(
  transformer,
  getLevel,
  isExpandable,
  getChildren
);

@Component({
  selector: 'app-topology',
  templateUrl: './topology.component.html',
  styleUrls: ['./topology.component.scss'],
})
export class TopologyComponent implements OnInit, OnDestroy {
  private interval: any;
  private oldNodes: DeviceNode[] = [];
  public systemBusType: number;
  public treeControl: FlatTreeControl<FileFlatNode>;
  public dataSource: MatTreeFlatDataSource<DeviceNode, FileFlatNode>;
  public hasErr: boolean = false;
  public hasChild = (_: number, nodeData: FileFlatNode) => nodeData.expandable;

  constructor(private service: TopologyService) {
    this.treeControl = new FlatTreeControl<FileFlatNode>(
      getLevel,
      isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      treeFlattener
    );
  }

  ngOnInit(): void {
    this.retriveSystemBusType();
    this.refresh();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  private async refresh(): Promise<void> {
    let isErrState = await this.checkStateWithOpMode();
    await this.retrieveAndAssemble();
    setTimeout(() => {
      this.treeControl.expandAll();
    }, 100);
    this.hasErr = isErrState ? true : false; // set status
    this.interval = setInterval(async () => {
      isErrState = await this.checkStateWithOpMode();
      unless(equals(false), this.retrieveAndAssemble.bind(this))(isErrState);
      this.hasErr = isErrState ? true : false;
    }, 1500);
  }

  /**
   * Check the system status with OpMode, if has error return true, else return false.
   * If the OpMode equals to '8', means that there is no error.
   *
   * @private
   * @returns {Promise<boolean>}
   * @memberof TopologyComponent
   */
  private async checkStateWithOpMode(): Promise<boolean> {
    const getModeCode = compose(
      last,
      split('\n')
    );
    const getOpMode = bind(this.service.getOpMode, this.service);
    const logError = err =>
      console.warn('Retrieve device topology failed: ' + err);
    const isGoodState = compose(
      equals('8'),
      getModeCode
    );
    const logOrCheck = Either.either(logError, isGoodState);
    const fetchModeAndCheck = compose(
      then(
        compose(
          isFalsy,
          logOrCheck
        )
      ),
      getOpMode
    );
    return fetchModeAndCheck();
  }

  private async retrieveAndAssemble(): Promise<void> {
    const retrieveTopology = bind(this.service.getDeviceTopology, this.service);
    const logError = err =>
      console.warn('Retrieve device topology failed: ' + err);
    const assemble = tree => {
      if (isEmpty(this.oldNodes)) {
        this.dataSource.data = tree;
        this.oldNodes = levelOrder(tree[0]);
      } else {
        const needRefresh = this.isChanged(levelOrder(tree[0]));
        if (needRefresh) {
          this.dataSource.data = tree;
          setTimeout(() => {
            this.treeControl.expandAll();
          }, 100);
        }
      }
    };
    const logOrAssemble = Either.either(logError, assemble);
    const doIt = compose(
      then(logOrAssemble),
      retrieveTopology
    );
    doIt();
  }

  private async retriveSystemBusType(): Promise<any> {
    const getBusType = bind(this.service.getBusType, this.service);
    const logErr = err => console.warn(`Get systembustype failed: ${err}`);
    const setBus = busType => this.systemBusType = busType
    const logOrSet = Either.either(logErr, compose(setBus, Number));
    const setBusType = compose(then(logOrSet), getBusType);
    setBusType();
  }

  private isChanged(nodes: DeviceNode[]): boolean {
    if (this.oldNodes.length !== nodes.length) {
      this.oldNodes = nodes;
      return true;
    }
    const count = this.oldNodes.length;
    for (let i = 0; i < count; i++) {
      if (this.oldNodes[i].name !== nodes[i].name) {
        this.oldNodes = nodes;
        return true;
      }
    }
    return false;
  }
}
