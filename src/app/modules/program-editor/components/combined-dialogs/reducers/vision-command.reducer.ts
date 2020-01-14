import { createReducer, Action, on } from '@ngrx/store';
import { State, initialState, adapter } from '../entities/vision-command.entity';
import { getVisionCommandSuccess, selectStationName, updateVisionCommand } from '../actions/vision-command.actions';

export const visionCommandFeatureKey = 'visionCommand';

export const visionCommandReducer = createReducer(
    initialState,
    on(getVisionCommandSuccess, (state, { visionCommands }) => adapter.addAll(visionCommands, state)),
    on(selectStationName, (state, { id: selectedVisionCommandId }) => Object.assign({ ...state, selectedVisionCommandId })),
    on(updateVisionCommand, (state, { visionCommand }) => adapter.updateOne(visionCommand, state))
);

export function reducer (state: State, action: Action): State {
    return visionCommandReducer(state, action);
}

export const {
    selectEntities,
    selectAll
} = adapter.getSelectors();

export const getSelectedVisionCommandId = (state: State) => state.selectedVisionCommandId;
