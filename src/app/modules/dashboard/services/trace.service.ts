import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse, hasNoError, ErrorFrame } from '../../core';
import { Observable, of, combineLatest, interval, Subject } from 'rxjs';
import { map as rxjsMap, catchError, takeUntil, mergeMap, debounceTime, startWith } from 'rxjs/operators';

export interface Trace {
    name: string,
    duration: number,
    rate: number
}

export interface TraceRes {
    name: string;
    dur: string;
    rate: string;
}

export interface SelectedItemRes {
    module: string, item: string, val: '0' | '1' | '2' | '3' | '4';
    show: '1' | '0';
}

export interface AvailableItemRes {
    item: string;
    show: '1' | '0';
}

export enum TraceStatus {
    NOTREADY = 'notReady',
    READY = 'ready',
    TRACEING = 'traceing',
    // DONE = 'done',
}

@Injectable()
export class TraceService {
    private stopCheck: Subject<boolean> = new Subject<boolean>();

    constructor(private ws: WebsocketService) { }

    public getTraceList(): Observable<Trace[]> {
        const api = '?TRACE_getBasicConfigInfo';
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => res.result),
            rxjsMap(str => JSON.parse(str)),
            rxjsMap((response: TraceRes[]) => response.map(res => (
                { name: res.name, duration: parseInt(res.dur), rate: parseInt(res.rate) } as Trace
            )))
        );
    }

    public getSelectedTraceName(): Observable<string> {
        const api = '?TRACE_getSelectedConfig';
        return this.ws.observableQuery(api).pipe(
            debounceTime(200),
            rxjsMap((res: MCQueryResponse) => res.result)
        );
    }

    public getRunningTraceName(): Observable<string> {
        const api = '?trace_getrunningconfig';
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => res.result)
        );
    }

    public getRateList(): Observable<number[]> {
        const api = '?TRACE_getRateOptions';
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => res.result),
            rxjsMap(res => JSON.parse(res).map(x => parseInt(x)))
        );
    }

    public createTrace({ name, duration, rate }): Observable<boolean> {
        const api = `TRACE_addConfig("${name}", ${duration}, ${rate})`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public deleteTrace(name: string): Observable<boolean> {
        const api = `TRACE_deleteConfig("${name}")`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public setSamplingTime({ name, rate }): Observable<boolean> {
        const api = `TRACE_setSamplingTime("${name}", ${rate})`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public setTotalRecTime({ name, duration }): Observable<boolean> {
        const api = `TRACE_setTotalRecTime("${name}", ${parseInt(duration)})`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public getSelectedConfig(name: string): Observable<boolean> {
        const api = `TRACE_selectConfig("${name}")`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public getModuleList(tab: 'TRIGGER' | 'CHANNEL'): Observable<string[]> {
        const api = `?TRACE_getModuleList("${tab}")`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res) ? JSON.parse(res.result) : []),
            catchError(() => of([]))
        );
    }

    public getTodoDoneList(tab: 'TRIGGER' | 'CHANNEL', moduleName: string, selectedTrace: string): Observable<any[][]> {
        const availableList = `?TRACE_getAvailableList("${tab}", "${moduleName}")`;
        const selectedList = `?TRACE_getSelectedList("${selectedTrace}", "${tab}")`;
        return combineLatest([this.ws.observableQuery(availableList), this.ws.observableQuery(selectedList)]).pipe(
            rxjsMap(([res1, res2]) => {
                const noError = hasNoError(res1 as MCQueryResponse) && hasNoError(res2 as MCQueryResponse);
                return noError ? [
                    JSON.parse((res1 as MCQueryResponse).result).map((x: AvailableItemRes) => ({
                        module: moduleName,
                        variable: x.item,
                        isIO: x.show === '1',
                    })),
                    JSON.parse((res2 as MCQueryResponse).result).map((x: SelectedItemRes) => ({
                        module: x.module,
                        variable: x.item,
                        turnOn: parseInt(x.val),
                        isIO: x.show === '1',
                    })),
                ] : [[], []];
            }),
            catchError(() => of([[], []]))
        );
    }

    public selectOne(trace, tab: 'TRIGGER' | 'CHANNEL', moduleName, variable, turnOn: 0 | 1 | 2 | 3 | 4): Observable<boolean> {
        const api = `TRACE_addTraceItem("${trace}", "${tab}", "${moduleName}", "${variable}", ${turnOn})`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public selectAllAxies(trace, tab: 'CHANNEL', moduleName, variable): Observable<boolean> {
        const api = `TRACE_addTraceAllItem("${trace}", "${tab}", "${moduleName}", "${variable}")`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public unselectOne(trace, tab: 'TRIGGER' | 'CHANNEL', moduleName, variable, turnOn: 0 | 1 | 2 | 3 | 4): Observable<boolean> {
        const api = `TRACE_deleteTraceItem("${trace}", "${tab}", "${moduleName}", "${variable}", ${turnOn})`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public unselectAll(trace, tab: 'TRIGGER' | 'CHANNEL'): Observable<boolean> {
        const api = `TRACE_deleteAllTraceItem("${trace}", "${tab}")`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public traceOnOff(trace: string, isOn: boolean): Observable<boolean> {
        const api = isOn ? `traceON_UI("${trace}")` : `?traceOff`;
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public startTrigger(): Observable<boolean> {
        const api = '?TRACE_pressTrigger';
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => hasNoError(res)),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(false);
            })
        );
    }

    public getTraceStatus(): Observable<TraceStatus> {
        const api = '?recording'; // 0: not ready, 1: ready, 2: tracing, 4: done.
        return this.ws.observableQuery(api).pipe(
            rxjsMap((res: MCQueryResponse) => {
                if (hasNoError(res)) {
                    switch (parseInt(res.result)) {
                        case 0: return TraceStatus.NOTREADY;
                        case 1: return TraceStatus.READY;
                        case 2: return TraceStatus.TRACEING;
                        case 4: return TraceStatus.TRACEING;
                        default: return TraceStatus.NOTREADY;
                    }
                } else {
                    return TraceStatus.NOTREADY;
                }
            }),
            catchError((err: ErrorFrame) => {
                console.warn(err);
                return of(TraceStatus.NOTREADY);
            })
        );
    }

    public startCheckTraceStatus(): Observable<TraceStatus> {
        return interval(1000).pipe(
            startWith(() => this.getTraceStatus()),
            mergeMap(() => this.getTraceStatus()),
            takeUntil(this.stopCheck)
        );
    }

    public stopCheckTraceStatus(): void {
        this.stopCheck.next(true);
    }

}