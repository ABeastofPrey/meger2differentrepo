import { Injectable } from '@angular/core';
import { WebsocketService } from '../../core/services/websocket.service';
import { handler, errMsgProp } from './service-adjunct';
import { compose, then } from 'ramda';

@Injectable()
export class HomeDialogService {
    constructor(private ws: WebsocketService) { }

    public async retrieveVelocityMax(): Promise<any> {
        const api = '?maingroup.VELOCITYMAX';
        const query = _api => this.ws.query(_api);
        const resHandler = handler(JSON.parse, errMsgProp);
        const retrieveMax = compose(then(resHandler), query);
        return retrieveMax(api);
    }
}
