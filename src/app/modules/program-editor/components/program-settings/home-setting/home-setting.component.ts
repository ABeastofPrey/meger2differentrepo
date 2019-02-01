import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeSettingService } from '../../../services/home-setting.service';
import { range, equals, converge, __, and, gt, lt, complement, isEmpty, identity, ifElse } from 'ramda';
import { isNotValidNumber } from 'ramda-adjunct';
import { Either } from 'ramda-fantasy';
import { MatSnackBar } from '@angular/material';
import { TerminalService } from '../../../../home-screen/services/terminal.service';

const transferNum = ifElse(isEmpty, identity, Number);

@Component({
    selector: 'app-home-setting',
    templateUrl: './home-setting.component.html',
    styleUrls: ['./home-setting.component.scss']
})
export class HomeSettingComponent implements OnInit, OnDestroy {
    public orderOptions: number[] = range(1, 10);
    public orderList: number[] = [];
    public positionList: number[] = [];
    private preValue: number | string;
    private preIndex: number;
    private min: number;
    private max; number;
    private subscription: any;

    constructor(
        private service: HomeSettingService,
        private terminalService: TerminalService,
        public snackBar: MatSnackBar) {
            this.subscription = this.terminalService.sentCommandEmitter.subscribe(cmd => {
                this.retrieveOrder();
                this.retrievePosition();
            });
        }

    ngOnInit(): void {
        this.retrieveOrder();
        this.retrievePosition();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private async retrievePosition(): Promise<void> {
        Either.either(
            err => console.warn('Get Home Position failed: ' + err),
            res => this.positionList = res
        )(await this.service.getHomePostion());
    }

    private async retrieveOrder(): Promise<void> {
        Either.either(
            err => console.warn('Get Home Order failed: ' + err),
            res => this.orderList = res
        )(await this.service.getHomeOrder());
    }

    public onFocus(value: string): void { this.preValue = transferNum(value); }

    public onKeyup(event: any): void {
        const isPressEnter = equals(13);
        // tslint:disable-next-line
        isPressEnter(event.keyCode) && event.target.blur();
    }

    public async updatePosition(index: number, target: any): Promise<void> {
        const value = transferNum(target.value);
        const isEqualsToPrevious = equals(this.preValue);
        if (isEmpty(value)) {
            if (isEqualsToPrevious(value)) { return; } else {
                Either.either(
                    err => console.warn('Update Home Position failed: ' + err),
                    () => this.snackBar.open('Changes saved!', '', { duration: 1000 })
                )(await this.service.clearHomePosition(index));
            }
        } else {
            if (isNotValidNumber(value)) {
                target.value = this.preValue;
                this.snackBar.open('Please enter a valid number.', '', { duration: 1000 });
                return;
            } else if (isEqualsToPrevious(value)) { return; } else {
                const isNotEq2PreIndex = complement(equals(this.preIndex));
                if (isNotEq2PreIndex(index)) {
                    const { min, max } = await this.getMinMax(index);
                    this.min = min, this.max = max;
                    this.preIndex = index;
                }
                const positionRange = converge(and, [gt(__, this.min), lt(__, this.max)]),
                    isOverLimit = complement(positionRange);
                if (isOverLimit(value)) {
                    target.value = this.preValue;
                    this.snackBar.open(`Please enter a valid number between [${this.min},${this.max}].`, '', { duration: 3000 });
                    return;
                }
            }
            Either.either(
                err => console.warn('Update Home Position failed: ' + err),
                () => this.snackBar.open('Changes saved!', '', { duration: 1000 })
            )(await this.service.updateHomePostion(index, value));
        }
    }

    public async updateOrder(index: number, value: number): Promise<void> {
        Either.either(
            err => console.warn('Update Home Order failed: ' + err),
            () => this.snackBar.open('Changes saved!', '', { duration: 1000 })
        )(await this.service.updateHomeOrder(index, value));
    }

    public async readCurrentPosition(): Promise<void> {
        this.positionList = [];
        Either.either(
            err => console.warn('Read current position failed: ' + err),
            res => this.positionList = res
        )(await this.service.readCurrentPosition());
    }

    private async getMinMax(index: number): Promise<{min: number, max: number}> {
        let max: number, min: number;
        Either.either(
            err => console.warn(`Get max of j${index} failed: ` + err),
            res => max = res
        )(await this.service.getPositionMax(index));
        Either.either(
            err => console.warn(`Get min of j${index} failed: ` + err),
            res => min = res
        )(await this.service.getPositionMin(index));
        return { min: min, max: max };
    }
}
