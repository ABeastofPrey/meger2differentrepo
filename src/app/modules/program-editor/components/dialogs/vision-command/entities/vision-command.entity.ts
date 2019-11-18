import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { VisionCommand } from '../models/vision-command.model';

export interface State extends EntityState<VisionCommand> {
    selectedVisionCommandId: number | null
}

export const adapter: EntityAdapter<VisionCommand> = createEntityAdapter({
    selectId: (x: VisionCommand) => x.id,
});

export const initialState: State = adapter.getInitialState({
    selectedVisionCommandId: null
});
