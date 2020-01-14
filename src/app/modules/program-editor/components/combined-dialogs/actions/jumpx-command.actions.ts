import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { JumpxCommand } from '../models/jumpx-command.model';
// import { ClearCollections, EntityCacheAction } from '@ngrx/data';

export enum JumpxCommandTypes {
    InitJumpxCommand = '[JumpxCommand] Init Jumpx Command',
    InitJumpxCommandSuccess = '[JumpxCommand] Init Jumpx Command Success',
    GetJumpxCommand = '[JumpxCommand] Get Jumpx Command',
    GetJumpxCommandSuccess = '[JumpxCommand] Get Jumpx Command Success',
    SelectJumpxCommand = '[JumpxCommand] Select Jumpx Command',
    SelectMotionElement = '[JumpxCommand] Select Motion Element',
    SelectMotionElementSuccess = '[JumpxCommand] Select Motion Element Success',
    SelectAscendingPoint = '[JumpxCommand] Select Ascending Point',
    SelectDescendingPoint = '[JumpxCommand] Select Descending Point',
    SelectTargetPoint = '[JumpxCommand] Select Target Point',
    SelectWithPls = '[JumpxCommand] Select WithPls',
    InputArchNo = '[JumpxCommand] Input Arch No',
    InputLimZ = '[JumpxCommand] Input LimZ',
    InputBlendingPercentage = '[JumpxCommand] Input Blending Percentage',
    InputVcruise = '[JumpxCommand] Input Vcruise',
    InputVtrans = '[JumpxCommand] Input Vtrans',
    InputAcc = '[JumpxCommand] Input Acc',
    CreateVar = '[JumpxCommand] Create Variable',
    CreateVarSuccess = '[JumpxCommand] Create Variable Success',
    UpdateJumpxCommand = '[JumpxCommand] Update Jumpx Command',
}

export const initJumpxCommand = createAction(JumpxCommandTypes.InitJumpxCommand);

export const initJumpxCommandSuccess = createAction(JumpxCommandTypes.InitJumpxCommandSuccess, props<{ jumpxCommand: JumpxCommand }>());

export const getJumpxCommand = createAction(JumpxCommandTypes.GetJumpxCommand);

export const getJumpxCommandSuccess = createAction(JumpxCommandTypes.GetJumpxCommandSuccess, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const selectJumpxCommand = createAction(JumpxCommandTypes.SelectJumpxCommand, props<{ id: number }>());

export const selectMotionElement = createAction(JumpxCommandTypes.SelectMotionElement, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const selectMotionElementSuccess = createAction(JumpxCommandTypes.SelectMotionElementSuccess, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const selectAscendingPoint = createAction(JumpxCommandTypes.SelectAscendingPoint, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const selectDescendingPoint = createAction(JumpxCommandTypes.SelectDescendingPoint, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const selectTargetPoint = createAction(JumpxCommandTypes.SelectTargetPoint, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const selectWithPls = createAction(JumpxCommandTypes.SelectWithPls, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const inputArchNo = createAction(JumpxCommandTypes.InputArchNo, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const inputLimZ = createAction(JumpxCommandTypes.InputLimZ, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const inputBlendingPercentage = createAction(JumpxCommandTypes.InputBlendingPercentage, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const inputVcruise = createAction(JumpxCommandTypes.InputVcruise, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const inputVtrans = createAction(JumpxCommandTypes.InputVtrans, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const inputAcc = createAction(JumpxCommandTypes.InputAcc, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const createVar = createAction(JumpxCommandTypes.CreateVar);

export const createVarSuccess = createAction(JumpxCommandTypes.CreateVarSuccess, props<{ jumpxCommand: Update<JumpxCommand> }>());

export const updateJumpxCommand = createAction(JumpxCommandTypes.UpdateJumpxCommand, props<{ jumpxCommand: Update<JumpxCommand> }>());

// export const clearCatch = new ClearCollections(['jumpxCommand'], EntityCacheAction.CLEAR_COLLECTIONS);