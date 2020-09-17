import { Injectable, OnDestroy } from '@angular/core';
import { TpStatService, WebsocketService } from '../core';
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import { MaintenanceDialogComponent } from './maintenance-dialog/maintenance-dialog.component';
import { SysLogSnackBarService } from '../sys-log/services/sys-log-snack-bar.service';
import { UtilsService } from '../core/services/utils.service';
import { ParamsType } from './maintenance-arm.model';

enum MaintenanceResult {
  Fialed = 0,
  Successed = 1
}


@Injectable({ providedIn: 'root' })
export class MaintenanceArmService implements OnDestroy {

  private statusSub: Subscription;

  constructor(private ws: WebsocketService,
    private tpStatService: TpStatService,
    private utilsService: UtilsService,
    private snackbarService: SysLogSnackBarService) {
  }

  ngOnDestroy() {
    this.statusSub && this.statusSub.unsubscribe();
  }


  /**
   *
   * @param dialogRef
   * @param paramsType  arm controller can use
   */
  restoration(dialogRef: MatDialogRef<MaintenanceDialogComponent>, paramsType: ParamsType): Promise<boolean> {

    return new Promise<any>((resolve) => {
      this.ws.simpleQuery(`?RARM_WRITE_DATA(${paramsType})`).subscribe((res) => {// “0” failed “1” successful
        dialogRef.close();
        this.statusSub && this.statusSub.unsubscribe();
        if (!+res) {
          this.setMaintenanceResult(MaintenanceResult.Fialed);
          this.snackbarService.openTipSnackBar('maintenance_arm.restoration.error');
          return resolve(false)
        } else {
          this.reloadSystem();
        }
        return resolve(true);
      });

    })

  }

  //reset system and reload system
  private reloadSystem() {
    //reset system
    this.utilsService.resetAll(true).then(resetRes => {
      this.watchSysState();
    });
  }

  public watchSysState(): void {
    //isOnline
    this.statusSub && this.statusSub.unsubscribe();
    this.statusSub = this.tpStatService.onlineStatus
      .subscribe(status => {
        if (!status) return;
        this.statusSub && this.statusSub.unsubscribe();
        this.setMaintenanceResult(MaintenanceResult.Successed);
      });
  }


  /**
   *
   * @param value
   */
  private setMaintenanceResult(value: MaintenanceResult) {
    this.ws.simpleQuery(`CALL RARM_HANDLE_RESULT(${value})`).subscribe();
  }

}
