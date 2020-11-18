import { Component, OnInit, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoginService } from '../../core';
import { MaintenanceArmService } from '../maintenance-arm.service';
import { MaintenanceStepId, ParamsType, RARM_ROBOT_STATUS, IMaintenanceDialogParams } from '../maintenance-arm.model';

enum I18StepTitle {
  ERROR = 'maintenance_arm.error.title',
  USERSWITCH = 'maintenance_arm.user_switcher.title',
  PARAMETERSELECTION = 'maintenance_arm.parameter_selection.title',
  CHOICECONFIRM = 'maintenance_arm.choice_confirm.title',
  RESTORATION = 'maintenance_arm.restoration.title',
}

enum NextBtnName {
  ERROR = "button.confirm",
  USERSWITCH = 'button.logout',
  PARAMETERSELECTION = 'maintenance_arm.parameter_selection.btnName',
  CHOICECONFIRM = 'maintenance_arm.choice_confirm.btnName',
  RESTORATION = 'maintenance_arm.restoration.btnName',
}

enum UnexpectionError {
  ERROR = "maintenance_arm.error.tips",
  SN_NOT_MATCH = "maintenance_arm.not_match.SN_not_match",
  SN_PN_NOT_MATCH = 'maintenance_arm.not_match.SN_PN_not_match'
}
interface IStep {
  title: I18StepTitle;
  id: MaintenanceStepId; //1
  btnName: string;
  disabled?: boolean;
}


@Component({
  selector: 'app-maintenance-dialog',
  templateUrl: './maintenance-dialog.component.html',
  styleUrls: ['./maintenance-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceDialogComponent implements OnInit {

  public stepInfo: IStep = {
    title: null,
    id: null,
    btnName: null,
    disabled: false,
  };


  public tips = '';

  public robotPNOrSNStatus: RARM_ROBOT_STATUS;

  public Steps = MaintenanceStepId;

  public headerTips: string = '';

  public ParamsTypes = ParamsType;
  public paramsType = ParamsType.Controller; // one of arm controller
  public avalibleParams; // one of arm controller both

  constructor(@Inject(MAT_DIALOG_DATA) public data: IMaintenanceDialogParams,
    public dialogRef: MatDialogRef<MaintenanceDialogComponent, boolean>,
    private maintenanceArmService: MaintenanceArmService,
    private changeDeractor: ChangeDetectorRef,
    public loginService: LoginService) {

  }

  ngOnInit() {
    this.initParams(this.data);
  }

  private initParams(data): void {
    if (data) {
      if (data.robotType === RARM_ROBOT_STATUS.ERROR) {
        this.tips = UnexpectionError.ERROR;
        this.setStepInfo(MaintenanceStepId.ERROR);
        return;
      }
      if (!this.loginService.isAdmin) {
        this.setStepInfo(MaintenanceStepId.USERSWITCH);
        return;
      }

      let avalibleParams = data.paramsType;
      if (data.robotType === RARM_ROBOT_STATUS.SN_NOT_MATCH) {
        this.tips = UnexpectionError.SN_NOT_MATCH;
        avalibleParams = ParamsType.Controller;// controller to arm
      } else if (data.robotType === RARM_ROBOT_STATUS.SN_PN_NOT_MATCH) {
        this.tips = UnexpectionError.SN_PN_NOT_MATCH;
        avalibleParams = ParamsType.Controller;//// controller to arm
      }

      this.setStepInfo(MaintenanceStepId.PARAMETERSELECTION);
      this.avalibleParams = avalibleParams;
      if (avalibleParams && avalibleParams !== ParamsType.Both) {
        this.paramsType = avalibleParams;
      }
    }
  }

  public async onNext(): Promise<void> {
    this.stepInfo.disabled = true;
    switch (this.stepInfo.id) {
      case MaintenanceStepId.ERROR:
        this.dialogRef.close();
        break;
      case MaintenanceStepId.PARAMETERSELECTION:
        this.stepInfo.disabled = false;
        this.setStepInfo(MaintenanceStepId.CHOICECONFIRM);
        break;
      case MaintenanceStepId.CHOICECONFIRM:
        this.setStepInfo(MaintenanceStepId.RESTORATION);
        this.stepInfo.disabled = true;
        await this.maintenanceArmService.restoration(this.dialogRef, this.paramsType).then();
        break;
      default:
        // this.setStepInfo(MaintenanceStepId.RESTORATION)
        this.loginService.logout();
        break;
    }
    this.changeDeractor.detectChanges();
  }
  public onBack(): void {
    this.setStepInfo(MaintenanceStepId.PARAMETERSELECTION);
  }

  public setStepInfo(stepId: MaintenanceStepId) {
    this.stepInfo.id = stepId;
    this.stepInfo.title = I18StepTitle[stepId];
    this.stepInfo.btnName = NextBtnName[stepId];
  }

}

