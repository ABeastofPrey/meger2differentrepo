import { ErrorFrame } from './../../core/services/websocket.service';
import { Injectable } from '@angular/core';
import { WebsocketService } from '../../core/services/websocket.service';
import { DataService, MCQueryResponse } from '../../core/services';
import { map, filter } from 'lodash';


@Injectable()
export class Jump3DialogService {

  constructor(
    private ws: WebsocketService,
    private dataService: DataService,
  ) { }

  public async retriveMotionElements(): Promise<string[]> {
    const res = await this.ws.query('?TP_GET_ROBOT_LIST') as MCQueryResponse;
    if (res.err) {
      console.error(res.err.errMsg);
      return;
    }
    return (res.result.length !== 0) ? res.result.split(',') : [];
  }

  public retriveDestFrames(): string[] {
    return map(filter(this.dataService.locations, x => !x.isArr), x => x.name);
  }

  public retriveVolocityMax(motionElement: string): Promise<number> {
    return this.queryMax(`?${motionElement}.VELOCITYMAX`);
  }

  public retriveAccelearationMax(motionElement: string): Promise<number> {
    return this.queryMax(`?${motionElement}.ACCELERATIONMAX`);
  }

  private async queryMax(cmd: string): Promise<number> {
    const res: MCQueryResponse = await this.ws.query(cmd) as MCQueryResponse;
    if (res.err) {
      console.error(res.err.errMsg);
      return ;
    }
    return Math.floor(Number(res.result));
  }
}
