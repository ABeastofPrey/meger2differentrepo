import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Observable, zip, from, of } from 'rxjs';
import { map as rxjsMap, tap, filter, switchMap, debounceTime } from 'rxjs/operators';
import { TraceService, Trace, TraceStatus } from '../../../services/trace.service';
import { MatDialog } from '@angular/material/dialog';
import { isNotUndefined, isUndefined } from 'ramda-adjunct';
import { YesNoDialogComponent } from '../../../../../components/yes-no-dialog/yes-no-dialog.component';

@Component({
	selector: 'app-trace-common',
	templateUrl: './trace-common.component.html',
	styleUrls: ['./trace-common.component.scss']
})
export class TraceCommonComponent implements OnInit {
	private firstRate: number;
	private previousStatus: TraceStatus;
	public hasSelectedTrigger: boolean = false;
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
	public changeStatusEvent: EventEmitter<void> = new EventEmitter<void>();
	@Output() isDisableEidtEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

	get disableEidt(): boolean {
		return (this.curTraceStatus !== TraceStatus.NOTREADY) || this.unknowTracing;
	}

	constructor(
		private service: TraceService,
		private dialog: MatDialog,
		private changeDetectorRef: ChangeDetectorRef
	) {
		this.changeStatusEvent.pipe(debounceTime(300)).subscribe(() => {
			this.service.getTraceStatus().pipe(
				filter(status => {
					const statChanged = status !== this.previousStatus;
					const allNotReady = status === TraceStatus.NOTREADY && this.previousStatus === TraceStatus.NOTREADY;
					return statChanged || allNotReady;
				}),
				tap(status => {
					this.previousStatus = status;
					this.curTraceStatus = status;
				}),
				rxjsMap(status => status === TraceStatus.NOTREADY),
				tap(traceOn => {
					traceOn && this.isDisableEidtEvent.emit(true);
				}),
				switchMap(traceOn => this.service.traceOnOff(this.selectedTrace.name, traceOn))
			).subscribe(success => {
				console.log(success);
			});
		});
	}

	ngOnInit(): void {
		this.traceList = this.service.getTraceList();
		zip(
			this.service.getSelectedTraceName(),
			this.traceList
		).pipe(rxjsMap(
			([name, traces]) => traces.find(x => x.name === name)
		)).subscribe(trace => {
			if (!trace || !trace.name) {
				this.selectedTrace = null;
				this.hasSelectedTrigger = false;
				return;
			}
			this.selectedTrace = trace;
			this.service.hasSelectedTrigger(trace.name).subscribe(hasSelectedTrigger => {
				this.hasSelectedTrigger = hasSelectedTrigger;
			});
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
					this.isDisableEidtEvent.emit(this.disableEidt);
					return;
				}
				this.curTraceStatus = status;
				this.isDisableEidtEvent.emit(this.disableEidt);
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
		this.addingNewTrace = !this.addingNewTrace;
	}

	public createTrace(name: string): void {
		const newName = name.toUpperCase();
		const trace: Trace = { name: newName, duration: 30, rate: this.firstRate };
		this.service.createTrace(trace).subscribe((success: boolean) => {
			this.traceList = this.service.getTraceList();
			this.addingNewTrace = false;
			this.changeSelectedTrace({ value: newName });
		});
	}

	public startTrigger(): void {
		this.service.startTrigger().subscribe(success => { });
	}

	public changeTraceStatus(): void {
		this.changeStatusEvent.emit();
	}

	public changeSelectedTrace({ value }): void {
		this.service.getSelectedConfig(value).subscribe(success => {
			from(this.traceList).pipe(rxjsMap(
				traces => traces.find(x => x.name.toUpperCase() === value.toUpperCase())
			)).subscribe(res => {
				this.selectedTrace = res;
				this.changeDetectorRef.detectChanges();
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

	// public test = 'default';
	// public oncontextmenua(event: any): void {
	//     this.test = event.target.value;
	//     event.preventDefault();
	// }

	// public oncontextmenub(event: any): void {
	//     this.test = event.target.value;
	// }
}
