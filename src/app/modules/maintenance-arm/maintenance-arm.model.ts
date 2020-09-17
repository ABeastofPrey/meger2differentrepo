export enum MaintenanceStepId {
  ERROR = "ERROR",// PN and SN is not match
  USERSWITCH = 'USERSWITCH',//value should same with I18StepTitle、NextBtnName's key after upCase transiform
  PARAMETERSELECTION = 'PARAMETERSELECTION',
  CHOICECONFIRM = 'CHOICECONFIRM',
  RESTORATION = 'RESTORATION'
}

export enum ParamsType {
  Controller = 1,
  Arm = 2,
  Both = 3,
}


export const MAINTENANCEARMSTATUS = 'maintenanceArmStatus';

export enum CompareResult {
  diff = 0,//arm and controller parameters are different
  Same = 1,
}
export enum MaintenanceProgressStaus {
  finished = '1',
  unFindeshed = '2'
}
export enum RARM_ROBOT_STATUS {
  Match = 1,
  ERROR = -1,//
  SN_NOT_MATCH = -2,
  SN_PN_NOT_MATCH = -3,
}

export interface IMaintenanceDialogParams {
  robotType?: RARM_ROBOT_STATUS;
  paramsType: ParamsType;
}
