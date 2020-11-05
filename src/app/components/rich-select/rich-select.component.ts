import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { distinctUntilChanged, debounceTime, takeUntil } from 'rxjs/operators';
import { __, toLower, compose, filter, indexOf, gte, prop, sortBy, map } from 'ramda';
import { MatDialog } from '@angular/material';
import { CustomKeyBoardDialogComponent } from '../../modules/custom-key-board-dialog/custom-key-board-dialog.component';
import { Platform } from '@angular/cdk/platform';
import { fromEvent, Subscription } from 'rxjs';

@Component({
    selector: 'rich-select',
    templateUrl: './rich-select.component.html',
    styleUrls: ['./rich-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichSelectComponent implements OnInit, OnDestroy {
    @Input() placeholder: string;
    @Input() options: string[] = [];
    @Input() value: string = '';
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() focusEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() blurEvent: EventEmitter<string> = new EventEmitter<string>();
    public selectOptions: string[] = [];
    private inputWatcher: EventEmitter<string> = new EventEmitter<string>();
    private stopListenEvent: EventEmitter<void> = new EventEmitter<void>();
    private previousValue: string = '';

    public isFocused = false;
    public isOpenSelect = false;
    private isKeyBoardOpen = false;
    private pageClick: Subscription;

    get isTablet(): boolean {
        return this.platform.ANDROID || this.platform.IOS;
    }

    constructor(
        private dialog: MatDialog,
        private platform: Platform,
        private cdk: ChangeDetectorRef
    ) {
        // this.focusEvent.subscribe(() => {
        //     console.log('on focus');
        // });
        // this.blurEvent.subscribe(() => {
        //     console.log('on blur');
        // });
        // this.valueChange.subscribe(() => {
        //     console.log('on valueChange');
        // });
    }

    ngOnInit(): void {
        this.inputWatcher.pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.stopListenEvent)).subscribe(value => {
            this.value = value;
            this.valueChange.emit(this.value);
            this.selectOptions = this.fuzzyQuery(this.value, this.options);
            this.cdk.detectChanges();
        });
    }

    ngAfterViewInit(): void {
        this.pageClick = fromEvent(document, 'click').subscribe(this.onDocumentClick.bind(this));
    }

    ngOnDestroy(): void {
        this.pageClick.unsubscribe();
        this.stopListenEvent.next();
        this.stopListenEvent.unsubscribe();
    }

    // Input events
    public onInputFocus(): void {
        !this.isFocused && this.focusEvent.emit();
        this.isFocused = true;
        this.previousValue = this.value;
        if (this.isTablet) {
            this.isKeyBoardOpen = true;
            this.selectOptions = [];
            const option = { data: { type: 'string', value: this.value } };
            this.dialog.open(CustomKeyBoardDialogComponent, option).afterClosed().subscribe(res => {
                this.isKeyBoardOpen = false;
                if (res === undefined) {
                    this.isFocused = false;
                    this.blurEvent.emit(this.value);
                    return;
                }
                this.value = res;
                if (option.data.value !== res) this.valueChange.emit(this.value);
                this.selectOptions = this.fuzzyQuery(this.value, this.options);
                if (this.selectOptions.length === 0) {
                    this.isFocused = false;
                    this.blurEvent.emit(this.value);
                } else {
                    this.isKeyBoardOpen = true;
                    this.isOpenSelect = true;
                }
                this.cdk.detectChanges();
            });
        } else {
            this.selectOptions = this.fuzzyQuery(this.value, this.options);
        }
    }

    public onInputBlur(): void {
        if (this.isKeyBoardOpen) return;
        setTimeout(() => {
            this.isFocused = false;
            this.selectOptions = [];
            this.blurEvent.emit(this.value);
            this.cdk.detectChanges();
        }, 300);
    }

    public onInputChange(value: string): void {
        this.inputWatcher.emit(value);
    }

    // Auto complete events
    public onSelectionChange(value: string): void {
        this.value = value;
        this.selectOptions = [];
        if (this.previousValue !== this.value) {
            this.valueChange.emit(this.value);
            this.blurEvent.emit(this.value);
        }
        if(this.previousValue === this.value && this.isKeyBoardOpen) {
            this.blurEvent.emit(this.value);
            this.isFocused = false;
        }
        if (!this.isFocused) {
            this.blurEvent.emit(this.value);
        }
        if (this.isOpenSelect) {
            this.isOpenSelect = false;
        }
    }

    // Select events
    public openSlection(event: Event): void {
        if (this.isFocused || !this.options || this.options.length === 0) return;
        this.isOpenSelect = true;
        this.previousValue = this.value;
        this.selectOptions = [...this.options];
        this.focusEvent.emit(this.value);
        this.cdk.detectChanges();
        event.stopPropagation();
    }

    private onDocumentClick(): void {
        if (this.isKeyBoardOpen && this.selectOptions.length !== 0) {
            this.isKeyBoardOpen = false;
            this.selectOptions = [];
            this.blurEvent.emit(this.value);
            this.cdk.detectChanges();
            return;
        }
        if (this.isFocused) return;
        if (this.isOpenSelect) {
            this.blurEvent.emit(this.value);
        }
        this.isOpenSelect = false;
        this.selectOptions = [];
        this.cdk.detectChanges();
    }

    public viewPortHeight(items): string {
        if (!items) return '0';
        let max: number;
        switch (items.length) {
            case 0: max = 0; break;
            case 1: max = 1; break;
            case 2: max = 2; break;
            case 3: max = 3; break;
            case 4: max = 4; break;
            default: max = 5;
        }
        return 42 * max + 'px';
    }

    /**
     * The fuzzy query will return a new list with ordered, each item in the list should contain the key.
     * @param key key word
     * @param list query list
     */
    private fuzzyQuery(key: string, list: string[]): string[] {
        if (!key || !list) return [];
        const valKey = Symbol('value');
        const valIdx = Symbol('index');
        const valueP = prop(valKey);
        const indexP = prop(valIdx);
        const lowKey = toLower(key);
        const gteZero = gte(__, 0);
        const getKeyIndex = compose(indexOf(lowKey), toLower);
        const addKeyIndex = item => Object.assign({ [valKey]: item, [valIdx]: getKeyIndex(item) });
        const hasKey = compose(gteZero, indexP);
        const sortByKeyIndex = sortBy(indexP);
        const filterByKey = filter(hasKey);
        const filterAndSort = compose(map(valueP), sortByKeyIndex, filterByKey, map(addKeyIndex));
        return filterAndSort(list);
    }
}
