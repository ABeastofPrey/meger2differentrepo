import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material';
import {of as observableOf} from 'rxjs';
import {ScreenManagerService, CoordinatesService} from '../../core';

declare var THREE, PREVIEW3D;

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit {
  
  @ViewChild('threejs') threejs: ElementRef;
  
  isLoading: boolean = true;
  player: any;
  nestedTreeControl: NestedTreeControl<TreeNode>;
  nestedDataSource: MatTreeNestedDataSource<TreeNode>;
  lastSelectedNode: TreeNode = null;
  draggedNode: TreeNode = null;
  data: TreeNode[];
  customObjectsMapper : Map<TreeNode,any> = new Map();

  constructor(private mgr: ScreenManagerService, private coo: CoordinatesService) {
    this.mgr.controlsAnimating.subscribe(stat=>{
      if (stat) {
        this.player.setSize(0,0);
      } else {
        this.onDragEnd();
      }
    });
  }
  
  onDragEnd() {
    if (this.player) {
      const width = this.threejs.nativeElement.clientWidth;
      const height = this.threejs.nativeElement.clientHeight;
      console.log(width,height);
      this.player.setSize(width,height);
    }
  }
  
  isParentNode(node:TreeNode, parent: TreeNode) : boolean {
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
      return this.lastSelectedNode = null;
    e.preventDefault();
    e.stopImmediatePropagation();
    e.dataTransfer.dropEffect = "move";
    if (node)
      this.nestedTreeControl.expand(node);
    this.lastSelectedNode = node;
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
    this.lastSelectedNode = node;
  }
  
  toggleNode(node: TreeNode) {
    this.nestedTreeControl.toggle(node);
    if (!this.nestedTreeControl.isExpanded(node))
      this.nestedTreeControl.collapseDescendants(node);
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
  
  addObject(objType:string) {
    let geometry;
    const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    switch (objType) {
      case 'Cube':
        geometry = new THREE.BoxGeometry( 100, 100, 100 )
        break;
      case 'Sphere':
        geometry = new THREE.SphereGeometry( 50, 360, 360 )
        break;
      case 'Cylinder':
        geometry = new THREE.CylinderGeometry( 50, 50, 100, 360 )
        break;
    }
    let obj = new THREE.Mesh( geometry, material );
    const name = this.getAvailableName(objType);
    this.player.getScene().add(obj);
    let node: TreeNode = new TreeNode(name,'Object',null);
    this.customObjectsMapper.set(node,obj);
    this.data.push(node);
    this.nestedDataSource.data = null;
    this.nestedDataSource.data = this.data;
  }
  
  onObjectParamChanged(val:any, node:TreeNode, changeType: string) {
    let obj = this.customObjectsMapper.get(node);
    if (obj) {
      switch (changeType) {
        case 'pos_x':
          obj.position.x = val;
          break;
        case 'pos_y':
          obj.position.y = val;
          break;
        case 'pos_z':
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
  
  ngOnDestroy() {
    if (this.player) {
      this.player.stop();
      this.player.dispose();
    }
  }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    let data : TreeNode[] = [];
    let node = new TreeNode('Robot','Robot',null);
    data.push(node);
    this.data = data;
    this.nestedDataSource.data = this.data;
    this.nestedTreeControl.expand(node);
    const loader = new THREE.FileLoader();
    loader.load( 'assets/scripts/threejs/app.json', (text)=> {
      const player = new PREVIEW3D.Player(this.threejs.nativeElement,this.coo);
      let jsonData = JSON.parse(text);
      player.load(jsonData);
      const width = this.threejs.nativeElement.clientWidth;
      const height = this.threejs.nativeElement.clientHeight;
      player.setSize(width,height);
      player.play();
      this.threejs.nativeElement.appendChild( player.dom );
      window.addEventListener( 'resize',()=>{
        const width = this.threejs.nativeElement.clientWidth;
        const height = this.threejs.nativeElement.clientHeight;
        player.setSize(width,height);
      });
      this.player = player;
      setTimeout(()=>{
        this.isLoading = false;
      },400);
    });
  }
  
  hasNestedChild = (_: number, nodeData: TreeNode) => {
    return nodeData.children.length > 0;
  };
  
  private _getChildren = (node: TreeNode) => {
    return observableOf(node.children);
  };
}

class TreeNode {
  name: string;
  type: string;
  children: TreeNode[] = [];
  parent: TreeNode;
  position: {x: number, y: number, z:number} = {x:0,y:0,z:0};
  rotation: {x: number, y: number, z:number} = {x:0,y:0,z:0};
  
  constructor(name:string,typeStr:string,parent: TreeNode) {
    this.name = name;
    this.type = typeStr;
    this.parent = parent;
  }
}