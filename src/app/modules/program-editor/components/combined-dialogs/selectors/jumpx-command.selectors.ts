import { createSelector, createFeatureSelector } from '@ngrx/store';
import { jumpxCommandFeatureKey } from '../reducers/jumpx-command.reducers';
import { selectEntities, getSelectedJumpxCommandId, isLoading, State } from '../entities/jumpx-command.entity';

export const selectJumpxCommand = createFeatureSelector<State>(jumpxCommandFeatureKey);

export const selectJumpxCommandEntities = createSelector(selectJumpxCommand, selectEntities);

export const selectCurrentJumpxCommandId = createSelector(selectJumpxCommand, getSelectedJumpxCommandId);

export const selectCurrentJumpxCommand = createSelector(selectJumpxCommandEntities, selectCurrentJumpxCommandId, (entities, id) => entities[id]);

export const isSelectJumpxCommanding = createSelector(selectJumpxCommand, isLoading);
