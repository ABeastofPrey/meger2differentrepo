import { Injectable } from '@angular/core';
import {WebsocketService, MCQueryResponse} from './websocket.service';
import {RobotTypes, RobotModel, RobotAxesType} from '../models/robot.model';

@Injectable({
  providedIn: 'root'
})
export class RobotService {
  
  private interval: any = null;
  
  private _types: RobotTypes = null;
  get types() { return this._types; }
  private _selectedRobot: RobotModel = null;
  get selectedRobot() { return this._selectedRobot; }
  
  private stringToModelMapper: Map<string,RobotModel> = new Map();

  constructor(private ws: WebsocketService) {
  }
  
  init() {
    this.ws.isConnected.subscribe(stat=>{
      if (!stat) {
        this.reset();
        return;
      }
      this.interval = setInterval(()=>{
        this.ws.query('?rob_ver').then((ret: MCQueryResponse)=>{
          if (ret.err)
            return;
          this.getRobots();
          clearInterval(this.interval);
        });
      },2000);
    });
  }
  
  updateMap(rType: RobotAxesType[]) {
    if (rType) {
      for (let axes of rType) {
        for (let series of axes.series) {
          for (let m of series.models) {
            this.stringToModelMapper.set(m.part_number,m);
          }
        }
      }
    }
  }
  
  getRobots() {
    this.ws.query('?ROB_GET_LIST_OF_ROBOTS_JSON').then((ret:MCQueryResponse)=>{
      if (ret.err)
        return;
      this._types = JSON.parse(ret.result);
      this.updateMap(this._types.SCARA);
      this.updateMap(this._types.DELTA);
      this.updateMap(this._types.PUMA);
      this.updateMap(this._types.OTHER);
      return this.ws.query('? ROB_GET_ROBOT_CONFIGURATION');
    }).then((ret: MCQueryResponse)=>{
      if (ret) {
        this._selectedRobot = this.stringToModelMapper.get(ret.result);
      }
    });
  }
  
  reset() {
    if (this.interval) {
      this.ws.clearInterval(this.interval);
      this.interval = null;
    }
  }
}
