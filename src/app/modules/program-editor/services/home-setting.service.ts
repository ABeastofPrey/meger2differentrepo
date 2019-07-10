import {
  WebsocketService,
  MCQueryResponse,
} from '../../../modules/core/services/websocket.service';
import { Injectable } from '@angular/core';
import { compose, map, ifElse, isEmpty, identity, then } from 'ramda';
import {
  handler,
  Result,
  Nothing,
  errMsgProp,
} from '../../core/services/service-adjunct';

const parseNum = ifElse(isEmpty, identity, Number);
const parseRes = compose(
  map(parseNum),
  JSON.parse
);

@Injectable()
export class HomeSettingService {
  constructor(private ws: WebsocketService) {}

  public async getHomePostion(): Promise<Result> {
    const api = '?getAllHome';
    const resHandler = handler(parseRes, errMsgProp);
    return this.query(api, resHandler);
  }

  public async getHomeOrder(): Promise<Result> {
    const api = '?getAllHomeOrder';
    const resHandler = handler(parseRes, errMsgProp);
    return this.query(api, resHandler);
  }

  public async updateHomePostion(index: number, value: number): Promise<any> {
    const api = `setHome(${index}, ${value})`;
    const resHandler = handler(Nothing, errMsgProp);
    return this.query(api, resHandler);
  }

  public async clearHomePosition(index: number): Promise<any> {
    const api = `clearHome(${index})`;
    const resHandler = handler(Nothing, errMsgProp);
    return this.query(api, resHandler);
  }

  public async updateHomeOrder(index: number, value: number): Promise<any> {
    const api = `setHomeOrder(${index}, ${value})`;
    const resHandler = handler(Nothing, errMsgProp);
    return this.query(api, resHandler);
  }

  public async readCurrentPosition(): Promise<any> {
    const api = '?HM_readCurrentPosition';
    const resHandler = handler(parseRes, errMsgProp);
    return this.query(api, resHandler);
  }

  public async getPositionMax(index: number): Promise<any> {
    const api = `?maingroup.j${index}.pmax`;
    const resHandler = handler(Number, errMsgProp);
    return this.query(api, resHandler);
  }

  public async getPositionMin(index: number): Promise<any> {
    const api = `?maingroup.j${index}.pmin`;
    const resHandler = handler(Number, errMsgProp);
    return this.query(api, resHandler);
  }

  private async query(
    api: string,
    responseHandler: (res: MCQueryResponse) => Result
  ): Promise<Result> {
    return compose(
      then(responseHandler),
      _api => this.ws.query(_api)
    )(api);
  }
}
