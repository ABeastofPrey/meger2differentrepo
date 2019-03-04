import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import {ScreenManagerService, CoordinatesService} from '../../core';
import {TreeNode} from '../models/tree-node.model';
import {SimulatorService} from '../services/simulator.service';
import 'rxjs/add/operator/take';
import {RobotService} from '../../core/services/robot.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../../environments/environment';

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
  env = environment;
  
  private words: any;

  constructor(
    private mgr: ScreenManagerService,
    private coo: CoordinatesService,
    public sim: SimulatorService,
    private robot: RobotService,
    private trn: TranslateService
  ) {
    this.trn.get('simulator_screen').subscribe(words=>{
      this.words = words;
    });
    this.mgr.controlsAnimating.subscribe(stat=>{
      if (stat) {
        this.player.setSize(0,0);
      } else {
        this.onDragEnd();
      }
    });
  }
  
  @HostListener('click')
  onClick() {
    let obj = this.player.getSelectedObject();
    if (obj) {
      this.sim.customObjectsMapper.forEach((val:any, key:TreeNode)=>{
        if (obj === val) {
          this.sim.lastSelectedNode.next(key);
        }
      });
    }
  }
  
  @HostListener('document:keydown',['$event'])
  onKeydown(e:KeyboardEvent) {
    switch (e.keyCode) {
      case 46: // Del button
        e.preventDefault();
        this.deleteSelected();
        break;
      case 68: // D key
        if (e.ctrlKey) { // CTRL + D
          e.preventDefault();
          this.duplicateSelected();
        }
        break;
    }
  }
  
  deleteSelected() {
    let data = this.sim.data.value;
    const i = data.indexOf(this.sim.lastSelectedNode.value);
    if (i === -1)
      return;
    const removed = data.splice(i,1);
    const obj = this.sim.customObjectsMapper.get(removed[0]);
    if (obj) {
      this.player.getScene().remove(obj);
      this.sim.customObjectsMapper.delete(removed[0]);
      this.sim.data.next(data);
      this.sim.lastSelectedNode.next(null);
    }
  }
  
  duplicateSelected() {
    const selected = this.sim.lastSelectedNode.value;
    const obj = this.sim.customObjectsMapper.get(selected);
    if (obj) {
      let newObj = obj.clone();
      newObj.material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
      this.player.getScene().add(newObj);
      const name = this.sim.getAvailableName(selected.type);
      let node: TreeNode = new TreeNode(name, selected.type,null);
      node.position.x = selected.position.x;
      node.position.y = selected.position.y;
      node.position.z = selected.position.z;
      node.rotation.x = selected.rotation.x;
      node.rotation.y = selected.rotation.y;
      node.rotation.z = selected.rotation.z;
      node.scale.x = selected.scale.x;
      node.scale.y = selected.scale.y;
      node.scale.z = selected.scale.z;
      this.sim.customObjectsMapper.set(node,newObj);
      this.sim.addNode(node);
    }
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
      obj.scale.x = tn.scale.x;
      obj.scale.y = tn.scale.y;
      obj.scale.z = tn.scale.z;
      this.sim.customObjectsMapper.set(tn,obj);
      this.player.getScene().add(obj);
      return;
    } else {
      obj.position.y = 50;
    }
    this.player.getScene().add(obj);
    const name = this.sim.getAvailableName(this.words[objType.toLowerCase()]);
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
    let modelPath: string = 'assets/scripts/threejs/';
    const robot = this.robot.selectedRobot.part_number;
    if (robot.indexOf('500') > 0)
      modelPath += 'wukong500';
    else
      modelPath += 'wukong700'
    modelPath += '.json'
    loader.load(modelPath, (text: string) => {
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