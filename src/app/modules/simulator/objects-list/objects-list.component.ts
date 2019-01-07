import { Component, OnInit } from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material';
import {TreeNode} from '../models/tree-node.model';
import {of as observableOf} from 'rxjs';
import {SimulatorService} from '../services/simulator.service';

@Component({
  selector: 'objects-list',
  templateUrl: './objects-list.component.html',
  styleUrls: ['./objects-list.component.css']
})
export class ObjectsListComponent implements OnInit {
  
  nestedTreeControl: NestedTreeControl<TreeNode>;
  nestedDataSource: MatTreeNestedDataSource<TreeNode>;
  draggedNode: TreeNode = null;

  constructor(private sim: SimulatorService) { }
  
  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.sim.data.subscribe(data=>{
      this.nestedDataSource.data = data;
    });
  }
  
  hasNestedChild = (_: number, nodeData: TreeNode) => {
    return nodeData.children.length > 0;
  };
  
  private _getChildren = (node: TreeNode) => {
    return observableOf(node.children);
  };
  
  private isParentNode(node:TreeNode, parent: TreeNode) : boolean {
    let currParent = node;
    while (currParent) {
      if (currParent === parent)
        return true;
      currParent = currParent.parent;
    }
    return false;
  }
  
  onObjectDragStart(e: DragEvent, node: TreeNode) {
    e.dataTransfer.effectAllowed = "move";
    this.draggedNode = node;
  }
  
  onDragOverObject(e: DragEvent, node: TreeNode) {
    if (this.isParentNode(node, this.draggedNode) || node === this.draggedNode.parent)
      return this.sim.lastSelectedNode.next(null);
    e.preventDefault();
    e.stopImmediatePropagation();
    e.dataTransfer.dropEffect = "move";
    if (node)
      this.nestedTreeControl.expand(node);
    this.sim.lastSelectedNode.next(node);
  }
  
  onObjectDrop(e: DragEvent, node: TreeNode) {
    if (this.isParentNode(node,this.draggedNode) || node === this.draggedNode.parent)
      return;
    e.preventDefault();
    e.stopImmediatePropagation();
    let data = this.nestedDataSource.data;
    if (node)
      node.children.push(this.draggedNode);
    else
      data.push(this.draggedNode);
    if (this.draggedNode.parent) {
      const i = this.draggedNode.parent.children.indexOf(this.draggedNode);
      if (i !== -1)
        this.draggedNode.parent.children.splice(i,1);
    } else {
      const i = data.indexOf(this.draggedNode);
      if (i !== -1)
        data.splice(i,1);
    }
    this.draggedNode.parent = node;
    this.nestedDataSource.data = null;
    this.nestedDataSource.data = data;
  }
  
  selectNode(node: TreeNode) {
    if (node.type !== 'Robot')
      this.sim.lastSelectedNode.next(node);
  }
  
  toggleNode(node: TreeNode) {
    this.nestedTreeControl.toggle(node);
    if (!this.nestedTreeControl.isExpanded(node))
      this.nestedTreeControl.collapseDescendants(node);
  }
  

}
