import { Component, OnInit, Output, Inject, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SYS_LOG_SNAKBAR_LOG, SYS_LOG_SNAKBAR_COUNT, SYS_LOG_SNAKBAR_TIP } from '../../enums/sys-log.tokens';
import { SystemLog } from '../../enums/sys-log.model';
import { FwTranslatorService } from '../../../core/services/fw-translator.service';
import { TpStatService } from '../../../core/services/tp-stat.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'sys-log-snack-bar',
  templateUrl: './log-snack-bar.component.html',
  styleUrls: ['./log-snack-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // the fade-in/fade-out animation.
    trigger('snackAnimation', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),

      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('150ms cubic-bezier(0, 0, 0.2, 1)')
      ]),

      transition(':leave',
        animate('75ms cubic-bezier(0.4, 0.0, 1, 1)', style({ opacity: 0, transform: 'translateY(10px)' })))
    ])
  ]
})
export class LogSnackBarComponent implements OnInit, OnDestroy {

  @Output() questionMarkEvent = new EventEmitter<SystemLog>();
  @Output() confirmEvent = new EventEmitter<SystemLog>();
  @Output() confirmAllEvent = new EventEmitter<string>();
  @Output() contentEvent = new EventEmitter<string>();
  private doCheckEvent = new EventEmitter<void>();
  private clearTipMessage = new EventEmitter<void>();
  private tipWasCleared = new EventEmitter<void>();
  private stopListener = new EventEmitter<void>();

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
  ) {
    const clearTip = () => {
      this._tip = '';
      this.cdRef.detectChanges();
      this.tipWasCleared.emit();
    };
    this.doCheckEvent.pipe(debounceTime(500), takeUntil(this.stopListener)).subscribe(() => {
      this.cdRef.detectChanges();
      (this._tip !== '') && this.clearTipMessage.emit();
    });
    this.clearTipMessage.pipe(debounceTime(3000), takeUntil(this.stopListener)).subscribe(clearTip);
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.stopListener.emit();
    this.stopListener.unsubscribe();
  }

  public clickQuestionMark(): void {
    this.questionMarkEvent.emit(this.log);
  }

  public clickConform(event: MouseEvent): void {
    event.stopPropagation();
    this.log.isNotMaintenance && this.confirmEvent.emit(this.log);
  }

  public clickConformAll(): void {
    this.confirmAllEvent.emit(this.log.id);
  }

  public clickContent(): void {
    this.contentEvent.emit(this.log.id);
  }

  public setTip(msg: string): void {
    this._tip = msg;
    this.doCheckEvent.emit();
  }

  public setLog(log: SystemLog, unconfirmCount: number, hasNoCanConfirm: boolean): void {
    this._log = log;
    this._unconfirmCount = unconfirmCount;
    (hasNoCanConfirm !== null || hasNoCanConfirm !== undefined) && (this.hasNoCanConfirm = hasNoCanConfirm);
    this.doCheckEvent.emit();
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
