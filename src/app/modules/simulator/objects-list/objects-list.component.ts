import { Component, OnInit, HostListener } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material';
import { of as observableOf, Subject } from 'rxjs';
import { SceneObject } from 'stxsim-ng';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SimulatorService } from '../../core/services/simulator.service';

@Component({
  selector: 'objects-list',
  templateUrl: './objects-list.component.html',
  styleUrls: ['./objects-list.component.css'],
})
export class ObjectsListComponent implements OnInit {
  nestedTreeControl: NestedTreeControl<SceneObject>;
  nestedDataSource: MatTreeNestedDataSource<SceneObject>;
  draggedNode: SceneObject;

  private notifier: Subject<boolean> = new Subject();

  constructor(public sim: SimulatorService) {}

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.key !== 'Delete' || !this.sim.selected) return;
    this.sim.deleteSelected();
  }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<SceneObject>(
      this._getChildren
    );
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.sim.data.pipe(takeUntil(this.notifier)).subscribe(data => {
      this.nestedDataSource.data = data;
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  hasNestedChild = (_: number, nodeData: SceneObject) => {
    return nodeData.children.length > 0;
  };

  private _getChildren = (node: SceneObject) => {
    return observableOf(node.children);
  };

  private isParentNode(node: SceneObject, parent: SceneObject): boolean {
    let currParent = node;
    while (currParent) {
      if (currParent === parent) return true;
      currParent = currParent.parent;
    }
    return false;
  }

  onObjectDragStart(e: DragEvent, node: SceneObject) {
    e.dataTransfer.effectAllowed = 'move';
    this.draggedNode = node;
  }

  onDragOverObject(e: DragEvent, node: SceneObject) {
    if (
      this.isParentNode(node, this.draggedNode) ||
      node === this.draggedNode.parent
    ) {
      this.sim.selected = null;
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    e.dataTransfer.dropEffect = 'move';
    if (node) this.nestedTreeControl.expand(node);
    this.sim.selected = node;
  }

  onObjectDrop(e: DragEvent, node: SceneObject) {
    if (
      this.isParentNode(node, this.draggedNode) ||
      node === this.draggedNode.parent
    ) {
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    node = node || this.sim.scene;
    node.addChild(this.draggedNode);
    this.nestedDataSource.data = null;
    this.nestedDataSource.data = this.sim.scene.children;
  }

  selectNode(node: SceneObject) {
    this.sim.selected = node;
  }

  toggleNode(node: SceneObject) {
    this.nestedTreeControl.toggle(node);
    if (!this.nestedTreeControl.isExpanded(node)) {
      this.nestedTreeControl.collapseDescendants(node);
    }
  }
}
