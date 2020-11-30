import { Injectable, OnDestroy } from '@angular/core';
import { WebsocketService, TpStatService } from '../core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { MaintenanceDialogComponent } from './maintenance-dialog/maintenance-dialog.component';
import { ParamsType, CompareResult, RARM_ROBOT_STATUS } from './maintenance-arm.model';


@Injectable({ providedIn: 'root' })
export class MaintenanceArmCommonService implements OnDestroy {

  private static loadingStarted: boolean = false;

  private isLoadingDoneSub: Subscription;

  private statusSub: Subscription;
  constructor(private ws: WebsocketService,
    private tpStatService: TpStatService,
    private dialog: MatDialog) {
  }

  ngOnDestroy() {
    this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
  }


  //maintenance arm and cabinet
  private resorationArmOrCabinetParams() {
    this.statusSub && this.statusSub.unsubscribe();
    this.statusSub = this.tpStatService.onlineStatus
      .subscribe(async status => {
        if (!status) return;
        this.statusSub && this.statusSub.unsubscribe();
        let robotType = await this.checkRobotType();
        if (robotType !== RARM_ROBOT_STATUS.Match) {
          this.openMaintenanceDialog(robotType)
          return;
        }

        let checkRes = await this.compareArmParamatersWithController();
        if (checkRes === CompareResult.Same) {
          this.statusSub && this.statusSub.unsubscribe();
          MaintenanceArmCommonService.loadingStarted = false;
        } else {
          this.openMaintenanceDialog(robotType);
        }

      });
  }

  //compare Arm params with controller parammeters
  private async compareArmParamatersWithController(): Promise<CompareResult> {
    return new Promise(resolve => {
      this.ws.simpleQuery("?RARM_CHECK_RESULT").subscribe((res) => resolve(+res));
    });
  }

  //can restore paramsters type
  private getResoreParametersType(): Promise<ParamsType> {
    return new Promise(resolve => {
      this.ws.simpleQuery("?RARM_GET_WRITE_OPTION").subscribe((res) => resolve(+res));
    });
  }


  private async openMaintenanceDialog(robotType: RARM_ROBOT_STATUS) {
    const paramsType = await this.getResoreParametersType();
    const win = this.dialog
      .open(MaintenanceDialogComponent, {
        data: {
          robotType: robotType,
          paramsType: paramsType,
        },
        width: '500px',
        height: "306px",
        hasBackdrop: true,
      });
    win && win.afterClosed()
      .subscribe(res => {
        this.statusSub && this.statusSub.unsubscribe();
        MaintenanceArmCommonService.loadingStarted = false;
      });

  }

  /**
   * if Loading done open maintenance dialog
   */
  public watchLoadinStatus() {
    this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
    this.isLoadingDoneSub = this.tpStatService.onloadingStatus.subscribe((res) => {
      if (!res || MaintenanceArmCommonService.loadingStarted) return;
      MaintenanceArmCommonService.loadingStarted = true;
      this.resorationArmOrCabinetParams();
    });
  }

  //robot type is not match with sysytem
  private checkRobotType(): Promise<RARM_ROBOT_STATUS> {
    return new Promise(resolve => {
      this.ws.simpleQuery("?RARM_VALID_STATUS").subscribe((res) => resolve(+res));
    });
  }


}



