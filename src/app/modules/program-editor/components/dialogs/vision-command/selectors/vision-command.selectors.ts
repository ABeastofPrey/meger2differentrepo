import { createSelector, createFeatureSelector } from '@ngrx/store';
import { State as VisionCommandState } from '../entities/vision-command.entity';
import { visionCommandFeatureKey, selectAll, selectEntities, getSelectedVisionCommandId } from '../reducers/vision-command.reducer';

export const selectVisionCommand = createFeatureSelector<VisionCommandState>(visionCommandFeatureKey);

export const selectAllVisionCommand = createSelector(selectVisionCommand, selectAll);

export const selectVisionCommandEntities = createSelector(selectVisionCommand, selectEntities);

export const selectCurrentVisionCommandId = createSelector(selectVisionCommand, getSelectedVisionCommandId);

export const selectCurrentVisionCommand = createSelector(
    selectVisionCommandEntities,
    selectCurrentVisionCommandId,
    (entities, id) => entities[id]
);
