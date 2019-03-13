import { Injectable, EventEmitter } from '@angular/core';
import { WebsocketService, MCQueryResponse } from '../../core/services/websocket.service';
import { hasError, handler, errMsgProp, Right, Left } from './service-adjunct';
import { compose, map, prop, always, dropLast, split, tap, then } from 'ramda';
import { Either } from 'ramda-fantasy';

export interface IResPLS {
    index: number;
    PLSname: string; // name
    DigitalOut: number; // selected output
    Position: number; // distance
    Polarity: number; // selected state
    RelatedTo: number; // selected from
    Output: number[];
}

@Injectable()
export class PositionTriggerService {
    // Notify the observer who should update table data or not.
    public broadcaster = new EventEmitter<boolean>();

    private query: any;
    private cud: any; // create update delete

    constructor(private ws: WebsocketService) {
        const commonHandler = handler(tap(() => this.broadcaster.emit(true)), errMsgProp);
        this.query = _api => this.ws.query(_api);
        this.cud = compose(then(commonHandler), this.query);
    }

    public async createPls(name: string): Promise<any> {
        const api = `?PLS_create("${name}")`;
        return this.cud(api);
    }

    public async updatePls({name, distance, selectedOutput, selectedState, selectedFrom}): Promise<any> {
        const api = `?Pls_update("${name}", ${selectedOutput}, ${distance}, ${selectedState}, ${selectedFrom})`; // position is distance.
        return this.cud(api);
    }

    public async deletePls(name: string): Promise<any> {
        const api = `?Deleterow("${name}")`;
        return this.cud(api);
    }

    public async retrievePls(): Promise<any> {
        const api = '?PLS_getTable';
        const res = <MCQueryResponse>await this.ws.query(api);
        const ios = await this.retrieveIos();
        if (hasError(res)) {
            return Left(res.result);
        } else if (Either.isLeft(ios)) {
            return ios;
        } else {
            let iosList: number[];
            Either.either(
                () => iosList = [],
                val => iosList = val
            )(ios);
            const plsRes = <IResPLS[]>map(x => {
                x.Output = iosList;
                return x;
            }, JSON.parse(res.result));
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
    public async retrieveIos(io = 0): Promise<any> {
        const api = `?IOMAP_GET_IOS_NUMBERS_STRING(${io})`;
        const parseIos = compose(map(Number), dropLast(1), split(','), dropLast(1));
        const resHandler = handler(parseIos, errMsgProp);
        const retrieve = compose(then(resHandler), this.query);
        return retrieve(api);
    }

    public async plsNameList(): Promise<string[]> {
        return Either.either(always([]), map(prop('PLSname')))(await this.retrievePls());
    }
}
