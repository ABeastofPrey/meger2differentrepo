import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { map as rxjsMap, distinctUntilChanged, debounceTime, bufferCount, takeUntil } from 'rxjs/operators';
import { __, toLower, compose, filter, indexOf, gte, prop, sortBy, map } from 'ramda';

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
    @Output() inputEvent: EventEmitter<string> = new EventEmitter<string>();
    public filteredOptions: Observable<string[]>;
    private filterWatcher: EventEmitter<string> = new EventEmitter<string>();
    private inputWatcher: EventEmitter<string> = new EventEmitter<string>();
    private focusOrBlurWatcher: EventEmitter<boolean> = new EventEmitter<boolean>();
    private stopListenEvent: EventEmitter<void> = new EventEmitter<void>();
    private isSelectOpened = false;
    private isSelectAutoComplete = false;

    constructor() { }

    ngOnInit(): void {
        this.filteredOptions = this.filterWatcher.pipe(
            rxjsMap(value => {
                return !this.isSelectOpened ? this.fuzzyQuery(value, this.options) : [];
            }),
            takeUntil(this.stopListenEvent)
        );

        this.inputWatcher.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            takeUntil(this.stopListenEvent)
        ).subscribe((value) => {
            console.log('Emit Input: ', value);
            this.value = value;
            this.inputEvent.next(this.value);
            this.valueChange.next(this.value);
            this.filterWatcher.next(this.value);
        });

        this.focusOrBlurWatcher.pipe(
            debounceTime(300),
            bufferCount(2, 1),
            takeUntil(this.stopListenEvent)
        ).subscribe(([preIsFocus, curIsFocus]) => {
            if (this.isSelectOpened) return;
            if (preIsFocus && curIsFocus) return;
            if (curIsFocus) {
                console.log('Emit Focus: ', this.value);
                this.focusEvent.next(this.value);
            } else if (!curIsFocus) {
                console.log('Emit Blur: ', this.value);
                this.blurEvent.next(this.value);
                this.filterWatcher.next('');
            }
        });
        this.focusOrBlurWatcher.next(false);
    }

    ngOnDestroy(): void {
        this.stopListenEvent.next();
        this.stopListenEvent.unsubscribe();
    }

    // Input events
    public onInputFocus(): void {
        if (this.isSelectOpened) {
            const hasNoOptions = (!this.options || this.options.length === 0);
            !hasNoOptions && this.filterWatcher.next('');
            return;
        };
        this.filterWatcher.next(this.value);
        this.focusOrBlurWatcher.next(true);
    }

    public onInputBlur(): void {
        this.focusOrBlurWatcher.next(false);
    }

    public onInputChange(value: string): void {
        this.inputWatcher.next(value);
    }

    // Auto complete events
    public autoCompleteChange(value: string): void {
        this.isSelectAutoComplete = true;
        this.inputWatcher.next(value);
    }

    // Select events
    public openSelect(): void {
        this.isSelectOpened = true;
    }

    public openedChange(isOpen: boolean): void {
        if (!isOpen) {
            this.isSelectOpened = false;
            this.focusOrBlurWatcher.next(false);
        } else {
            this.isSelectOpened = true;
        }
    }

    public onSelectionChange(value: string): void {
        this.inputWatcher.next(value);
        this.focusOrBlurWatcher.next(false);
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
