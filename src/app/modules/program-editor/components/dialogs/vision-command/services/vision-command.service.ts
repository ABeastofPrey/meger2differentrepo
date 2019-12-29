import { Injectable } from '@angular/core';
import { VisionCommand } from '../models/vision-command.model';
import { map, addIndex, compose, prop } from 'ramda';
import { Observable, combineLatest, of } from 'rxjs';
import { map as rxjsMap, catchError } from 'rxjs/operators';
import { CommandOptions } from '../enums/command-type.enum';
import { WebsocketService } from '../../../../../core/services/websocket.service';
import { DataService, MCQueryResponse } from '../../../../../core/services';

@Injectable()
export class VisionCommandService {
    constructor(private ws: WebsocketService, private ds: DataService) { }

    retrieveVisionCommandList(): Observable<VisionCommand[]> {
        const queries = [
            this.getStationAndJob(),
            this.getVariables(),
            this.getDimensions(),
            this.getDataNums(),
            this.getAsDatas(),
            this.getStatus(),
            this.getErrors(),
        ];
        return combineLatest(queries).pipe(
            rxjsMap(([stationJob, variables, dimensions, dataNums, asDatas, statusList, errors]) => {
                const mapIndexed = addIndex(map);
                const assembleModel = (stationJob, id) => Object.assign({
                    id,
                    ...stationJob,
                    dimensions, dataNums, asDatas,
                    statusList, errors, variables,
                    [CommandOptions.Job]: null,
                    [CommandOptions.Dimension]: null,
                    [CommandOptions.DataNum]: null,
                    [CommandOptions.AsData]: null,
                    [CommandOptions.Status]: null,
                    [CommandOptions.Error]: null,
                    [CommandOptions.Variable]: null,
                    [CommandOptions.Timeout]: null,
                });
                return mapIndexed(assembleModel, stationJob);
            })
        );
    }

    getStationAndJob(): Observable<Array<{ [CommandOptions.Station], jobNames: string[] }>> {
        const api = '?VGetStationTree';
        const getStation = (x: { stationName: string, jobs: string[] }) => Object({
            stationName: x.stationName,
            jobNames: [...x.jobs]
        });
        const parser = compose(map(getStation), prop('stations'), JSON.parse);
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => parser(res.result)),
            catchError(err => {
                console.warn(`Get Station Tree failed: ${err.msg}`);
                return of([])
            })
        );
    }

    getDimensions(): Observable<string[]> {
        const notArrLongs = this.ds.longs.filter(x => !x.isArr);
        const dimNamelist = map(prop('name'), notArrLongs);
        return of(dimNamelist);
    }

    getDataNums(): Observable<string[]> {
        const notArrLongs = this.ds.longs.filter(x => !x.isArr);
        const namelist = map(prop('name'), notArrLongs);
        return of(namelist);
    }

    getAsDatas(): Observable<string[]> {
        const notArrLongs = this.ds.strings.filter(x => x.isTwoDimension);
        const namelist = map(prop('name'), notArrLongs);
        return of(namelist);
    }

    getStatus(): Observable<string[]> {
        const notArrLongs = this.ds.strings.filter(x => !x.isArr);
        const namelist = map(prop('name'), notArrLongs);
        return of(namelist);
    }

    getErrors(): Observable<string[]> {
        const notArrLongs = this.ds.strings.filter(x => !x.isArr);
        const namelist = map(prop('name'), notArrLongs);
        return of(namelist);
    }

    getVariables(): Observable<string[]> {
        const notArrLongs = this.ds.longs.filter(x => !x.isArr);
        const dimNamelist = map(prop('name'), notArrLongs);
        return of(dimNamelist);
    }
}
