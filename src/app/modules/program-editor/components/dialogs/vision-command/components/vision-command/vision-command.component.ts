import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { isNull } from 'ramda-adjunct';
import { and, when, always, equals, identity } from 'ramda';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommandType, CommandOptions, GetCommandOption, CommandOptionAuth } from '../../enums/command-type.enum';
import { getVisionCommand, selectStationName, updateVisionCommand } from '../../actions/vision-command.actions';
import { selectAllVisionCommand, selectCurrentVisionCommand } from '../../selectors/vision-command.selectors';
import { VisionCommand } from '../../models/vision-command.model';
import { AddVarComponent } from '../../../../add-var/add-var.component';

@Component({
	selector: 'app-vision-command',
	templateUrl: './vision-command.component.html',
	styleUrls: ['./vision-command.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisionCommandComponent implements OnInit, OnDestroy {
	commandType: CommandType;
	CommandOptions = CommandOptions;
	commandOptionAuth: CommandOptionAuth;
	modelList: Observable<VisionCommand[]>;
	selectedModel: Observable<VisionCommand>;
	form: FormGroup = this.fb.group({
		id: [],
		[CommandOptions.Station]: [null, Validators.required],
		[CommandOptions.Job]: [null, Validators.required],
		[CommandOptions.Variable]: [null],
	});
	constructor(
		@Inject(MAT_DIALOG_DATA)
		private data: { type: CommandType },
		public dialogRef: MatDialogRef<VisionCommandComponent, string>,
		private store: Store<VisionCommand>,
		private dialog: MatDialog,
		private fb: FormBuilder,
	) {
		this.commandType = data.type;
		this.commandOptionAuth = new CommandOptionAuth(this.commandType);
		this.addFormControls(this.commandOptionAuth);
		this.modelList = store.select(selectAllVisionCommand);
		this.selectedModel = store.select(selectCurrentVisionCommand);
	}

	ngOnInit(): void {
		this.store.dispatch(getVisionCommand());
	}

	ngOnDestroy(): void {
		this.store.dispatch(selectStationName({ id: null }));
	}

	selectItem(vc: VisionCommand): void {
		const notChanged = equals(this.form.value.id, vc.id);
		if (notChanged) return;
		this.store.dispatch(selectStationName({ id: vc.id }));
		this.form.patchValue({
			id: vc.id,
			[CommandOptions.Station]: vc[CommandOptions.Station],
			jobName: null
		});
		this.updateStore(this.form.value);
	}

	updateStore(changedModel: VisionCommand): void {
		if (isNull(changedModel.id)) return;
		const option = {
			visionCommand: {
				id: changedModel.id,
				changes: {
					[CommandOptions.Job]: changedModel[CommandOptions.Job],
					[CommandOptions.Dimension]: changedModel[CommandOptions.Dimension],
					[CommandOptions.DataNum]: changedModel[CommandOptions.DataNum],
					[CommandOptions.AsData]: changedModel[CommandOptions.AsData],
					[CommandOptions.Status]: changedModel[CommandOptions.Status],
					[CommandOptions.Error]: changedModel[CommandOptions.Error],
					[CommandOptions.Variable]: changedModel[CommandOptions.Variable],
					[CommandOptions.Timeout]: changedModel[CommandOptions.Timeout]
				}
			}
		};
		this.store.dispatch(updateVisionCommand(option));
	}

	submitForm({ value, valid, touched }: FormGroup): void {
		const touchedAndValid = always(and(touched, valid));
		const commandOption: GetCommandOption = {
			[CommandOptions.Station]: value[CommandOptions.Station],
			[CommandOptions.Job]: value[CommandOptions.Job],
			[CommandOptions.Dimension]: value[CommandOptions.Dimension],
			[CommandOptions.DataNum]: value[CommandOptions.DataNum],
			[CommandOptions.AsData]: value[CommandOptions.AsData],
			[CommandOptions.Status]: value[CommandOptions.Status],
			[CommandOptions.Error]: value[CommandOptions.Error],
			[CommandOptions.Variable]: value[CommandOptions.Variable],
			[CommandOptions.Timeout]: value[CommandOptions.Timeout] ? value[CommandOptions.Timeout] : -1
		};
		const command = this.getCommand(this.commandType, commandOption);
		const emitCommand = cmd => this.dialogRef.close(cmd);
		when(touchedAndValid, emitCommand)(command);
	}

	createVar(type: CommandOptions, varType = 'LONG'): void {
		const option = {
			hasBackdrop: false,
			data: {
				varType
			}
		};
		this.dialog.open(AddVarComponent, option).afterClosed().subscribe(addedVar => {
			let patchOption;
			switch (type) {
				default:
					break;
				case CommandOptions.Dimension:
					patchOption = { [CommandOptions.Dimension]: addedVar };
					break;
				case CommandOptions.DataNum:
					patchOption = { [CommandOptions.DataNum]: addedVar };
					break;
				case CommandOptions.AsData:
					patchOption = { [CommandOptions.AsData]: addedVar };
					break;
				case CommandOptions.Status:
					patchOption = { [CommandOptions.Status]: addedVar };
					break;
				case CommandOptions.Error:
					patchOption = { [CommandOptions.Error]: addedVar };
					break;
				case CommandOptions.Variable:
					patchOption = { [CommandOptions.Variable]: addedVar };
					break;
			};
			this.store.dispatch(getVisionCommand());
			this.form.patchValue(patchOption);
			this.updateStore(this.form.value);
		});
	}

	private getCommand(type: CommandType, option: GetCommandOption): string {
		let command: string;
		switch (type) {
			case CommandType.GetJobData:
				command = `${CommandType.GetJobData}("${option[CommandOptions.Station]}", "` + 
									`${option[CommandOptions.Job]}", ${option[CommandOptions.Dimension]}, ` +
									`${option[CommandOptions.DataNum]}, ${option[CommandOptions.AsData]})`;
				break;
			case CommandType.GetJobError:
				command = `${CommandType.GetJobError}("${option[CommandOptions.Station]}", "` + 
									`${option[CommandOptions.Job]}", ${option[CommandOptions.Error]})`;
				break;
			case CommandType.GetJobStatus:
				command = `${CommandType.GetJobStatus}("${option[CommandOptions.Station]}", "` + 
									`${option[CommandOptions.Job]}", ${option[CommandOptions.Status]}, ` +
									`${option[CommandOptions.Timeout]})`;
				break;
			case CommandType.RunJob:
				command = `${CommandType.RunJob}("${option[CommandOptions.Station]}", "` +
									`${option[CommandOptions.Job]}", ${option[CommandOptions.Timeout]})`;
				break;
			case CommandType.RunJobFull:
				command = `${CommandType.RunJobFull}("${option[CommandOptions.Station]}", "` +
									`${option[CommandOptions.Job]}", ${option[CommandOptions.Timeout]}, ` +
									`${option[CommandOptions.Dimension]}, ${option[CommandOptions.DataNum]}, ` +
									`${option[CommandOptions.AsData]}, ${option[CommandOptions.Error]})`;
				break;
			case CommandType.StopJob:
				command = `${CommandType.StopJob}("${option[CommandOptions.Station]}", "` +
									`${option[CommandOptions.Job]}")`;
				break;
			default: command = '';
		}
		command = 
			!option[CommandOptions.Variable] ?
				(type === CommandType.StopJob) ? command : `?${command}` :
				`${option[CommandOptions.Variable]} = ${command}`;
		return command;
	}

	private addFormControls({
			hasAsData,
			hasDataNum,
			hasDimension,
			hasError,
			hasStatus,
			hasTimeout
		}: CommandOptionAuth
	): void {
		const addControl = 
			(key: CommandOptions, control: FormControl = new FormControl(null, Validators.required)) =>
					this.form.addControl(key, control);
		const addDimensionControl = () => addControl(CommandOptions.Dimension);
		const addDataNumControl = () => addControl(CommandOptions.DataNum);
		const addAsDataControl = () => addControl(CommandOptions.AsData);
		const addStatusControl = () => addControl(CommandOptions.Status);
		const addErrorControl = () => addControl(CommandOptions.Error);
		const fc = new FormControl(null, Validators.pattern(/^\+?[0-9]\d*$/));
		const addTimeoutControl = () => addControl(CommandOptions.Timeout, fc);
		when(identity, addDimensionControl)(hasDimension);
		when(identity, addDataNumControl)(hasDataNum);
		when(identity, addAsDataControl)(hasAsData);
		when(identity, addStatusControl)(hasStatus);
		when(identity, addErrorControl)(hasError);
		when(identity, addTimeoutControl)(hasTimeout);
	}
}
