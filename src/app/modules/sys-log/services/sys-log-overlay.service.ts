import { Injectable, ComponentRef, Injector, EventEmitter } from '@angular/core';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { takeUntil } from 'rxjs/operators';
import { LogSnackbarComponent } from '../components/log-snackbar/log-snackbar.component';
import { SystemLog } from '../enums/sys-log.model';
import { SYS_LOG_SNAKBAR_DATA, SYS_LOG_SNAKBAR_COUNT } from '../enums/sys-log.tokens';

@Injectable()
export class SysLogOverlayService {
    private stopSubscription = new EventEmitter<void>();
    private _overlayRef: OverlayRef;
    private _snakbarRef: ComponentRef<LogSnackbarComponent>;
    public clickQuestion: EventEmitter<any> = new EventEmitter<any>();
    public clickContent: EventEmitter<string> = new EventEmitter<string>();
    public clickConfirm: EventEmitter<SystemLog> = new EventEmitter<SystemLog>();
    public clickConfirmAll: EventEmitter<any> = new EventEmitter<any>();

    private config;

    constructor(private overlay: Overlay, private injector: Injector) {
        const positionStrategy = this.overlay.position().global().centerHorizontally().bottom(`25px`);
        this.config = new OverlayConfig({ positionStrategy, hasBackdrop: false });
    }

    public openLogSnakbar(log: SystemLog, count: number): void {
        const injector = this.createInjector(log, count);
        this._overlayRef = this.overlay.create(this.config);
        this._snakbarRef = this._overlayRef.attach(new ComponentPortal(LogSnackbarComponent, undefined, injector));
        this._snakbarRef.instance.refresh();
        this.subscribeEvents();
    }

    public refreshSnakbar(log: SystemLog, count: number): void {
        if (!this._snakbarRef) {
            this.openLogSnakbar(log, count);
        } else {
            this._snakbarRef.instance.data = { ...log };
            this._snakbarRef.instance.count = count;
            this._snakbarRef.instance.refresh();
        }
    }

    public closeLogSnakbar(): void {
        if (this._overlayRef) {
            this._overlayRef.detach();
            this._overlayRef.dispose();
        }
        this.stopSubscription.emit();
        // try {
        //     this._snakbarRef.hostView.detectChanges();
        // } catch (error) {
        //     // console.log(error);
        // }
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

    private createInjector(data: SystemLog, count: number): PortalInjector {
        const tokens = new WeakMap();
        tokens.set(SYS_LOG_SNAKBAR_DATA, data);
        tokens.set(SYS_LOG_SNAKBAR_COUNT, count);
        return new PortalInjector(this.injector, tokens);
    }
}
