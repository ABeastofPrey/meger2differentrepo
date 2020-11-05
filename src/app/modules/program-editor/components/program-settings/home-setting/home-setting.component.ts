import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeSettingService } from '../../../services/home-setting.service';
import {
	range, equals, isEmpty, identity, ifElse, map, 
	converge, __, and, gt, lt,complement,
} from 'ramda';
import { Either } from 'ramda-fantasy';
import { TranslateService } from '@ngx-translate/core';
import { TerminalService } from '../../../../home-screen/services/terminal.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { SysLogSnackBarService } from '../../../../sys-log/services/sys-log-snack-bar.service';

const transferNum = ifElse(isEmpty, identity, Number);

@Component({
	selector: 'app-home-setting',
	templateUrl: './home-setting.component.html',
	styleUrls: ['./home-setting.component.scss'],
})
export class HomeSettingComponent implements OnInit, OnDestroy {
	orderOptions: number[] = range(1, 10);
	orderList: number[] = [];
	positionList: number[] = [];
	private words: {};
	private notifier: Subject<boolean> = new Subject();
	public limits: { min: number, max: number }[] = [];

	constructor(
		private service: HomeSettingService,
		private terminalService: TerminalService,
		private trn: TranslateService,
		private sysLogSnackBar: SysLogSnackBarService
	) {
		this.terminalService.sentCommandEmitter
			.pipe(takeUntil(this.notifier))
			.subscribe(cmd => {
				this.retrieveOrder();
				this.retrievePosition();
			});
	}

	ngOnInit(): void {
		this.trn.get(['projectSettings.home_config']).subscribe(words => {
			this.words = words['projectSettings.home_config'];
		});
		this.getLimits();
		this.retrieveOrder();
		this.retrievePosition();
	}

	ngOnDestroy(): void {
		this.notifier.next(true);
		this.notifier.unsubscribe();
	}

	private getLimits(): void {
		Promise.all(map(idx => this.getMinMax(idx), range(1, 5))).then(res => {
			this.limits = res as any;
		});
	}

	private async retrievePosition(): Promise<void> {
		Either.either(
			err => console.warn('Get Home Position failed: ' + err),
			res => (this.positionList = res)
		)(await this.service.getHomePostion());
	}

	private async retrieveOrder(): Promise<void> {
		Either.either(
			err => console.warn('Get Home Order failed: ' + err),
			res => (this.orderList = res)
		)(await this.service.getHomeOrder());
	}

	onFocus(value: string): void {
		// this.preValue = transferNum(value);
	}

	// tslint:disable-next-line: no-any
	onKeyup(event: any): void {
		const isPressEnter = equals(13);
		// tslint:disable-next-line
		isPressEnter(event.keyCode) && (event.target as HTMLElement).blur();
	}

	async updatePosition(index: number, target: HTMLInputElement): Promise<void> {
		const value = transferNum(target.value);
		const positionRange = converge(and, [gt(__, this.limits[index].min), lt(__, this.limits[index].max),]);
		const isOverLimit = complement(positionRange);
		if (isOverLimit(value)) return;
		this.service.updateHomePostion(index, value).then(() => {
			this.sysLogSnackBar.openTipSnackBar(this.words['savedTip']);
		}).catch(err => {
			console.warn('Update Home Position failed: ' + err);
		});
	}

	async updateOrder(index: number, value: number): Promise<void> {
		Either.either(
			err => console.warn('Update Home Order failed: ' + err),
			this.sysLogSnackBar.openTipSnackBar(this.words['savedTip'])
		)(await this.service.updateHomeOrder(index, value));
	}

	async readCurrentPosition(): Promise<void> {
		this.positionList = [];
		Either.either(
			err => console.warn('Read current position failed: ' + err),
			res => (this.positionList = res)
		)(await this.service.readCurrentPosition());
	}

	private async getMinMax(
		index: number
	): Promise<{ min: number; max: number }> {
		let max: number, min: number;
		Either.either(
			err => console.warn(`Get max of j${index} failed: ` + err),
			res => (max = res)
		)(await this.service.getPositionMax(index));
		Either.either(
			err => console.warn(`Get min of j${index} failed: ` + err),
			res => (min = res)
		)(await this.service.getPositionMin(index));
		return { min, max };
	}
}
