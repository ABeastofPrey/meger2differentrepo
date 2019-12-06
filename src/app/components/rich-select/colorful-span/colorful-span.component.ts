import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { __, length, indexOf, gte, slice, add, toLower } from 'ramda';

interface SplitValue {
    isKey: boolean;
    value: string;
}

@Component({
    selector: 'colorful-span',
    template: `
    <span>
        <ng-container *ngFor="let item of valueList">
            <span *ngIf="!item?.isKey else colorfulSpan">{{item?.value}}</span>
            <ng-template #colorfulSpan>
                <span class="primary-light">{{item?.value}}</span>
            </ng-template>
        </ng-container>
    </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorfulSpanComponent implements OnInit, OnChanges {
    @Input() key: string;
    @Input() value: string;
    public valueList: SplitValue[];

    constructor() { }

    ngOnInit(): void { }

    ngOnChanges(change: SimpleChanges): void {
        this.valueList = this.splitValueWithKey(this.key, this.value);
    }

    private splitValueWithKey(key: string, value: string): SplitValue[] {
        if (!value) return [];
        const keyLen = length(key);
        const strIdx = indexOf(toLower(key), toLower(value));
        const endIdx = add(strIdx, keyLen);
        const hasKey = gte(strIdx, 0);
        const getKeyObj = val => Object.assign({ isKey: true, value: val });
        const getNotKeyObj = val => Object.assign({ isKey: false, value: val });
        const sliceValue = (sti, eni) => slice(sti, eni, value);
        if (!key || !hasKey) {
            return [getNotKeyObj(value)];
        } else {
            if (strIdx === 0) {
                const a = getKeyObj(sliceValue(strIdx, endIdx));
                const b = getNotKeyObj(sliceValue(endIdx, Infinity));
                return [a, b];
            } else {
                const a = getNotKeyObj(sliceValue(0, strIdx));
                const b = getKeyObj(sliceValue(strIdx, endIdx));
                const c = getNotKeyObj(sliceValue(endIdx, Infinity));
                return [a, b, c];
            }
        }
    }
}
