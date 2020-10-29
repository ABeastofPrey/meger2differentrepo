import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from '../../../modules/core/services/websocket.service';
import { ApiService } from '../../../modules/core/services/api.service';
import { Observable, combineLatest, of, from, interval, zip } from 'rxjs';
import { map as rxjsMap, catchError, mergeAll, startWith } from 'rxjs/operators';
import { SystemLog, ErrHistory, LogType, LogSource, WebServerLog } from '../enums/sys-log.model';
import {
    reduce, compose, prop, map, split, slice, join, dropLastWhile, dropLast, take,
    complement, equals, __, lt, concat, sort, descend, addIndex, filter, into,
    transpose, useWith,
} from 'ramda';
import { isOdd, isEven } from 'ramda-adjunct';

const leftHandler = (msg: string) => catchError(err => {
    console.warn(`${msg}: ${err}`);
    return of([]);
}) as any;

const rightHandler = handler => rxjsMap((res: MCQueryResponse) => handler(res.result));

const maxConfirmCountPerTime = 40;

const mappingType = (errType: string) => {
    let logType: LogType;
    switch (errType.toLowerCase()) {
        case 'fatal fault': logType = 'error'; break;
        case 'fault': logType = 'error'; break;
        case 'error': logType = 'error'; break;
        case 'note': logType = 'warning'; break;
        case 'info': logType = 'information'; break;
        default: console.warn('undefined error type: ', errType.toLowerCase());
    }
    return logType;
};
const mappingSource = (errCode: number) => {
    let logSource: LogSource;
    if (errCode >= 19000 && errCode <= 19999) {
        logSource = 'drive';
    } else if (errCode >= 20000 && errCode <= 20999) {
        logSource = 'lib';
    } else {
        logSource = 'firmware'
    }
    return logSource;
};
const setUTCMonth = ([date, month, year]) => [year, parseInt(month) - 1, date];
const convertDate = compose(join('/'), setUTCMonth, split('/'));
const convertTime = compose(dropLast(1), dropLastWhile(complement(equals('.'))));
const contertTimestampByUTCTime = ([yar, mon, day, hor, min, sec]) => Date.UTC(yar, mon, day, hor, min, sec);
const convertErrHistoryLog = (err: ErrHistory): SystemLog => {
    const errDate = convertDate(err.date);
    const errTime = convertTime(err.time);
    const splitDate = split('/', errDate);
    const splitTime = split(':', errTime);
    const dataTime = concat(splitDate, splitTime);
    const log: SystemLog = {
        id: err.uuid,
        code: err.code,
        date: errDate,
        time: errTime,
        timestamp: contertTimestampByUTCTime(dataTime),
        source: mappingSource(err.code),
        type: mappingType(err.severity),
        module: err.module,
        message: err.message,
        task: err.task,
        file: err.file,
        line: err.line,
        sernum: err.sernum,
        isNotMaintenance: true,
    };
    return log;
};

@Injectable()
export class SysLogFetchService {

    constructor(private ws: WebsocketService, private apiService: ApiService) { }

    public fetchConfirmedIds(): Observable<string[]> {
        const api = '?getConfirmId';
        return this.ws.observableQuery(api).pipe(
            leftHandler('Get confirmedId failed'),
            rightHandler(JSON.parse)
        );
    }

    public fetchMaintenceConfirmedIds(): Observable<string[]> {
        const api = '?mntn_getconfirmID';
        return this.ws.observableQuery(api).pipe(
            leftHandler('Get confirmedId failed'),
            rightHandler(JSON.parse)
        );
    }

    public clearSysLog(): Observable<boolean> {
        this.apiService.clearLog().catch(err => {
            console.warn(err);
        });
        const api = '?clearLog';
        const converter = compose(x => !!x, Number);
        return this.ws.observableQuery(api).pipe(
            leftHandler('Clear system log failed'),
            rightHandler(converter));
    }

    public async clearDriveFault(): Promise<MCQueryResponse> {
        await this.ws.query('?TP_CLRFAULT');
        return this.ws.query('call TP_CONFIRM_ERROR');
    }

    public setConfirmId(id: string, needConfirmErr: boolean): Observable<boolean> {
        if (id === undefined) {
            console.warn('Try to confirm with undefined id');
            return of(false);
        } else {
            return Observable.create(observer => {
                this.ws.query(`call setConfirmID("${id}")`).then(res => {
                    this.ws.query('?saveConfirmId').then(() => {
                        if (needConfirmErr) {
                            this.ws.query('call TP_CONFIRM_ERROR');
                        }
                        observer.next(true);
                    });
                }).catch(err => {
                    console.warn(err);
                    observer.next(false);
                });
            })
        }
    }

