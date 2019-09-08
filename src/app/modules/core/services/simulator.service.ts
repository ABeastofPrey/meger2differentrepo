import { Injectable } from '@angular/core';
import { SceneObject, Box, Cylinder, SceneService, Sphere } from 'stxsim-ng';
import { BehaviorSubject } from 'rxjs';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { DataService } from './data.service';
import {RobotService} from './robot.service';

@Injectable({
  providedIn: 'root',
})
export class SimulatorService {
  
  data: BehaviorSubject<SceneObject[]> = new BehaviorSubject([]);
  bgColor: string = '#7c99b7';
  traceColor: string = '#ffff00';
  showTrace: boolean = false;
  
  private sceneLoaded: boolean = false;

  private _selected: SceneObject = null;
  get selected() {
    return this._selected;
  }
  set selected(val: SceneObject) {
    this._selected = val;
  }

  get scene() {
    return this.service.simulatorScene;
  }
  
  get shouldShowSimulator() {
    return this.robots.selectedRobot &&
      this.robots.get3DModelPath(this.robots.selectedRobot.part_number) !== null;
  }

  constructor(
    private dataService: DataService,
    private ws: WebsocketService,
    private service: SceneService,
    private robots: RobotService
  ) {}

  getScene() {
    if (this.sceneLoaded){
      this.refreshPallets();
      return;
    }
    this.sceneLoaded = true;
    this.data.next([]);
    while (this.scene.children.length > 0) {
      const c = this.scene.children[0];
      this.scene.removeChild(c);
    }
    this.refreshPallets();
  }

  private refreshPallets() {
    // REMOVE OLD PALLETS
    let childrenToRemove = [];
    for (let i = 0; i < this.scene.children.length; i++) {
      const c = this.scene.children[i];
      if (c.name.startsWith('Pallet_')) {
        childrenToRemove.push(i);
      }
    }
    for (var i = childrenToRemove.length-1; i >= 0; i--) {
      this.scene.removeChild(this.scene.children[i]);
    }
    let promises = [];
    for (let p of this.dataService.pallets) {
      promises.push(this.ws.query('?PLT_IS_ORIGIN_CALIBRATED("' + p.name + '")'));
    }
    let calibratedIndexes: number[] = [];
    return Promise.all(promises)
      .then((rets: MCQueryResponse[]) => {
        for (let i = 0; i < rets.length; i++) {
          if (rets[i].result === '1')
            calibratedIndexes.push(i);
        }
        promises = [];
        for (let i = 0; i < calibratedIndexes.length; i++) {
          const j = calibratedIndexes[i];
          const p = this.dataService.pallets[j];
          promises.push(this.ws.query('?plt_get_origin("' + p.name + '")'));
        }
        return Promise.all(promises);
      }).then((rets: MCQueryResponse[]) => {
        promises = [];
        for (let i = 0; i < rets.length; i++) {
          const j = calibratedIndexes[i];
          const ret = rets[i];
          if (ret.result.length === 3)
            // NO ORIGIN
            continue;
          const origin = ret.result
            .substring(2, ret.result.length - 1)
            .split(',')
            .map((s, i) => {
              const n = Number(s);
              return isNaN(n) ? 0 : n;
            });
          promises.push(this.addPallet(j, origin));
        }
        return Promise.all(promises);
      })
      .then(() => {
        this.data.next(this.scene.children);
      });
  }

  private addPallet(i: number, origin: number[]) {
    const p = this.dataService.pallets[i];
    return this.ws
      .query('?plt_get_pallet_size("' + p.name + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.result.length === 0) return;
        const sizes: number[] = ret.result.split(',').map(s => {
          const n = Number(s);
          return isNaN(n) ? 0 : n * 0.001;
        });
        const legends = this.dataService.robotCoordinateType.legends;
        for (let i = 0; i < legends.length; i++) {
          if (i >= origin.length) break;
          const key = legends[i].toLowerCase();
          p.origin[key] = origin[i];
        }
        p.pallet_size_x = sizes[0] * 1000;
        p.pallet_size_y = sizes[1] * 1000;
        p.pallet_size_z = sizes[2] * 1000;
        // FIND CENTER
        // calculate distance from origin to center
        const R = Math.sqrt(Math.pow(sizes[0], 2) + Math.pow(sizes[1], 2)) / 2;
        const A = Math.atan(sizes[1] / sizes[0]);
        const THETA = (origin[3] * Math.PI) / 180;
        const X = origin[0] + R * Math.cos(A + THETA);
        const Y = origin[1] + R * Math.sin(A + THETA);
        const correctedPosition = [X, Y, origin[2] + 150]; // 150 for SCARA ONLY!! TODO: CHANGE!!
        const box = new Box();
        box.positionMM.set(
          correctedPosition[0],
          correctedPosition[1],
          correctedPosition[2]
        );
        box.eulerXYZ.set(0, 0, THETA);
        box.scale.set(sizes[0], sizes[1], 0.0001);
        box.name = 'Pallet_' + i + '_' + this.dataService.pallets[i].name;
        this.scene.addChild(box);
      });
  }

  addObject(objType: string) {
    let obj;
    switch (objType) {
      default:
        console.log(objType);
        break;
      case 'Cube':
        obj = new Box();
        obj.positionMM.set(500, 0, 50);
        obj.scale.set(0.1, 0.1, 0.1);
        obj.name = 'Untitled Box';
        this.scene.addChild(obj);
        break;
      case 'Sphere':
        obj = new Sphere();
        obj.positionMM.set(500, 0, 50);
        obj.scale.set(0.1, 0.1, 0.1);
        obj.name = 'Untitled Sphere';
        this.scene.addChild(obj);
        break;
      case 'Cylinder':
        obj = new Cylinder();
        obj.positionMM.set(500, 0, 50);
        obj.scale.set(0.1, 0.1, 0.1);
        obj.name = 'Untitled Cylinder';
        obj.eulerXYZDeg.set(90, 0, 0);
        this.scene.addChild(obj);
        break;
    }
    if (obj) this.selected = obj;
    this.data.next(this.scene.children);
  }

  onObjectParamChanged(e: Event, changeType: string) {
    const el = e.target as HTMLInputElement;
    switch (changeType) {
      case 'pos_x':
        console.log(el.value);
        break;
    }
  }

  deleteSelected() {
    if (this.selected) {
      this.scene.removeChild(this.selected);
      this.data.next(this.scene.children);
      this.selected = null;
    }
  }
}
