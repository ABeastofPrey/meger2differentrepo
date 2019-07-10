import { Component, OnInit, HostListener } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material';
import { of as observableOf } from 'rxjs';
import { SimulatorService } from '../services/simulator.service';
import { SceneObject } from 'stxsim-ng';

@Component({
  selector: 'objects-list',
  templateUrl: './objects-list.component.html',
  styleUrls: ['./objects-list.component.css'],
})
export class ObjectsListComponent implements OnInit {
  nestedTreeControl: NestedTreeControl<SceneObject>;
  nestedDataSource: MatTreeNestedDataSource<SceneObject>;

  draggedNode: SceneObject;

  constructor(private sim: SimulatorService) {}

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.keyCode !== 46 || !this.sim.selected) return;
    this.sim.deleteSelected();
  }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<SceneObject>(
      this._getChildren
    );
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.sim.data.subscribe(data => {
      this.nestedDataSource.data = data;
    });
  }

  hasNestedChild = (_: number, nodeData: SceneObject) => {
    return nodeData.children.length > 0;
  };

  private _getChildren = (node: SceneObject) => {
    return observableOf(node.children);
  };

  /*private isParentNode(node: SceneObject, parent: SceneObject): boolean {
    let currParent = node;
    while (currParent) {
      if (currParent === parent) return true;
      currParent = currParent.parent;
    }
    return false;
  }*/

  onObjectDragStart(e: DragEvent, node: SceneObject) {
    e.dataTransfer.effectAllowed = 'move';
    this.draggedNode = node;
  }

  onDragOverObject(e: DragEvent, node: SceneObject) {
    /*if (
      this.isParentNode(node, this.draggedNode) ||
      node === this.draggedNode.parent
    )
      return this.sim.lastSelectedNode.next(null);
    e.preventDefault();
    e.stopImmediatePropagation();
    e.dataTransfer.dropEffect = 'move';
    if (node) this.nestedTreeControl.expand(node);
    this.sim.lastSelectedNode.next(node);*/
  }

  onObjectDrop(e: DragEvent, node: SceneObject) {
    /*f (
      this.isParentNode(node, this.draggedNode) ||
      node === this.draggedNode.parent
    )
      return;
    e.preventDefault();
    e.stopImmediatePropagation();
    let data = this.nestedDataSource.data;
    if (node) node.children.push(this.draggedNode);
    else data.push(this.draggedNode);
    if (this.draggedNode.parent) {
      const i = this.draggedNode.parent.children.indexOf(this.draggedNode);
      if (i !== -1) this.draggedNode.parent.children.splice(i, 1);
    } else {
      const i = data.indexOf(this.draggedNode);
      if (i !== -1) data.splice(i, 1);
    }
    this.draggedNode.parent = node;
    this.nestedDataSource.data = null;
    this.nestedDataSource.data = data;*/
  }

  selectNode(node: SceneObject) {
    this.sim.selected = node;
  }

  toggleNode(node: SceneObject) {
    this.nestedTreeControl.toggle(node);
    if (!this.nestedTreeControl.isExpanded(node))
      this.nestedTreeControl.collapseDescendants(node);
  }
}
