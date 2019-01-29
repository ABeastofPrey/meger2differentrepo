import { WebsocketService, MCQueryResponse } from '../../../modules/core/services/websocket.service';
import { Injectable } from '@angular/core';
import { compose, map, ifElse, isEmpty, identity } from 'ramda';
import { Either } from 'ramda-fantasy';
import { hasNoError } from './service-adjunct';

const { Left, Right } = Either;
const parseNum = ifElse(isEmpty, identity, Number);
const parseRes = compose(map(parseNum), JSON.parse);

@Injectable()
export class HomeSettingService {
    constructor(private ws: WebsocketService) { }

    public async getHomePostion(): Promise<number[]> {
        const api = '?getAllHome';
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right(parseRes(result)) : Left(result);
    }

    public async getHomeOrder(): Promise<number[]> {
        const api = '?getAllHomeOrder';
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right(parseRes(result)) : Left(result);
    }

    public async updateHomePostion(index: number, value: number): Promise<any> {
        const api = `setHome(${index}, ${value})`;
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right('Successfully updated home position.') : Left(result);
    }

    public async clearHomePosition(index: number): Promise<any> {
        const api = `clearHome(${index})`;
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right('Successfully clear home position.') : Left(result);
    }

    public async updateHomeOrder(index: number, value: number): Promise<any> {
        const api = `setHomeOrder(${index}, ${value})`;
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right('Successfully updated home order.') : Left(result);
    }

    public async readCurrentPosition(): Promise<any> {
        const api = '?HM_readCurrentPosition';
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right(parseRes(result)) : Left(result);
    }

    public async getPositionMax(index: number): Promise<any> {
        const api = `?maingroup.j${index}.pmax`;
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right(Number(result)) : Left(result);
    }

    public async getPositionMin(index: number): Promise<any> {
        const api = `?maingroup.j${index}.pmin`;
        const { result } = <MCQueryResponse>await this.ws.query(api);
        return hasNoError(result) ? Right(Number(result)) : Left(result);
    }
}
