import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { RobotTypes, RobotModel, RobotAxesType } from '../models/robot.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RobotService {
  changed: BehaviorSubject<RobotModel> = new BehaviorSubject(null);

  private interval: any = null;

  private _types: RobotTypes = null;
  get types() {
    return this._types;
  }
  private _selectedRobot: RobotModel = null;
  get selectedRobot() {
    return this._selectedRobot;
  }

  private stringToModelMapper: Map<string, RobotModel> = new Map();

  constructor(private ws: WebsocketService) {}

  init() {
    this.ws.isConnected.subscribe(stat => {
      if (!stat) {
        this.reset();
        return;
      }
      if (this.interval) clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.ws.query('?rob_ver').then((ret: MCQueryResponse) => {
          if (ret.err) return;
          this.getRobots();
          clearInterval(this.interval);
        });
      }, 2000);
    });
  }

  updateMap(rType: RobotAxesType[]) {
    if (rType) {
      for (let axes of rType) {
        for (let series of axes.series) {
          for (let m of series.models) {
            this.stringToModelMapper.set(m.part_number, m);
          }
        }
      }
    }
  }

  getRobots() {
    this.ws
      .query('?ROB_GET_LIST_OF_ROBOTS_JSON')
      .then((ret: MCQueryResponse) => {
        if (ret.err) return;
        this._types = JSON.parse(ret.result);
        this.updateMap(this._types.SCARA);
        this.updateMap(this._types.DELTA);
        this.updateMap(this._types.PUMA);
        this.updateMap(this._types.OTHER);
        return this.ws.query('? ROB_GET_ROBOT_CONFIGURATION');
      })
      .then((ret: MCQueryResponse) => {
        if (ret) {
          this._selectedRobot = this.stringToModelMapper.get(ret.result);
          this.changed.next(this._selectedRobot);
        }
      });
  }

  reset() {
    if (this.interval) {
      this.ws.clearInterval(this.interval);
      this.interval = null;
    }
  }

  /* HARD CODED ! */
  get3DModelPath(robot: string) {
    switch (robot) {
      case 'SC_4_500_WU_M01_6_MAXX':
      case 'SC_4_500_WU_M01_6_CAN':
      case 'SC_4_500_WU_M01_6_EC':
      case 'SC_4_500_WU_M01_6_CAN_SIM':
      case 'SC_4_500_WU_M01_6_EC_SIM':
        return 'assets/robots/midea/wukong500/wukong500.xacro';
      case 'SC_4_700_WU_M01_6_MAXX':
      case 'SC_4_700_WU_M01_6_CAN':
      case 'SC_4_700_WU_M01_6_EC':
      case 'SC_4_700_WU_M01_6_CAN_SIM':
      case 'SC_4_700_WU_M01_6_EC_SIM':
        return 'assets/robots/midea/wukong700/wukong700.xacro';
      case 'DLTL_3_000_IGUS_M01_00_CAN':
      case 'DLTL_3_000_IGUS_M01_00_CAN_SIM':
        return 'assets/robots/igus/delta/delta.xacro';
      case 'SC_4_500_SHY_M01_6_CAN':
      case 'SC_4_500_SHY_M01_6_CAN_SIM':
      case 'SC_4_500_SHY_M01_6_EC':
      case 'SC_4_500_SHY_M01_6_EC_SIM':
        return 'assets/robots/shinyou/RS500/ShinYou500.xacro';
      default:
        return null;
    }
  }
}
