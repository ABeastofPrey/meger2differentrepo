import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';

export interface AppState { }

export const reducers: ActionReducerMap<AppState> = { };

export const initialState: AppState = { }

export const metaReducers: Array<MetaReducer<AppState>> = !environment.production ? [] : [];
