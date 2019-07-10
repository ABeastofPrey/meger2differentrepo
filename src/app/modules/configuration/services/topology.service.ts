import { Injectable } from '@angular/core';
import { WebsocketService } from '../../core/services/websocket.service';
import { handler, errMsgProp } from '../../core/services/service-adjunct';
import { compose, then, identity } from 'ramda';

@Injectable()
export class TopologyService {
  constructor(private ws: WebsocketService) {}

  public async getDeviceTopology(): Promise<any> {
    const api = '?TOP_getTopology';
    const query = _api => this.ws.query(_api);
    const resHandler = handler(JSON.parse, errMsgProp);
    const retrieveTopology = compose(
      then(resHandler),
      query
    );
    return retrieveTopology(api);
  }

  public async getOpMode(): Promise<any> {
    const api = '?ec_master_opmode'; // good status: 8
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const retrieveOpMode = compose(
      then(resHandler),
      query
    );
    return retrieveOpMode(api);
  }
}
