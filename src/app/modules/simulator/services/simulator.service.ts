import { Injectable } from '@angular/core';
import {TreeNode} from '../models/tree-node.model';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulatorService {
  
  customObjectsMapper : Map<TreeNode,any> = new Map();
  data: BehaviorSubject<TreeNode[]> = new BehaviorSubject([]);
  lastSelectedNode: BehaviorSubject<TreeNode> = new BehaviorSubject(null);

  constructor() {
    let data : TreeNode[] = [];
    let node = new TreeNode('Robot','Robot',null);
    data.push(node);
    this.data.next(data);
  }
  
  getAvailableName(objType:string) {
    let lastSuffix : number = 0;
    this.customObjectsMapper.forEach((val: any,key: TreeNode)=>{
      if (key.name.indexOf(objType + '_') === 0) {
        let n = Number(key.name.substring(objType.length + 1));
        if (n > lastSuffix)
          lastSuffix = n;
      }
    });
    lastSuffix += 1;
    return objType + '_' + lastSuffix;
  }
  
  addNode(node:TreeNode) {
    let data = this.data.value;
    data.push(node);
    this.data.next(data);
  }
  
  onObjectParamChanged(val:any, node:TreeNode, changeType: string) {
    let obj = this.customObjectsMapper.get(node);
    let diff: number;
    if (obj) {
      switch (changeType) {
        case 'pos_x':
          diff = val - obj.position.x;
          for (let child of node.children) {
            let childObject = this.customObjectsMapper.get(child);
            if (childObject) {
              childObject.position.x += diff;
            }
          }
          obj.position.x = val;
          break;
        case 'pos_y':
          diff = val - obj.position.y;
          for (let child of node.children) {
            let childObject = this.customObjectsMapper.get(child);
            if (childObject) {
              childObject.position.y += diff;
            }
          }
          obj.position.y = val;
          break;
        case 'pos_z':
          diff = val - obj.position.z;
          for (let child of node.children) {
            let childObject = this.customObjectsMapper.get(child);
            if (childObject) {
              childObject.position.z += diff;
            }
          }
          obj.position.z = val;
          break;
        case 'rot_x':
          obj.rotation.x = val * Math.PI / 180;
          break;
        case 'rot_y':
          obj.rotation.y = val * Math.PI / 180;
          break;
        case 'rot_z':
          obj.rotation.z = val * Math.PI / 180;
          break;
      }
    }
  }
  
}
