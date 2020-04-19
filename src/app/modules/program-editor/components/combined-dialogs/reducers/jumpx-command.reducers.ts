import { createReducer, Action, on } from '@ngrx/store';
import { State, adapter, initialState } from '../entities/jumpx-command.entity';
import {
    initJumpxCommandSuccess,
    getJumpxCommand, getJumpxCommandSuccess, selectJumpxCommand, createVarSuccess,
    selectMotionElement, selectAscendingPoint, selectDescendingPoint,
    selectTargetPoint, selectWithPls, inputArchNo, selectMotionElementSuccess,
    inputLimZ, inputBlendingPercentage, InputVscale, inputAcc, inputVtrans, updateJumpxCommand,
} from '../actions/jumpx-command.actions';

export const jumpxCommandFeatureKey = 'jumpxCommand';

const updateOne = (state, { jumpxCommand }) => adapter.updateOne(jumpxCommand, state);

export const jumpxCommandReducer = createReducer(
    initialState,
    on(initJumpxCommandSuccess, (state, { jumpxCommand }) => adapter.upsertOne(jumpxCommand, { ...state, selectedJumpxCommandId: 0, loading: false })),
    // on(getJumpxCommand, state => ({ ...state, loading: true })),
    on(getJumpxCommandSuccess, (state, { jumpxCommand }) => adapter.updateOne(jumpxCommand, { ...state, selectedJumpxCommandId: 0, loading: false })),
    on(selectJumpxCommand, (state, { id: selectedJumpxCommandId }) => Object.assign({ ...state, selectedJumpxCommandId })),
    on(selectMotionElement, updateOne),
    on(selectAscendingPoint, updateOne),
    on(selectDescendingPoint, updateOne),
    on(selectTargetPoint, updateOne),
    on(selectWithPls, updateOne),
    on(inputArchNo, updateOne),
    on(inputLimZ, updateOne),
    on(inputBlendingPercentage, updateOne),
    on(InputVscale, updateOne),
    on(inputVtrans, updateOne),
    on(inputAcc, updateOne),
    on(createVarSuccess, updateOne),
    on(selectMotionElementSuccess, updateOne),
    on(updateJumpxCommand, updateOne),
);

export function reducer(state: State, action: Action): State {
    return jumpxCommandReducer(state, action);
}
