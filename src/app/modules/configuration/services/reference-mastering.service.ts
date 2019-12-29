import { Injectable } from '@angular/core';
import { WebsocketService } from '../../core/services/websocket.service';
import { DataService } from '../../core/services/data.service';
import { handler, errMsgProp } from '../../core/services/service-adjunct';
import { compose, then, identity, split } from 'ramda';

@Injectable()
export class ReferenceMasteringService {
  private robot: string;
  constructor(private ws: WebsocketService, private dataService: DataService) {
    this.robot = this.dataService.selectedRobot;
  }

  async retrieveAxisInfo() {
    const api = `?MT_getAxisInfo(${this.robot})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(JSON.parse, errMsgProp);
    const _retrieveAxisInfo = compose(
      then(resHandler),
      query
    );
    return _retrieveAxisInfo(api);
  }

  async masterZero([j1, j2, j3, j4]: Array<0 | 1>) {
    const api = `MT_master_zero(${this.robot}, ${j1}, ${j2}, ${j3}, ${j4})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _masterZero = compose(
      then(resHandler),
      query
    );
    return _masterZero(api);
  }

  async masterFinal([j1, j2, j3, j4]: Array<0 | 1>) {
    const api = `MT_master_final(${this.robot}, ${j1}, ${j2}, ${j3}, ${j4})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _masterZero = compose(
      then(resHandler),
      query
    );
    return _masterZero(api);
  }

  async recordPoint() {
    const api = `MT_recordPoint(${this.robot}, 2)`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _recordPoint = compose(
      then(resHandler),
      query
    );
    return _recordPoint(api);
  }

  async masterLeftRight() {
    const api = `MT_master_left_right(${this.robot})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _masterLeftRight = compose(
      then(resHandler),
      query
    );
    return _masterLeftRight(api);
  }

  async resetOriginal() {
    const api = `MT_resetOriginal(${this.robot})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _resetOriginal = compose(
      then(resHandler),
      query
    );
    return _resetOriginal(api);
  }

  async fetchReferencePoints() {
    const api = '?tp_get_project_joints("ALL")';
    const query = _api => this.ws.query(_api);
    const resHandler = handler(split(','), errMsgProp);
    const _resetOriginal = compose(
      then(resHandler),
      query
    );
    return _resetOriginal(api);
  }

  async setReferencePoint(point: string) {
    const api = `mt_setref("${point}")`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _setReferencePoint = compose(
      then(resHandler),
      query
    );
    return _setReferencePoint(api);
  }

  async getReferencePoint(): Promise<string> {
    const api = '?mt_getref';
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _getReferencePoint = compose(
      then(resHandler),
      query
    );
    return _getReferencePoint(api);
  }

  async initRobot() {
    const api = `mt_init(${this.robot})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _initRobot = compose(
      then(resHandler),
      query
    );
    return _initRobot(api);
  }

  async moveToRef(isBasicMode = true) {
    const api = isBasicMode
      ? `mt_movetoref(${this.robot})`
      : `mt_movetorefopposite(${this.robot})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _moveToRef = compose(
      then(resHandler),
      query
    );
    return _moveToRef(api);
  }

  async isMoveing() {
    const api = `?${this.robot}.ismoving`;
    const converter = (x: number) => !!x;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(
      compose(
        converter,
        Number
      ),
      errMsgProp
    );
    const _isMoveing = compose(
      then(resHandler),
      query
    );
    return _isMoveing(api);
  }

  async getCommand() {
    const api = `?mt_getcommand(${this.robot})`;
    const query = _api => this.ws.query(_api);
    const resHandler = handler(identity, errMsgProp);
    const _getCommand = compose(
      then(resHandler),
      query
    );
    return _getCommand(api);
  }
}