    public setConfirmIdList(ids: string[], needConfirmErr: boolean): Observable<boolean> {
        if (ids.length === 0) return of(false);
        const obQuery = api => this.ws.observableQuery(api);
        const assembleConfirmIds = (id: string[], res: any[]): any[] => {
            const curConfirm = slice(0, maxConfirmCountPerTime, id);
            const ntxConfirm = slice(maxConfirmCountPerTime, id.length, id);
            const idxFilter = addIndex(filter);
            const eveArrLog = idxFilter((x, i) => isEven(i));
            const oddArrLog = idxFilter((x, i) => isOdd(i));
            const transduce = reduce((acc, x) => `${acc}${x},`, '');
            const trans2Arr = (a, b) => [a, b];
            const addCommas = into([], map(transduce));
            const trans2Str = reduce((acc, x) => `${acc}"${x}"+`, '');
            const dropLastS = str => dropLast(3, str) + '"';
            const transposE = compose(dropLastS, trans2Str, addCommas, transpose, trans2Arr);
            const finalStr = useWith(transposE, [eveArrLog, oddArrLog])(curConfirm, curConfirm);
            const queryApi = `call setConfirmID(${finalStr})`;
            res.push(queryApi);
            return (ntxConfirm.length !== 0) ? assembleConfirmIds(ntxConfirm, res) : res;
        }
        return Observable.create(observer => {
            const onError = err => {
                console.warn(err);
                observer.next(false);
                observer.error(err);
            };
            const onComplete = () => {
                observer.next(true);
                observer.complete();
                needConfirmErr && this.ws.query('call TP_CONFIRM_ERROR');
            };
            const saveConfirmId = () => {
                this.ws.observableQuery('?saveConfirmId').subscribe(null, onError, onComplete);
            };
            zip(
                from(assembleConfirmIds(ids, [])), interval(20).pipe(startWith(-1))
            ).pipe(
                rxjsMap(([api]) => obQuery(api)), mergeAll()
            ).subscribe(null, onError, saveConfirmId);
        });
    }

    public fetchAllSysLog(): Observable<SystemLog[]> {
        return combineLatest([
            this.fetchFromWebserver(),
            this.fetchFromErrHistory(),
            this.fetchFromLibMaintenance(),
        ]).pipe(
            rxjsMap(
                ([webSerLog, errHisLog, maiLog]) => [...webSerLog, ...errHisLog, ...maiLog]
            ),
            rxjsMap(sort(descend(prop('timestamp')))),
            // rxjsMap(take(1000))
        );
    }

    public fetchErrHistoryAndMaintenaceLogs(): Observable<SystemLog[]> {
        return combineLatest([
            this.fetchFromErrHistory(),
            this.fetchFromLibMaintenance(),
        ]).pipe(
            rxjsMap(
                ([errHisLog, maiLog]) => [...errHisLog, ...maiLog]
            ),
            rxjsMap(sort(descend(prop('timestamp')))),
            rxjsMap(take(1000))
        );
    }

    private fetchFromWebserver(): Observable<SystemLog[]> {
        const api = '/cs/api/log';
        const lt10 = lt(__, 10);
        const convertDate = timestamp => {
            const date = new Date(timestamp);
            const year = date.getUTCFullYear();
            const moth = date.getUTCMonth() + 1;
            const uDay = date.getUTCDate();
            return `${year}/${lt10(moth) ? `0${moth}` : moth}/${lt10(uDay) ? `0${uDay}` : uDay}`;
        };
        const convertTime = timestamp => {
            const date = new Date(timestamp);
            const hors = date.getUTCHours();
            const mins = date.getUTCMinutes();
            const secs = date.getUTCSeconds();
            return `${lt10(hors) ? `0${hors}` : hors}:${lt10(mins) ? `0${mins}` : mins}:${lt10(secs) ? `0${secs}` : secs}`;
        };
        const convertWebLog = (_log: WebServerLog): SystemLog => {
            const [msg, extra] = split(';', _log.msg);
            const paras = extra ? split(',', extra) : [];
            const log: SystemLog = {
                id: _log.UUID,
                date: convertDate(_log.time),
                time: convertTime(_log.time),
                timestamp: _log.time,
                source: 'webServer',
                type: 'information',
                module: 'Web Server',
                isNotMaintenance: true,
                message: msg,
                userName: _log.username,
                paras,
            };
            return log;
        };
        const converter = (res: WebServerLog[]): SystemLog[] => map(convertWebLog, res);
        return this.apiService.get(api).pipe(
            rxjsMap(converter),
            leftHandler('Get system log from webserver failed')
        );
    }

    public fetchFromErrHistory(api: string = '?errorhistory$(1)'): Observable<SystemLog[]> {
        // const api = '?errorhistory$(1)';
        //console.log(api)
        const getErr = res => {
            if (res === 'No error history') {
                return [];
            } else {
                return compose(prop('error'), JSON.parse)(res);
            }
        };
        const converter = (res: ErrHistory[]): SystemLog[] => map(convertErrHistoryLog, res);
        return this.ws.observableQuery(api)
            .pipe(rightHandler(getErr))
            .pipe(leftHandler('Get errorhistory failed'))
            .pipe(rxjsMap(converter));
    }

    public fetchFromLibMaintenance(): Observable<SystemLog[]> {
        const api = '?mntn_log';
        const parser = compose(prop('error'), JSON.parse);
        const disableConfirm = (x: SystemLog) => ({ ...x, isNotMaintenance: false });
        const converter = map(compose(disableConfirm, convertErrHistoryLog));
        return this.ws.observableQuery(api).pipe(
            rightHandler(parser),
            leftHandler('Get errorhistory failed')
        ).pipe(
            rxjsMap(converter)
        );
    }
}
