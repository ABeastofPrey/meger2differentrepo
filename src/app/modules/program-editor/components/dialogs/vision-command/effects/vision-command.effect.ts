import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { VisionCommandService } from '../services/vision-command.service';
import { VisionCommandTypes, getVisionCommandSuccess } from '../actions/vision-command.actions';
import { switchMap, map as rxjsMap } from 'rxjs/operators';

@Injectable()
export class VisionCommandEffect {
    constructor(private actions$: Actions, private service: VisionCommandService) { }

    @Effect()
    retrieveVisionCommandList = this.actions$.pipe(
        ofType(VisionCommandTypes.GetVisionCommand),
        switchMap(() => this.service.retrieveVisionCommandList()),
        rxjsMap(visionCommands => getVisionCommandSuccess({ visionCommands }))
    );
}