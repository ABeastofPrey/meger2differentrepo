import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { and, when, always, identity, concat, find, reduce, filter, compose, useWith } from 'ramda';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { JumpxCommand } from '../../models/jumpx-command.model';
import { CommandType, CommandOptions, CommandOptionAuth, GetCommandOption } from '../../enums/jumpx-command.enums';
import { selectCurrentJumpxCommand } from '../../selectors/jumpx-command.selectors';
import { UtilsService } from '../../../../../core/services/utils.service';
import { AddVarComponent } from '../../../add-var/add-var.component';
import * as fromActions from '../../actions/jumpx-command.actions';
import { TPVariable } from '../../../../../core/models/tp/tp-variable.model';
import { DataService } from '../../../../../core/services';
import { isNotNil } from 'ramda-adjunct';

@Component({
    templateUrl: './jumpx-command.component.html',
    styleUrls: ['./jumpx-command.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JumpxCommandComponent implements OnInit, OnDestroy {
    public commandType: CommandType;
    public CommandOptions = CommandOptions;
    public commandOptionAuth: CommandOptionAuth;
    public model: JumpxCommand;
    public form: FormGroup;
    public isAdvanced: boolean;
    private modelSubscription: Subscription;
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { type: CommandType, model: any },
        public dialogRef: MatDialogRef<any>,
        private store: Store<JumpxCommand>,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private util: UtilsService,
        private actions$: Actions,
        private ds: DataService,
    ) {
        this.store.dispatch(fromActions.initJumpxCommand());

        this.form = this.fb.group({
            id: [],
            [CommandOptions.MotionElement]: [null],
            [CommandOptions.WithPls]: [null],
        });
        this.commandType = data.type;
        this.commandOptionAuth = new CommandOptionAuth(this.commandType);
        this.modelSubscription = this.store.select(selectCurrentJumpxCommand).subscribe(m => {
            this.model = m;
        });
        const sub = this.actions$.pipe(ofType(fromActions.JumpxCommandTypes.GetJumpxCommandSuccess)).subscribe(() => {
            this.updateFormControl(this.commandOptionAuth, this.model);
            this.form.markAllAsTouched();
            sub.unsubscribe();
        });
    }

    ngOnInit(): void {
        this.initFormControls(this.commandOptionAuth);
        if (!!this.data.model) {
            this.patchModel(this.data.model);
            this.isAdvanced = true;
            this.store.dispatch(fromActions.getJumpxCommand());
        } else {
            this.store.dispatch(fromActions.getJumpxCommand());
        }
    }

    ngOnDestroy(): void {
        this.modelSubscription.unsubscribe();
    }

    private patchModel(dataModel): void {
        const removeTowDimension = filter(x => !x.isTwoDimension);
        const jointsAndLocaltions = useWith(Array, [removeTowDimension, removeTowDimension]);
        const [joints, locations] = compose(jointsAndLocaltions)(this.ds.joints, this.ds.locations);
        const points = concat(joints, locations);
        const tName = dataModel[CommandOptions.TargetPoint];
        const aName = dataModel[CommandOptions.AscendingPoint];
        const dName = dataModel[CommandOptions.DescendingPoint];
        const _find = name => points => find(p => p.name === name, points);
        const tp = _find(tName)(points);
        const ap = _find(aName)(points);
        const dp = _find(dName)(points);
        this.model = {
            [CommandOptions.AscendingPoint]: ap,
            [CommandOptions.AscendingJoPoints]: joints,
            [CommandOptions.AscendingLoPoints]: locations,
            [CommandOptions.AscendingPointIndex]: dataModel[CommandOptions.AscendingPointIndex],
            [CommandOptions.DescendingPoint]: dp,
            [CommandOptions.DescendingJoPoints]: joints,
            [CommandOptions.DescendingLoPoints]: locations,
            [CommandOptions.DescendingPointIndex]: dataModel[CommandOptions.DescendingPointIndex],
            [CommandOptions.TargetPoint]: tp,
            [CommandOptions.TargetJoPoints]: joints,
            [CommandOptions.TargetLoPoints]: locations,
            [CommandOptions.TargetPointIndex]: dataModel[CommandOptions.TargetPointIndex],
            [CommandOptions.MotionElements]: [dataModel[CommandOptions.MotionElement]],
            [CommandOptions.WithPlsList]: dataModel[CommandOptions.WithPls],
        } as any;
        const data = {
            ...dataModel,
            [CommandOptions.AscendingPoint]: ap,
            [CommandOptions.DescendingPoint]: dp,
            [CommandOptions.TargetPoint]: tp,
        };
        this.form.patchValue(data);
        const changeModel = {
            jumpxCommand: {
                id: 0, changes: {
                    ...this.model,
                    [CommandOptions.AscendingPoint]: { ...ap },
                    [CommandOptions.DescendingPoint]: { ...dp },
                    [CommandOptions.TargetPoint]: { ...tp },
                }
            }
        };
        this.store.dispatch(fromActions.updateJumpxCommand(changeModel));
    }

    public updateStore(option: CommandOptions, value: TPVariable | number | string | string[]): void {
        const changeModel = { jumpxCommand: { id: 0, changes: {} } };
        switch (option) {
            case CommandOptions.TargetPoint:
                changeModel.jumpxCommand.changes[CommandOptions.TargetPoint] = !value ? value : { ...(value as TPVariable) };
                changeModel.jumpxCommand.changes[CommandOptions.TargetPointIndex] = 1;
                this.form.patchValue({ [CommandOptions.TargetPointIndex]: 1 });
                this.store.dispatch(fromActions.selectTargetPoint(changeModel));
                break;
            case CommandOptions.TargetPointIndex:
                changeModel.jumpxCommand.changes[CommandOptions.TargetPointIndex] = value;
                this.store.dispatch(fromActions.selectTargetPoint(changeModel));
                break;
            case CommandOptions.AscendingPoint:
                changeModel.jumpxCommand.changes[CommandOptions.AscendingPoint] = !value ? value : { ...(value as TPVariable) };
                changeModel.jumpxCommand.changes[CommandOptions.AscendingPointIndex] = 1;
                this.form.patchValue({ [CommandOptions.AscendingPointIndex]: 1 });
                this.store.dispatch(fromActions.selectAscendingPoint(changeModel));
                break;
            case CommandOptions.AscendingPointIndex:
                changeModel.jumpxCommand.changes[CommandOptions.AscendingPointIndex] = value;
                this.store.dispatch(fromActions.selectAscendingPoint(changeModel));
                break;
            case CommandOptions.DescendingPoint:
                changeModel.jumpxCommand.changes[CommandOptions.DescendingPoint] = !value ? value : { ...(value as TPVariable) };
                changeModel.jumpxCommand.changes[CommandOptions.DescendingPointIndex] = 1;
                this.form.patchValue({ [CommandOptions.DescendingPointIndex]: 1 });
                this.store.dispatch(fromActions.selectDescendingPoint(changeModel));
                break;
            case CommandOptions.DescendingPointIndex:
                changeModel.jumpxCommand.changes[CommandOptions.DescendingPointIndex] = value;
                this.store.dispatch(fromActions.selectDescendingPoint(changeModel));
                break;
            case CommandOptions.MotionElement:
                changeModel.jumpxCommand.changes[CommandOptions.MotionElement] = value;
                this.store.dispatch(fromActions.selectMotionElement(changeModel));
                break;
            case CommandOptions.WithPls:
                changeModel.jumpxCommand.changes[CommandOptions.WithPls] = value;
                this.store.dispatch(fromActions.selectWithPls(changeModel));
                break;
            case CommandOptions.Acc:
                changeModel.jumpxCommand.changes[CommandOptions.Acc] = value;
                this.store.dispatch(fromActions.inputAcc(changeModel));
                break;
            case CommandOptions.ArchNo:
                changeModel.jumpxCommand.changes[CommandOptions.ArchNo] = value;
                this.store.dispatch(fromActions.inputArchNo(changeModel));
                break;
            case CommandOptions.LimZ:
                changeModel.jumpxCommand.changes[CommandOptions.LimZ] = value;
                this.store.dispatch(fromActions.inputLimZ(changeModel));
                break;
            case CommandOptions.VScale:
                changeModel.jumpxCommand.changes[CommandOptions.VScale] = value;
                this.store.dispatch(fromActions.InputVscale(changeModel));
                break;
            case CommandOptions.Vtran:
                changeModel.jumpxCommand.changes[CommandOptions.Vtran] = value;
                this.store.dispatch(fromActions.inputVtrans(changeModel));
                break;
            case CommandOptions.BlendingPercentage:
                changeModel.jumpxCommand.changes[CommandOptions.BlendingPercentage] = value;
                this.store.dispatch(fromActions.inputBlendingPercentage(changeModel));
                break;
        }
    }

    private initFormControls(auth: CommandOptionAuth): void {
        const { hasAcc, hasArchNo, hasLimZ, hasBlendingPercentage, hasVcruise } = auth;
        const { hasTargetPoint, hasAscendingPoint, hasDescendingPoint, hasVtran } = auth;
        const addControl = (key: CommandOptions) => {
            this.form.addControl(key, new FormControl());
        };
        const addRequiredControl = (key: CommandOptions, defalut) => {
            this.form.addControl(key, new FormControl(defalut, Validators.required));
        };
        const addAccControl = () => addControl(CommandOptions.Acc);
        const addArchNoControl = () => addControl(CommandOptions.ArchNo);
        const addLimZControl = () => addControl(CommandOptions.LimZ);
        const addVcruiseControl = () => addControl(CommandOptions.VScale);
        const addVtransControl = () => addControl(CommandOptions.Vtran);
        const addBlendingPercentageControl = () => addControl(CommandOptions.BlendingPercentage);
        const addTargetPointControl = () => addRequiredControl(CommandOptions.TargetPoint, null);
        const addTargetPointIndexControl = () => addRequiredControl(CommandOptions.TargetPointIndex, 1);
        const addAscendingPointControl = () => addRequiredControl(CommandOptions.AscendingPoint, null);
        const addAscendingPointIndexControl = () => addRequiredControl(CommandOptions.AscendingPointIndex, 1);
        const addDescendingPointControl = () => addRequiredControl(CommandOptions.DescendingPoint, null);
        const addDescendingPointIndexControl = () => addRequiredControl(CommandOptions.DescendingPointIndex, 1);
        when(identity, addAccControl)(hasAcc);
        when(identity, addArchNoControl)(hasArchNo);
        when(identity, addLimZControl)(hasLimZ);
        when(identity, addVcruiseControl)(hasVcruise);
        when(identity, addVtransControl)(hasVtran);
        when(identity, addBlendingPercentageControl)(hasBlendingPercentage);
        when(identity, addTargetPointControl)(hasTargetPoint);
        when(identity, addTargetPointIndexControl)(hasTargetPoint);
        when(identity, addAscendingPointControl)(hasAscendingPoint);
        when(identity, addAscendingPointIndexControl)(hasAscendingPoint);
        when(identity, addDescendingPointControl)(hasDescendingPoint);
        when(identity, addDescendingPointIndexControl)(hasDescendingPoint);
    }

    private updateFormControl(auth: CommandOptionAuth, model: JumpxCommand): void {
        const { hasArchNo, hasAcc, hasLimZ, hasVcruise, hasVtran, hasBlendingPercentage } = auth;
        const addControl = (key: CommandOptions, [min, max]: number[], canBeDecimal = true, leftClosedInterval = true) => {
            if (isNotNil(max) && isNotNil(min)) {
                this.form.controls[key].setValidators(this.util.limitValidator(min, max, canBeDecimal, leftClosedInterval));
            };
        };
        const addArchNoControl = () => addControl(CommandOptions.ArchNo, model[CommandOptions.ArchNoLimit], false);
        const addAccControl = () => addControl(CommandOptions.Acc, model[CommandOptions.AccLimit], true, false);
        const addLimZControl = () => addControl(CommandOptions.LimZ, model[CommandOptions.LimZLimit]);
        const addBlendingPercentageControl = () => addControl(CommandOptions.BlendingPercentage, model[CommandOptions.BlendingPercentageLimit]);
        const addVcruiseControl = () => addControl(CommandOptions.VScale, model[CommandOptions.VcruiseLimit]);
        const addVtransControl = () => addControl(CommandOptions.Vtran, model[CommandOptions.VtranLimit]);
        when(identity, addArchNoControl)(hasArchNo);
        when(identity, addLimZControl)(hasLimZ);
        when(identity, addBlendingPercentageControl)(hasBlendingPercentage);
        when(identity, addVcruiseControl)(hasVcruise);
        when(identity, addVtransControl)(hasVtran);
        when(identity, addAccControl)(hasAcc);
    }

    public createVar(type: CommandOptions, varType: string = 'LONG'): void {
        const option = {
            hasBackdrop: false,
            data: {
                varType: varType
            }
        };
        this.dialog.open(AddVarComponent, option).afterClosed().subscribe((addedVar: string) => {
            if (!addedVar) { return; }
            const sub = this.actions$.pipe(ofType(fromActions.JumpxCommandTypes.CreateVarSuccess)).subscribe(res => {
                const isVar = x => x.name === addedVar;
                const _find = name => points => find(p => p.name === name, points);
                const tName = this.form.value[CommandOptions.TargetPoint] && this.form.value[CommandOptions.TargetPoint].name;
                const aName = this.form.value[CommandOptions.AscendingPoint] && this.form.value[CommandOptions.AscendingPoint].name;
                const dName = this.form.value[CommandOptions.DescendingPoint] && this.form.value[CommandOptions.DescendingPoint].name;
                const targetPoints = concat(this.model[CommandOptions.TargetJoPoints], this.model[CommandOptions.TargetLoPoints]);
                const ascendingPoints = concat(this.model[CommandOptions.AscendingJoPoints], this.model[CommandOptions.AscendingLoPoints]);
                const descendingPoints = concat(this.model[CommandOptions.DescendingJoPoints], this.model[CommandOptions.DescendingLoPoints]);
                let patchOption = {
                    [CommandOptions.TargetPoint]: !tName ? null : _find(tName)(targetPoints),
                    [CommandOptions.AscendingPoint]: !aName ? null : _find(aName)(ascendingPoints),
                    [CommandOptions.DescendingPoint]: !dName ? null : _find(dName)(descendingPoints),
                };
                let addedPoint;
                switch (type) {
                    case CommandOptions.TargetPoint:
                        addedPoint = find(isVar, targetPoints);
                        patchOption[CommandOptions.TargetPoint] = addedPoint;
                        patchOption[CommandOptions.TargetPointIndex] = 1
                        break;
                    case CommandOptions.AscendingPoint:
                        addedPoint = find(isVar, ascendingPoints);
                        patchOption[CommandOptions.AscendingPoint] = addedPoint;
                        patchOption[CommandOptions.AscendingPointIndex] = 1;
                        break;
                    case CommandOptions.DescendingPoint:
                        addedPoint = find(isVar, descendingPoints);
                        patchOption[CommandOptions.DescendingPoint] = addedPoint;
                        patchOption[CommandOptions.DescendingPointIndex] = 1;
                };
                if (addedPoint !== undefined) {
                    this.form.patchValue(patchOption);
                    this.updateStore(type, addedPoint);
                }
                sub.unsubscribe();
            });
            this.store.dispatch(fromActions.createVar());
        });
    }

    public submitForm({ value, valid, touched }: FormGroup): void {
        const touchedAndValid = always(and(touched, valid));
        const commandOption: GetCommandOption = {
            [CommandOptions.TargetPoint]: value[CommandOptions.TargetPoint] ? (
                value[CommandOptions.TargetPoint].isArr ? `${value[CommandOptions.TargetPoint].name}[${value[CommandOptions.TargetPointIndex]}]` : value[CommandOptions.TargetPoint].name
            ) : null,
            [CommandOptions.AscendingPoint]: value[CommandOptions.AscendingPoint] ? (
                value[CommandOptions.AscendingPoint].isArr ? `${value[CommandOptions.AscendingPoint].name}[${value[CommandOptions.AscendingPointIndex]}]` : value[CommandOptions.AscendingPoint].name
            ) : null,
            [CommandOptions.DescendingPoint]: value[CommandOptions.DescendingPoint] ? (
                value[CommandOptions.DescendingPoint].isArr ? `${value[CommandOptions.DescendingPoint].name}[${value[CommandOptions.DescendingPointIndex]}]` : value[CommandOptions.DescendingPoint].name
            ) : null,
            [CommandOptions.MotionElement]: value[CommandOptions.MotionElement],
            [CommandOptions.BlendingPercentage]: value[CommandOptions.BlendingPercentage],
            [CommandOptions.ArchNo]: value[CommandOptions.ArchNo],
            [CommandOptions.LimZ]: value[CommandOptions.LimZ],
            [CommandOptions.VScale]: value[CommandOptions.VScale],
            [CommandOptions.Vtran]: value[CommandOptions.Vtran],
            [CommandOptions.Acc]: value[CommandOptions.Acc],
            [CommandOptions.WithPls]: value[CommandOptions.WithPls],
        };
        const command = this.getCommand(this.commandOptionAuth, commandOption);
        const emitCommand = cmd => this.dialogRef.close(cmd);
        when(touchedAndValid, emitCommand)(command);
    }

    private getCommand(auth: CommandOptionAuth, option: any): string {
        let command = '';
        if (auth.hasMotionElement && this.isAdvanced) {
            command = !option[CommandOptions.MotionElement] ? '' : option[CommandOptions.MotionElement] + ' ';
        }
        if (auth.hasAscendingPoint) {
            command += `${CommandOptions.AscendingPoint}=${option[CommandOptions.AscendingPoint]} `;
        }
        if (auth.hasDescendingPoint) {
            command += `${CommandOptions.DescendingPoint}=${option[CommandOptions.DescendingPoint]} `;
        }
        if (auth.hasTargetPoint) {
            if (this.commandType === CommandType.Jump) {
                command += `${option[CommandOptions.TargetPoint]} `;
            } else {
                command += `${CommandOptions.TargetPoint}=${option[CommandOptions.TargetPoint]} `;
            }
        }
        if (!this.isAdvanced) {
            return `${this.commandType} ${command}`;
        }
        // Advanced parameters
        if (auth.hasArchNo) {
            command += !option[CommandOptions.ArchNo] ? '' : `${CommandOptions.ArchNo}=${option[CommandOptions.ArchNo]} `;
        }
        if (auth.hasLimZ) {
            command += !option[CommandOptions.LimZ] ? '' : `${CommandOptions.LimZ}=${option[CommandOptions.LimZ]} `;
        }
        if (auth.hasBlendingPercentage) {
            command += !option[CommandOptions.BlendingPercentage] ? '' : `${CommandOptions.BlendingPercentage}=${option[CommandOptions.BlendingPercentage]} `;
        }
        if (auth.hasVcruise) {
            command += !option[CommandOptions.VScale] ? '' : `${CommandOptions.VScale}=${option[CommandOptions.VScale]} `;
        }
        if (auth.hasVtran) {
            command += !option[CommandOptions.Vtran] ? '' : `${CommandOptions.Vtran}=${option[CommandOptions.Vtran]} `;
        }
        if (auth.hasAcc) {
            command += !option[CommandOptions.Acc] ? '' : `${CommandOptions.Acc}=${option[CommandOptions.Acc]} `;
        }
        if (auth.hasWithPls) {
            command += (!option[CommandOptions.WithPls] || !option[CommandOptions.WithPls].length) ? '' : (
                reduce((acc, x) => (`${acc}${CommandOptions.WithPls}=${x} `), '')(option[CommandOptions.WithPls])
            );
        }
        return `${this.commandType} ${command}`;
    }
}
