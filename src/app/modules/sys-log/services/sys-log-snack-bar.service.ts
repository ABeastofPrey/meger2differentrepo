import { Injectable, ComponentRef, Injector, EventEmitter } from '@angular/core';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { takeUntil } from 'rxjs/operators';
import { LogSnackBarComponent } from '../components/log-snack-bar/log-snack-bar.component';
import { SystemLog } from '../enums/sys-log.model';
import { SYS_LOG_SNAKBAR_LOG, SYS_LOG_SNAKBAR_COUNT, SYS_LOG_SNAKBAR_TIP } from '../enums/sys-log.tokens';

@Injectable({ providedIn: 'root' })
export class SysLogSnackBarService {
    private stopSubscription = new EventEmitter<void>();
    private _overlayRef: OverlayRef;
    private _snakbarRef: ComponentRef<LogSnackBarComponent>;
    public clickQuestion: EventEmitter<any> = new EventEmitter<any>();
    public clickContent: EventEmitter<string> = new EventEmitter<string>();
    public clickConfirm: EventEmitter<SystemLog> = new EventEmitter<SystemLog>();
    public clickConfirmAll: EventEmitter<any> = new EventEmitter<any>();

    private config: OverlayConfig;

    constructor(private overlay: Overlay, private injector: Injector) {
        const positionStrategy = this.overlay.position().global().centerHorizontally().bottom(`20px`);
        this.config = new OverlayConfig({ positionStrategy, hasBackdrop: false });
    }

    public openTipSnackBar(message: string): void {
        if (this._overlayRef === undefined || this._snakbarRef === undefined) {
            this.openLogSnackbar(null, null, null);
            setTimeout(() => {
                this._snakbarRef.instance.setTip(message);
            }, 0);
        } else {
            this._snakbarRef.instance.setTip(message);
        }
        
    }

    public openLogSnackbar(log: SystemLog, unconfirmCount: number, hasNoCanConfirm: boolean): void {
        if (this._snakbarRef !== undefined && this._overlayRef !== undefined) {
            return this.refreshSnackBar(log, unconfirmCount, hasNoCanConfirm);
        }
        const injector = this.createInjector(log, unconfirmCount);
        this._overlayRef = this.overlay.create(this.config);
        this._snakbarRef = this._overlayRef.attach(new ComponentPortal(LogSnackBarComponent, undefined, injector));
        this._snakbarRef.instance.hasNoCanConfirm = hasNoCanConfirm;
        this.subscribeEvents();
    }

    public refreshSnackBar(log: SystemLog, unconfirmCount: number, hasNoCanConfirm: boolean): void {
        if (!this._snakbarRef) {
            this.openLogSnackbar(log, unconfirmCount, hasNoCanConfirm);
        } else {
            this._snakbarRef.instance.setLog(log, unconfirmCount, hasNoCanConfirm);
        }
    }

    public async closeLogSnackBar(): Promise<void> {
        if (!this._snakbarRef) return;
        await this._snakbarRef.instance.destroySnackBar();
        if (this._overlayRef) {
            this._overlayRef.detach();
            this._overlayRef.dispose();
        }
        this._overlayRef = undefined;
        this._snakbarRef = undefined;
        this.stopSubscription.emit();
    }

    private subscribeEvents(): void {
        this._snakbarRef.instance.questionMarkEvent.pipe(takeUntil(this.stopSubscription)).subscribe(log => {
            this.clickQuestion.emit(log);;
        });
        this._snakbarRef.instance.contentEvent.pipe(takeUntil(this.stopSubscription)).subscribe(_id => {
            this.clickContent.emit(_id);
        });
        this._snakbarRef.instance.confirmEvent.pipe(takeUntil(this.stopSubscription)).subscribe(log => {
            this.clickConfirm.emit(log);
        });
        this._snakbarRef.instance.confirmAllEvent.pipe(takeUntil(this.stopSubscription)).subscribe(_id => {
            this.clickConfirmAll.emit();
        });
    }

    private createInjector(log: SystemLog, unconfirmCount: number): PortalInjector {
        const tokens = new WeakMap();
        tokens.set(SYS_LOG_SNAKBAR_TIP, '');
        tokens.set(SYS_LOG_SNAKBAR_LOG, log);
        tokens.set(SYS_LOG_SNAKBAR_COUNT, unconfirmCount);
        return new PortalInjector(this.injector, tokens);
    }
}
