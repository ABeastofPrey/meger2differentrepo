import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {ScreenManagerService, CoordinatesService} from '../../core';
import {TreeNode} from '../models/tree-node.model';
import {SimulatorService} from '../services/simulator.service';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/take';

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

  constructor(
    private mgr: ScreenManagerService,
    private coo: CoordinatesService,
    private sim: SimulatorService
  ) {
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
      this.player.setSize(width,height);
    }
  }
  
  addObject(objType:string, tn?: TreeNode) {
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
      default:
        return;
    }
    let obj = new THREE.Mesh( geometry, material );
    if (tn) {
      obj.position.x = tn.position.x;
      obj.position.y = tn.position.y;
      obj.position.z = tn.position.z;
      obj.rotation.x = tn.rotation.x * Math.PI / 180;
      obj.rotation.y = tn.rotation.y * Math.PI / 180;
      obj.rotation.z = tn.rotation.z * Math.PI / 180;
      this.sim.customObjectsMapper.set(tn,obj);
      this.player.getScene().add(obj);
      return;
    }
    this.player.getScene().add(obj);
    const name = this.sim.getAvailableName(objType);
    let node: TreeNode = new TreeNode(name,objType,null);
    this.sim.customObjectsMapper.set(node,obj);
    this.sim.addNode(node);
  }
  
  ngOnDestroy() {
    if (this.player) {
      this.player.stop();
      this.player.dispose();
    }
  }

  ngOnInit() {
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
      this.sim.data.asObservable().take(1).subscribe(data=>{
        for (let obj of data) {
          if (obj.type !== 'Robot')
            this.addObject(obj.type,obj);
        }
      });
      setTimeout(()=>{
        this.isLoading = false;
      },400);
    });
  }
  
  
}