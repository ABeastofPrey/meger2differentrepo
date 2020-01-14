import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { JumpxCommand } from '../models/jumpx-command.model';
import { prop } from 'ramda';

export interface State extends EntityState<JumpxCommand> {
    selectedJumpxCommandId: null | number;
    loading: boolean;
}

export const adapter: EntityAdapter<JumpxCommand> = createEntityAdapter({
    selectId: prop('id')
});

export const initialState: State = adapter.getInitialState({
    selectedJumpxCommandId: null,
    loading: false,
});

export const { selectEntities } = adapter.getSelectors();

export const getSelectedJumpxCommandId: (state: State) => null | number = prop('selectedJumpxCommandId');

export const isLoading: (state: State) => boolean = prop('loading');