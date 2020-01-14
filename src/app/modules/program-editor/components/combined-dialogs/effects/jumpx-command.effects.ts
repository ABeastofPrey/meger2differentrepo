import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { JumpxCommandService } from '../services/jumpx-command.service';
import {
    JumpxCommandTypes, getJumpxCommandSuccess, initJumpxCommandSuccess,
    createVarSuccess, selectMotionElementSuccess, 
} from '../actions/jumpx-command.actions';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class JumpxCommandEffects {
    constructor(private actions: Actions, private service: JumpxCommandService) { }

    @Effect()
    initJumpxCommands = this.actions.pipe(
        ofType(JumpxCommandTypes.InitJumpxCommand),
        switchMap(() => {
            const jp = this.service.initJumpxCommand();
            return of(jp);
        }),
        map(jumpxCommand => initJumpxCommandSuccess({ jumpxCommand }))
    );

    @Effect()
    retirveJumpxCommands = this.actions.pipe(
        ofType(JumpxCommandTypes.GetJumpxCommand),
        switchMap(() => this.service.getJumpxCommand()),
        map(changeModel => getJumpxCommandSuccess({ jumpxCommand: changeModel }))
    );

    @Effect()
    selectMotionElement = this.actions.pipe(
        ofType(JumpxCommandTypes.SelectMotionElement),
        switchMap(({ jumpxCommand: { changes: { motionElement } } }) => {
            return this.service.selectMotionElement(motionElement);
        }),
        map(changeModel => selectMotionElementSuccess({ jumpxCommand: changeModel }))
    );

    @Effect()
    createVariable = this.actions.pipe(
        ofType(JumpxCommandTypes.CreateVar),
        switchMap(() => this.service.createVarSuccess()),
        map(changeModel => createVarSuccess({ jumpxCommand: changeModel }))
    );
}