import { Injectable, EventEmitter } from '@angular/core';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../core/services/websocket.service';
import {
  hasError,
  handler,
  errMsgProp,
  Right,
  Left,
} from '../../core/services/service-adjunct';
import { compose, map, prop, always, dropLast, split, tap, then } from 'ramda';
import { Either } from 'ramda-fantasy';

// tslint:disable-next-line: interface-name
export interface IResPLS {
  index: number;
  PLSname: string; // name
  Source: string;
  DigitalOut: number; // selected output
  Position: number; // distance
  Polarity: number; // selected state
  RelatedTo: number; // selected from
  Output: number[];
}

@Injectable()
export class PositionTriggerService {
  // Notify the observer who should update table data or not.
  // public broadcaster = new EventEmitter<boolean>();

  private query: Function;
  private cud: Function; // create update delete

  constructor(private ws: WebsocketService) {
    this.query = _api => this.ws.query(_api);
    const resHandler = handler(JSON.parse, errMsgProp);
    this.cud = compose(then(resHandler), this.query);
  }

  public async createPls(name: string) {
    const api = `?PLS_create("${name}")`;
    const res = <MCQueryResponse>await this.ws.query(api);
    return this.bindIO(res);
  }

  public async updatePls({
    name,
    distance,
    selectedOutput,
    selectedState,
    selectedFrom,
    selectedSourceType,
  }: any): Promise<any> {
    const api = `?Pls_update("${name}", ${selectedOutput}, ${distance}, ${selectedState}, ${selectedFrom}, "${selectedSourceType}")`; // position is distance.
    const res = <MCQueryResponse>await this.ws.query(api);
    return this.bindIO(res);
  }

  public async deletePls(names: string[]) {
    const namesPara = names.map(x => `"${x},"`).reduce((acc, x) => `${acc}${x}+`, '').slice(0, -3) + '"';
    const api = `?Deleterow(${namesPara})`;
    const res = <MCQueryResponse>await this.ws.query(api);
    return this.bindIO(res);
  }

  public async retrievePls() {
    const api = '?PLS_getTable';
    const res = <MCQueryResponse>await this.ws.query(api);
    return this.bindIO(res);
  }

  private async bindIO(res: MCQueryResponse): Promise<any> {
    const ios = await this.retrieveIos();
    if (hasError(res)) {
      return Left(res.result);
    } else if (Either.isLeft(ios)) {
      return ios;
    } else {
      let iosList: number[];
      Either.either(() => (iosList = []), val => (iosList = val))(ios);
      const plsRes = map(x => {
        x.Output = iosList;
        // x.PLSsource = 'Time';
        return x;
      }, JSON.parse(res.result)) as IResPLS[];
      return Right(plsRes);
    }
  }

  /**
   * Retrive IOs from service.
   *
   * @param {number} [io=0] // 0 standard for output, 1 standards input.
   * @returns {Promise<any>}
   * @memberof MotionTriggerService
   */
  private async retrieveIos(io = 0) {
    const api = `?IOMAP_GET_IOS_NUMBERS_STRING(${io})`;
    const parseIos = compose(
      map(Number),
      dropLast(1),
      split(','),
      dropLast(1)
    );
    const resHandler = handler(parseIos, errMsgProp);
    const retrieve = compose(then(resHandler), this.query);
    return retrieve(api);
  }

  public async plsNameList(): Promise<string[]> {
    return Either.either(always([]), map(prop('PLSname')))(
      await this.retrievePls()
    );
  }
}
