import { Component, OnInit } from '@angular/core';
import { Observable, zip, from, of } from 'rxjs';
import { map as rxjsMap, tap } from 'rxjs/operators';
import { TraceService, Trace, TraceStatus } from '../../../services/trace.service';
import { MatDialog } from '@angular/material';
import { isNotUndefined, isUndefined } from 'ramda-adjunct';
import { YesNoDialogComponent } from '../../../../../components/yes-no-dialog/yes-no-dialog.component';

@Component({
    selector: 'app-trace-common',
    templateUrl: './trace-common.component.html',
    styleUrls: ['./trace-common.component.scss']
})
export class TraceCommonComponent implements OnInit {
    private firstRate: number;
    public unknowTracing = false;
    public addingNewTrace = false;
    public isValid = true;
    public selectedTrace: Trace;
    public traceLimit = 10;
    public runningTraceName: string = '';
    public TraceStatus = TraceStatus;
    public curTraceStatus: TraceStatus = TraceStatus.NOTREADY;
    public traceList: Observable<Trace[]>;
    public rateList: Observable<number[]>;

    constructor(
        private service: TraceService,
        private dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this.traceList = this.service.getTraceList();
        zip(
            this.service.getSelectedTraceName(),
            this.traceList
        ).pipe(rxjsMap(
            ([name, traces]) => traces.find(x => x.name === name)
        )).subscribe(trace => {
            this.selectedTrace = trace;
        });
        this.rateList = this.service.getRateList().pipe(tap(rateList => {
            this.firstRate = rateList[0];
        }));
        const checkState = status => {
            zip(this.service.getRunningTraceName(), this.traceList).subscribe(([runningTrace, traces]) => {
                this.runningTraceName = runningTrace;
                this.unknowTracing = false;
                const finded = traces.find(x => x.name === runningTrace);
                if (isNotUndefined(finded)) {
                    this.changeSelectedTrace({ value: finded.name });
                } else if (isUndefined(finded) && status === TraceStatus.TRACEING || status === TraceStatus.READY) {
                    this.curTraceStatus = TraceStatus.NOTREADY;
                    this.unknowTracing = true;
                    return;
                }
                this.curTraceStatus = status;
            });
        };
        this.service.startCheckTraceStatus().subscribe(checkState);
    }

    ngOnDestroy(): void {
        this.service.stopCheckTraceStatus();
    }

    public deleteTrace(event: MouseEvent, trace: Trace): void {
        event.stopPropagation();
        this.dialog.open(YesNoDialogComponent, {
            data: {
                title: 'dashboard.trace.common.delete_trace',
                titlePara: trace.name,
                msg: 'dashboard.trace.common.delete_trace_msg',
                yes: 'button.delete', no: 'button.cancel',
            },
        }).afterClosed().subscribe(res => {
            if (res === true) {
                this.service.deleteTrace(trace.name).subscribe((success: boolean) => {
                    // if (!success) return;
                    const filterTrace = (traces: Trace[]) => traces.filter(x => x.name !== trace.name);
                    from(this.traceList).pipe(
                        rxjsMap(filterTrace),
                        tap(traces => {
                            const selectedTraceName = this.selectedTrace ? this.selectedTrace.name : '';
                            this.selectedTrace = traces.find(x => x.name === selectedTraceName);
                        })
                    ).subscribe(res => {
                        this.traceList = of(res);
                    });
                });
            }
        });
    }

    public addTrace(event: MouseEvent): void {
        event.stopPropagation();
        from(this.traceList).subscribe(res => {
            if (res.length >= this.traceLimit) return;
            this.addingNewTrace = !this.addingNewTrace;
        })
    }

    public createTrace(name): void {
        const trace: Trace = { name, duration: 30, rate: this.firstRate };
        this.service.createTrace(trace).subscribe((success: boolean) => {
            this.traceList = this.service.getTraceList();
            this.addingNewTrace = false;
            this.changeSelectedTrace({ value: name });
        });
    }

    public startTrigger(): void {
        this.service.startTrigger().subscribe(success => { });
    }

    public changeTraceStatus(): void {
        const traceOn = this.curTraceStatus === TraceStatus.NOTREADY;
        this.service.traceOnOff(this.selectedTrace.name, traceOn).subscribe(success => { });
    }

    public changeSelectedTrace({ value }): void {
        this.service.getSelectedConfig(value).subscribe(success => {
            from(this.traceList).pipe(rxjsMap(
                traces => traces.find(x => x.name === value)
            )).subscribe(res => {
                this.selectedTrace = res;
            });
        });
    }

    public changeDuration(): void {
        if (!this.isValid) return;
        this.service.setTotalRecTime(this.selectedTrace).subscribe(success => { });
    }

    public changeRate(): void {
        this.service.setSamplingTime(this.selectedTrace).subscribe(success => { });
    }

    public checkIsValid(isValid: boolean): void {
        this.isValid = isValid;
    }
}
