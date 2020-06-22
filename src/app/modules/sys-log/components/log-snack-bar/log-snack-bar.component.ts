import { Component, OnInit, Output, Inject, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, HostBinding } from '@angular/core';
import { SYS_LOG_SNAKBAR_LOG, SYS_LOG_SNAKBAR_COUNT, SYS_LOG_SNAKBAR_TIP } from '../../enums/sys-log.tokens';
import { SystemLog } from '../../enums/sys-log.model';
import { FwTranslatorService } from '../../../core/services/fw-translator.service';
import { TpStatService } from '../../../core/services/tp-stat.service';
import { debounceTime } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'sys-log-snack-bar',
    templateUrl: './log-snack-bar.component.html',
    styleUrls: ['./log-snack-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        // the fade-in/fade-out animation.
        trigger('snackAnimation', [
            state('in', style({opacity: 1, transform: 'translateY(0)'})),

            transition(':enter', [
                style({opacity: 0, transform: 'translateY(10px)'}),
                animate('150ms cubic-bezier(0, 0, 0.2, 1)')
            ]),

            transition(':leave',
            animate('75ms cubic-bezier(0.4, 0.0, 1, 1)', style({opacity: 0, transform: 'translateY(10px)'})))
        ])
    ]
})
export class LogSnackBarComponent implements OnInit {

    @Output() questionMarkEvent = new EventEmitter<SystemLog>();
    @Output() confirmEvent = new EventEmitter<SystemLog>();
    @Output() confirmAllEvent = new EventEmitter<string>();
    @Output() contentEvent = new EventEmitter<string>();
    
    private clearTipMessage = new EventEmitter<void>();
    private tipWasCleared = new EventEmitter<void>();

    public hasNoCanConfirm: boolean = false;

    public get tip(): string {
        return this._tip;
    }

    public get log(): SystemLog {
        return this._log;
    }

    public get unconfirmCount(): number {
        return this._unconfirmCount;
    }

    constructor(
        @Inject(SYS_LOG_SNAKBAR_TIP) private _tip: string,
        @Inject(SYS_LOG_SNAKBAR_LOG) private _log: SystemLog,
        @Inject(SYS_LOG_SNAKBAR_COUNT) private _unconfirmCount: number,
        public trn: FwTranslatorService,
        public tpStat: TpStatService,
        private cdRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.clearTipMessage.pipe(
            debounceTime(2000),
        ).subscribe(() => {
            this._tip = '';
            this.cdRef.detectChanges();
            this.tipWasCleared.emit();
        });
    }

    public clickQuestionMark(): void {
        this.questionMarkEvent.emit(this.log);
    }

    public clickConform(event: MouseEvent): void {
        event.stopPropagation();
        this.log.canConfirm && this.confirmEvent.emit(this.log);
    }

    public clickConformAll(): void {
        this.confirmAllEvent.emit(this.log.id);
    }

    public clickContent(): void {
        this.contentEvent.emit(this.log.id);
    }

    public setTip(msg: string): void {
        this._tip = msg;
        this.cdRef.detectChanges();
        this.clearTipMessage.emit();
    }

    public setLog(log: SystemLog, unconfirmCount: number, hasNoCanConfirm: boolean): void {
        this._log = log;
        this._unconfirmCount = unconfirmCount;
        (hasNoCanConfirm !== null || hasNoCanConfirm !== undefined) && (this.hasNoCanConfirm = hasNoCanConfirm);
        this.cdRef.detectChanges();
    }

    public destroySnackBar(): Promise<void> {
        return new Promise(resolve => {
            if (this._tip === '') {
                resolve();
            } else {
                this._log = null;
                this.cdRef.detectChanges();
                this.tipWasCleared.subscribe(() => {
                    resolve();
                });
            }
        });
    }
}
