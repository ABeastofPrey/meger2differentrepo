import { Injectable } from '@angular/core';
import { WebsocketService } from '../../../core/services/websocket.service';
import { handler, errMsgProp } from '../../../core/services/service-adjunct';
import { compose, then, identity } from 'ramda';

@Injectable()
export class HandGuidingService {

    constructor(private ws: WebsocketService) { }

    public async setJoints([j1, j2, j3, j4]: number[]): Promise<number> {
        const api = `?sFreeInternal(${j1}, ${j2}, ${j3}, ${j4})`;
        const query = _api => this.ws.query(_api);
        const resHandler = handler(identity, errMsgProp);
        const _setJoint = compose(then(resHandler), query);
        return _setJoint(api);
    }

    public async getJoints(): Promise<number[]> {
        const api = `?getSFreeInternal()`;
        const query = _api => this.ws.query(_api);
        const resHandler = handler(JSON.parse, errMsgProp);
        const _getJoint = compose(then(resHandler), query);
        return _getJoint(api);
    }
}
