import { Injectable, EventEmitter } from '@angular/core';
import { WebsocketService, MCQueryResponse } from '../../core/services/websocket.service';

import { complement, compose, equals, toLower, map, prop, always, dropLast, split } from 'ramda';
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
const { Left, Right } = Either;
const first5Letter = x => x.substring(0, 5);
const hasError = compose(equals('error'), toLower, first5Letter);
const hasNoError = complement(hasError);

@Injectable()
export class PositionTriggerService {
    // Notify the observer who should update table data or not.
    public broadcaster = new EventEmitter<boolean>();

    constructor(private ws: WebsocketService) { }

    public async createPls(name: string): Promise<any> {
        const api = `?PLS_create("${name}")`;
        const { result } = <MCQueryResponse>await this.ws.query(api);
        if (hasNoError(result)) {
            this.broadcaster.emit(true);
            return Right('Create successfully.');
        } else {
            return Left(result);
        }
    }

    public async updatePls({name, distance, selectedOutput, selectedState, selectedFrom}): Promise<any> {
        const api = `?Pls_update("${name}", ${selectedOutput}, ${distance}, ${selectedState}, ${selectedFrom})`; // position is distance.
        const { result } = <MCQueryResponse>await this.ws.query(api);
        if (hasNoError(result)) {
            this.broadcaster.emit(true);
            return Right('Update successfully.');
        } else {
            return Left(result);
        }
    }

    public async deletePls(name: string): Promise<any> {
        const api = `?Deleterow("${name}")`;
        const { result } = <MCQueryResponse>await this.ws.query(api);
        if (hasNoError(result)) {
            this.broadcaster.emit(true);
            return Right('Delete successfully.');
        } else {
            return Left(result);
        }
    }

    public async retrievePls(): Promise<any> {
        const api = '?PLS_getTable';
        const { result: plsRes } = <MCQueryResponse>await this.ws.query(api);
        const ios = await this.retrieveIos();
        if (hasError(plsRes)) {
            return Left(plsRes);
        } else if (Either.isLeft(ios)) {
            return ios;
        } else {
            let iosList: number[];
            Either.either(
                () => iosList = [],
                val => iosList = val
            )(ios);
            const res = <IResPLS[]>map(x => {
                x.Output = iosList;
                return x;
            }, JSON.parse(plsRes));
            return Right(res);
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
        const { result } = <MCQueryResponse>await this.ws.query(api);
        if (hasNoError(result)) {
            const parseIos = compose(map(Number), dropLast(1), split(','), dropLast(1));
            return Right(parseIos(result));
        } else {
            return Left(result);
        }
    }

    public async plsNameList(): Promise<string[]> {
        return Either.either(
            always([]),
            map(prop('PLSname'))
        )(await this.retrievePls());
    }
}
