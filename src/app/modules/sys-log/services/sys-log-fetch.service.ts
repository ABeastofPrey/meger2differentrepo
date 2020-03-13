import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from '../../../modules/core/services/websocket.service';
import { ApiService } from '../../../modules/core/services/api.service';
import { Observable, combineLatest, of } from 'rxjs';
import { map as rxjsMap, catchError } from 'rxjs/operators';
import { SystemLog, ErrHistory, LogType, LogSource, WebServerLog } from '../enums/sys-log.model';
import {
    reduce, compose, prop, map, split, slice, join, dropLastWhile, dropLast, take,
    complement, equals, __, lt, concat, sort, descend, addIndex, filter, into,
    transpose, useWith,
} from 'ramda';
import { isArray, isOdd, isEven } from 'ramda-adjunct';

const leftHandler = (msg: string) => catchError(err => {
    console.warn(`${msg}: ${err}`);
    return of([]);
}) as any;

const rightHandler = handler => rxjsMap((res: MCQueryResponse) => handler(res.result));

const maxConfirmCountPerTime = 40;

@Injectable()
export class SysLogFetchService {

    constructor(private ws: WebsocketService, private apiService: ApiService) { }

    public fetchSysLog(): Observable<SystemLog[]> {
        return combineLatest([this.fetchFromWebserver(), this.fetchFromErrHistory()])
            .pipe(rxjsMap(([webServerLog, errHistoryLog]) => concat(webServerLog, errHistoryLog)))
            .pipe(rxjsMap(sort(descend(prop('timestamp')))))
            .pipe(rxjsMap(take(1000)));
    }

    public fetchConfirmedIds(): Observable<string[]> {
        const api = '?getConfirmId';
        return this.ws.observableQuery(api)
            .pipe(leftHandler('Get confirmedId failed'))
            .pipe(rightHandler(JSON.parse));
    }

    public setConfirmId(id: string | string[], needConfirmErr: boolean): void {
        const confirmId = api => this.ws.query(api);
        if (id === undefined) {
            console.warn('Try to confirm with undefined id');
            return;
        } else if (isArray(id)) {
            const curConfirm = slice(0, maxConfirmCountPerTime, id);
            const ntxConfirm = slice(maxConfirmCountPerTime, id.length, id);

            const idxFilter = addIndex(filter);
            const eveArrLog = idxFilter((x, i) => isEven(i));
            const oddArrLog = idxFilter((x, i) => isOdd(i));
            const transduce = reduce((acc, x) => `${acc}${x},`, '');
            const trans2Arr = (a, b) => [a, b];
            const addCommas = into([], map(transduce));
            const trans2Str = reduce((acc, x)=> `${acc}"${x}"+`, '');
            const dropLastS = str => dropLast(3, str) + '"';
            const transposE = compose(dropLastS, trans2Str, addCommas, transpose, trans2Arr);
            const finalStr = useWith(transposE, [eveArrLog, oddArrLog])(curConfirm, curConfirm);
            const queryApi = `call setConfirmID(${finalStr})`;
            confirmId(queryApi).then(() => {
                if (ntxConfirm.length !== 0) {
                    setTimeout(() => {
                        this.setConfirmId(ntxConfirm, needConfirmErr);
                    }, 10);
                } else {
                    this.ws.query('?saveConfirmId').then(() => {
                        if (needConfirmErr) {
                            this.ws.query('?TP_CONFIRM_ERROR');
                        }
                    });
                }
            }).catch(err => {
                console.warn(err);
            });
        } else {
            confirmId(`call setConfirmID("${id}")`).then(res => {
                this.ws.query('?saveConfirmId').then(() => {
                    if (needConfirmErr) {
                        this.ws.query('?TP_CONFIRM_ERROR');
                    }
                });
            }).catch(err => {
                console.warn(err);
            });
        }
    }

    public clearSysLog(): Observable<boolean> {
        this.apiService.clearLog().catch(err => {
            console.warn(err);
        });
        const api = '?clearLog';
        const converter = compose(x => !!x, Number);
        return this.ws.observableQuery(api)
            .pipe(leftHandler('Clear system log failed'))
            .pipe(rightHandler(converter));
    }

    public async clearDriveFault(): Promise<void> {
        await this.ws.query('?TP_CLRFAULT');
        this.ws.query('?TP_CONFIRM_ERROR');
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
        const convertLog = (_log: WebServerLog): SystemLog => {
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
                message: msg,
                userName: _log.username,
                paras,
            };
            return log;
        };
        const converter = (res: WebServerLog[]): SystemLog[] => map(convertLog, res);
        return this.apiService.get(api)
            .pipe(rxjsMap(converter))
            .pipe(leftHandler('Get system log from webserver failed'));
    }

    private fetchFromErrHistory(): Observable<SystemLog[]> {
        const api = '?errorhistory$(1)';
        const getErr = res => {
            if (res === 'No error history') {
                return [];
            } else {
                return compose(prop('error'), JSON.parse)(res);
            }
        };
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
        const convertLog = (err: ErrHistory): SystemLog => {
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
            };
            return log;
        };
        const converter = (res: ErrHistory[]): SystemLog[] => map(convertLog, res);
        return this.ws.observableQuery(api)
            .pipe(rightHandler(getErr))
            .pipe(leftHandler('Get errorhistory failed'))
            .pipe(rxjsMap(converter));
    }
}
