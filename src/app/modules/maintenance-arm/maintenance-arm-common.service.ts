import { Injectable, OnDestroy } from '@angular/core';
import { WebsocketService, TpStatService } from '../core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import { MaintenanceDialogComponent } from './maintenance-dialog/maintenance-dialog.component';
import { ParamsType, CompareResult, MAINTENANCEARMSTATUS, MaintenanceProgressStaus, RARM_ROBOT_STATUS } from './maintenance-arm.model';



@Injectable({ providedIn: 'root' })
export class MaintenanceArmCommonService implements OnDestroy {

  private static maintanenceDialogRef: MatDialogRef<MaintenanceDialogComponent>;

  private isLoadingDoneSub: Subscription;

  private statusSub: Subscription;
  constructor(private ws: WebsocketService,
    private tpStatService: TpStatService,
    private dialog: MatDialog) {
  }

  ngOnDestroy() {
    this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
  }


  //after login restore parameters
  public resoreParamsAfterLogin() {
    const value = window.sessionStorage.getItem(MAINTENANCEARMSTATUS);//is unfineshed should show the dialog
    if (value === MaintenanceProgressStaus.unFindeshed) return;
    this.watchLoadinStatus();
  }


  //maintenance arm and cabinet
  private resorationArmOrCabinetParams() {
    this.statusSub && this.statusSub.unsubscribe();
    this.statusSub = this.tpStatService.onlineStatus
      .subscribe(async status => {
        if (!status) return;
        this.statusSub && this.statusSub.unsubscribe();

        let robotType = await this.checkRobotType().then();
        if (robotType !== RARM_ROBOT_STATUS.Match) {
          this.openMaintenanceDialog(robotType)
          return;
        }

        let checkRes = await this.compareArmParamatersWithController().then();
        if (checkRes === CompareResult.Same) {
          this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
          this.statusSub && this.statusSub.unsubscribe();
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
    if (MaintenanceArmCommonService.maintanenceDialogRef) return;
    this.setMaintenanceStatus(MaintenanceProgressStaus.unFindeshed);
    const paramsType = await this.getResoreParametersType();
    MaintenanceArmCommonService.maintanenceDialogRef = this.dialog
      .open(MaintenanceDialogComponent, {
        data: {
          robotType: robotType,
          paramsType: paramsType,
        },
        width: '500px',
        height: "306px",
        hasBackdrop: true,
      });
    MaintenanceArmCommonService.maintanenceDialogRef.afterClosed()
      .subscribe(res => {
        this.statusSub && this.statusSub.unsubscribe();
        this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
        this.setMaintenanceStatus(MaintenanceProgressStaus.finished);
        MaintenanceArmCommonService.maintanenceDialogRef = null;
      });

  }

  //set maintenance statsu
  /**
   *
   * @param value 0 not on the progress after reload window 1is on the maintinenance progress
   */
  private setMaintenanceStatus(value: MaintenanceProgressStaus) {
    window.sessionStorage.setItem(MAINTENANCEARMSTATUS, value);
  }

  //watch system refresh
  public getMaitenanceRestorationStatus() {
    this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
    const value = window.sessionStorage.getItem(MAINTENANCEARMSTATUS);
    if (!value || value === MaintenanceProgressStaus.finished) return;
    this.watchLoadinStatus();
  }

  /**
   * if Loading done open maintenance dialog
   */
  private watchLoadinStatus() {
    this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
    this.isLoadingDoneSub = this.tpStatService.onloadingStatus.subscribe((res) => {
      if (!res) return;
      this.isLoadingDoneSub && this.isLoadingDoneSub.unsubscribe();
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



