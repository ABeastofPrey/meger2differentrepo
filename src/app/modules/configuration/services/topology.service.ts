import { Injectable } from '@angular/core';
import { WebsocketService } from '../../core/services/websocket.service';
import { handler, errMsgProp } from '../../program-editor/services/service-adjunct';
import { compose, then } from 'ramda';

@Injectable()
export class TopologyService {
    constructor(private ws: WebsocketService) { }

    public async getDeviceTopology(): Promise<any> {
        const api = '?TOP_getTopology';
        const query = _api => this.ws.query(_api);
        const resHandler = handler(JSON.parse, errMsgProp);
        const retrieveTopology = compose(then(resHandler), query);
        return retrieveTopology(api);
    }
}
