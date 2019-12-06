import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { map as rxjsMap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
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
    @Input() current: string;
    @Output() currentChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() focusEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() blurEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() inputEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() openSelectEvent: EventEmitter<null> = new EventEmitter<null>();
    @Output() closeSelectEvent: EventEmitter<null> = new EventEmitter<null>();
    public filteredOptions: Observable<string[]>;
    private filterWatcher: Subject<string> = new Subject<string>();
    private currentWatcher: Subject<string> = new Subject<string>();
    private currentWatcherSubscription: Subscription;
    private blurtWatcher: Subject<string> = new Subject<string>();
    private blurWatcherSubscription: Subscription;
    private inputWatcher: Subject<string> = new Subject<string>();
    private inputWatcherSubscription: Subscription;
    private isSelectOpened = false;

    constructor() { }

    ngOnInit(): void {
        // watch filter
        this.filteredOptions = this.filterWatcher.pipe(rxjsMap(value => this.fuzzyQuery(value, this.options)));
        // watch current value
        const emitCurrent = value => this.currentChange.emit(value);
        this.currentWatcherSubscription = this.currentWatcher.pipe(distinctUntilChanged()).subscribe(emitCurrent);
        // watch blur
        const blurEmit = value => {
            this.blurEvent.emit(value);
            this.filterWatcher.next('');
        }
        this.blurWatcherSubscription = this.blurtWatcher.pipe(debounceTime(300)).subscribe(blurEmit);
        // watch input
        const triggerInput = value => {
            this.filterWatcher.next(value);
            this.currentWatcher.next(value);
            this.inputEvent.emit(value);
        };
        this.inputWatcherSubscription = this.inputWatcher.pipe(
            debounceTime(500), 
            distinctUntilChanged()
        ).subscribe(triggerInput);
    }

    ngOnDestroy(): void {
        this.currentWatcherSubscription.unsubscribe();
        this.blurWatcherSubscription.unsubscribe();
        this.inputWatcherSubscription.unsubscribe();
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

    public onFocus(): void {
        if (!this.options || this.options.length === 0) {
            this.focusEvent.emit(this.current);
        } else if (this.isSelectOpened) {
            this.filterWatcher.next('');
        } else {
            this.filterWatcher.next(this.current);
            this.focusEvent.emit(this.current);
        }
    }

    public openSelect(): void {
        this.isSelectOpened = true;
    }

    public openedChange(isOpen: boolean): void {
        if (!isOpen) {
            this.isSelectOpened = false;
            this.blurtWatcher.next(this.current);
            this.closeSelectEvent.emit();
        } else {
            this.openSelectEvent.emit();
        }
    }

    public onSelectionChange(current: string): void {
        this.current = current;
        this.currentWatcher.next(this.current);
    }

    public onInput(): void {
        this.inputWatcher.next(this.current);
    }

    public onBlur(): void {
        this.currentWatcher.next(this.current);
        this.blurtWatcher.next(this.current);
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
