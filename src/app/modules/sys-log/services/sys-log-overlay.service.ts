import { Injectable, ComponentRef, Injector, EventEmitter } from '@angular/core';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { LogSnackbarComponent } from '../components/log-snackbar/log-snackbar.component';
import { SystemLog } from '../enums/sys-log.model';
import { SYS_LOG_SNAKBAR_DATA, SYS_LOG_SNAKBAR_COUNT } from '../enums/sys-log.tokens';

@Injectable()
export class SysLogOverlayService {

    private _overlayRef: OverlayRef;
    private _snakbarRef: ComponentRef<LogSnackbarComponent>;
    public clickQuestion: EventEmitter<any> = new EventEmitter<any>();
    public clickContent: EventEmitter<number> = new EventEmitter<number>();
    public clickConfirm: EventEmitter<number> = new EventEmitter<number>();
    public clickConfirmAll: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private overlay: Overlay, private injector: Injector,
    ) {
        const positionStrategy = this.overlay.position().global().centerHorizontally().bottom(`25px`);
        const config = new OverlayConfig({ positionStrategy, hasBackdrop: false });
        this._overlayRef = this.overlay.create(config);
    }

    public showLogSnakbar(log: SystemLog, count: number): void {
        const injector = this.createInjector(log, count);
        this._snakbarRef = this._overlayRef.attach(new ComponentPortal(LogSnackbarComponent, undefined, injector));
        this.subscribeEvents();
    }

    public closeLogSnakbar(): void {
        this._overlayRef.detach();
    }

    private subscribeEvents(): void {
        this._snakbarRef.instance.questionMarkEvent.subscribe(log => {
            this.clickQuestion.emit(log);;
        });
        this._snakbarRef.instance.contentEvent.subscribe(_id => {
            this.clickContent.emit(_id);
        });
        this._snakbarRef.instance.confirmEvent.subscribe(log => {
            this.clickConfirm.emit(log);
        });
        this._snakbarRef.instance.confirmAllEvent.subscribe(_id => {
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
