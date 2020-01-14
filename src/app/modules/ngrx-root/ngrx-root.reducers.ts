import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { InjectionToken } from '@angular/core';
import { State as JumpxCommandState } from '../program-editor/components/combined-dialogs/entities/jumpx-command.entity';
import { jumpxCommandFeatureKey, reducer as jumpxCommandReducer } from '../program-editor/components/combined-dialogs/reducers/jumpx-command.reducers';
import { JumpxCommandEffects } from '../program-editor/components/combined-dialogs/effects/jumpx-command.effects';

import { State as VisionCommandState } from '../program-editor/components/combined-dialogs/entities/vision-command.entity';
import { visionCommandFeatureKey, reducer as visionCommandReducer } from '../program-editor/components/combined-dialogs/reducers/vision-command.reducer';
import { VisionCommandEffects } from '../program-editor/components/combined-dialogs/effects/vision-command.effect';

export interface AppState {
    [jumpxCommandFeatureKey]: JumpxCommandState,
    [visionCommandFeatureKey]: VisionCommandState
}

export const reducers: ActionReducerMap<AppState> = { 
    [jumpxCommandFeatureKey]: jumpxCommandReducer,
    [visionCommandFeatureKey]: visionCommandReducer
};

// export const initialState: AppState = {
//     [jumpxCommandFeatureKey]: jumpxInitialState,
//     [visionCommandFeatureKey]: visionCommandInitialState
// }

export const effectsList = [JumpxCommandEffects, VisionCommandEffects];

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

export const reducerToken = new InjectionToken<ActionReducerMap<AppState>>('Registered Reducers');

export const reducerProvider = [
  { provide: reducerToken, useValue: reducers }
];
