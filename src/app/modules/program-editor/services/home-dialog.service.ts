import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from '../../core/services/websocket.service';
import { hasNoError, Left, Right } from './service-adjunct';

@Injectable()
export class HomeDialogService {
    constructor(private ws: WebsocketService) { }

    public async retrieveVelocityMax(): Promise<any> {
        const api = '?maingroup.VELOCITYMAX';
        const { result } = <MCQueryResponse>await this.ws.query(api);
        if (hasNoError(result)) {
            return Right(JSON.parse(result));
        } else {
            return Left(result);
        }
    }
}
