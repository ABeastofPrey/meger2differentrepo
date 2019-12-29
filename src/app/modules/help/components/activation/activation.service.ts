import { Injectable } from '@angular/core';
import { handler, errMsgProp } from '../../../core/services/service-adjunct';
import { compose, then, identity } from 'ramda';
import { WebsocketService } from '../../../core/services/websocket.service';

@Injectable()
export class ActivationService {
  constructor(private ws: WebsocketService) {}

  async getMachineId() {
    const api = '?sys.serialnumber';
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const retrieveID = compose(
      then(resHandler),
      query
    );
    return retrieveID(api);
  }

  async getKey() {
    const api = '?ACT_getKey';
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const retrieveKey = compose(
      then(resHandler),
      query
    );
    return retrieveKey(api);
  }

  async setKey(key: string) {
    const api = `ACT_setKey("${key}")`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const saveKey = compose(
      then(resHandler),
      query
    );
    return saveKey(api);
  }
}
