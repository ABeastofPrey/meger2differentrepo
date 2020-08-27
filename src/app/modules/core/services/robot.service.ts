import { TpStatService } from './tp-stat.service';
import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { RobotTypes, RobotModel, RobotAxesType } from '../models/robot.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RobotService {
  changed: BehaviorSubject<RobotModel> = new BehaviorSubject(null);

  private interval: number = null;

  private _types: RobotTypes = null;
  get types() {
    return this._types;
  }
  private _selectedRobot: RobotModel = null;
  get selectedRobot() {
    return this._selectedRobot;
  }

  private _rarm: {PN: string, SN: string} = null;
  get rarm() { return this._rarm; }

  private stringToModelMapper: Map<string, RobotModel> = new Map();

  constructor(private ws: WebsocketService, private stat: TpStatService) {}

  init() {
    this.ws.isConnected.subscribe(stat => {
      if (!stat) {
        this.reset();
        return;
      }
      if (this.interval) clearInterval(this.interval);
      this.refresh();
    });
    this.stat.onlineStatus.subscribe(stat=>{
      if (!stat) {
        this.reset();
        return;
      } else {
        if (this.interval) window.clearInterval(this.interval);
        this.refresh();
      }
    });
  }

  private refresh() {
    this.interval = window.setInterval(() => {
      this.ws.query('?rob_ver').then((ret: MCQueryResponse) => {
        if (ret.err) return;
        this.getRobots();
        window.clearInterval(this.interval);
        this.interval = null;
      });
    }, 2000);
  }

  updateMap(rType: RobotAxesType[]) {
    if (rType) {
      for (const axes of rType) {
        for (const series of axes.series) {
          for (const m of series.models) {
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
      this.ws.query('?RARM_SHOW_ARM').then(ret=>{
        if (ret.err || ret.result.length === 0) {
          this._rarm = null;
          return;
        }
        try {
          this._rarm = JSON.parse(ret.result);
        } catch (err) {
          this._rarm = null;
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
