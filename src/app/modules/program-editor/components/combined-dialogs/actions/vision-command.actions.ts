import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { VisionCommand } from '../models/vision-command.model';

export enum VisionCommandTypes {
    GetVisionCommand = '[VisionCommand] Get Vision Command',
    GetVisionCommandSuccess = '[VisionCommand] Get Vision Command Success',
    SelectStationName = '[VisionCommand] Select Station Name',
    UpdateVisionCommand = '[VisionCommand] Updata Vision Command'
}

export const getVisionCommand = createAction(VisionCommandTypes.GetVisionCommand);

export const getVisionCommandSuccess = createAction(VisionCommandTypes.GetVisionCommandSuccess, props<{ visionCommands: VisionCommand[] }>());

export const selectStationName = createAction(VisionCommandTypes.SelectStationName, props<{ id: number }>());

export const updateVisionCommand = createAction(VisionCommandTypes.UpdateVisionCommand, props<{ visionCommand: Update<VisionCommand> }>());
