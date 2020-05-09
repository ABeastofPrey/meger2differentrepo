import { Component, OnInit, Output, Inject, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SYS_LOG_SNAKBAR_DATA, SYS_LOG_SNAKBAR_COUNT } from '../../enums/sys-log.tokens';
import { SystemLog } from '../../enums/sys-log.model';
import { FwTranslatorService } from '../../../core/services/fw-translator.service';
import { MatTooltip } from '@angular/material';

@Component({
    selector: 'sys-log-snackbar',
    templateUrl: './log-snackbar.component.html',
    styleUrls: ['./log-snackbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogSnackbarComponent implements OnInit {
    @Output()
    questionMarkEvent = new EventEmitter<SystemLog>();
    @Output()
    confirmEvent = new EventEmitter<SystemLog>();
    @Output()
    confirmAllEvent = new EventEmitter<string>();
    @Output()
    contentEvent = new EventEmitter<string>();

    constructor(
        @Inject(SYS_LOG_SNAKBAR_DATA) public data: SystemLog,
        @Inject(SYS_LOG_SNAKBAR_COUNT) public count: number,
        public trn: FwTranslatorService,
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void { }

    public clickQuestionMark(): void {
        this.questionMarkEvent.emit(this.data);
    }
    
    public clickConform(event: MouseEvent): void {
        event.stopPropagation();
        this.data.canConfirm && this.confirmEvent.emit(this.data);
    }

    public clickConformAll(): void {
        this.confirmAllEvent.emit(this.data.id);
    }

    public clickContent(): void {
        this.contentEvent.emit(this.data.id);
    }

    public refresh(): void {
        this.cdRef.detectChanges();
    }
}
