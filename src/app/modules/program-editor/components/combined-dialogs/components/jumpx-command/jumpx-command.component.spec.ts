import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { JumpxCommandComponent } from './jumpx-command.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { UnitTestModule } from '../../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { CommandType, CommandOptions, CommandOptionAuth } from '../../enums/jumpx-command.enums';
import { JumpxCommand } from '../../models/jumpx-command.model';
import { jumpxCommandFeatureKey, reducer as jumpxCommandReducer } from '../../reducers/jumpx-command.reducers';
import * as actions from '../../actions/jumpx-command.actions';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { UtilsService } from '../../../../../core/services/utils.service';
import { TPVariable } from '../../../../../core/models/tp/tp-variable.model';
import { TPVariableType } from '../../../../../core/models/tp/tp-variable-type.model';
import { DataService } from '../../../../../core/services';


const fakeUtil = {
    limitValidator: (min: number, max: number, canBeDecimal = true): ValidatorFn => {
        return ({ value }: AbstractControl): { [key: string]: any } | null => {
            if (value !== 0 && !!value === false) {
                return null;
            }
            let forbidden =
                Number(value).toString() === 'NaN' ||
                Number(value) > max ||
                Number(value) < min ||
                (canBeDecimal ? false : (Number(value) % 1 !== 0)); // Check decimal number.
            return forbidden ? { limit: { min, max, value } } : null;
        };
    }
}

const targetA = new TPVariable(TPVariableType.JOINT, 'targetA');
const targetB = new TPVariable(TPVariableType.LOCATION, 'targetB');
const ascendA = new TPVariable(TPVariableType.JOINT, 'ascendA');
const ascendB = new TPVariable(TPVariableType.LOCATION, 'ascendB');
const descenA = new TPVariable(TPVariableType.JOINT, 'descenA');
const descenB = new TPVariable(TPVariableType.LOCATION, 'descenB');

const fakeCommand: JumpxCommand =  {
    id: 0,

    [CommandOptions.TargetPoint]: {} as any,
    [CommandOptions.TargetPointIndex]: 1,
    [CommandOptions.TargetJoPoints]: [targetA],
    [CommandOptions.TargetLoPoints]: [targetB],

    [CommandOptions.AscendingPoint]: {} as any, // required
    [CommandOptions.AscendingPointIndex]: 1, // required
    [CommandOptions.AscendingJoPoints]: [ascendA],
    [CommandOptions.AscendingLoPoints]: [ascendB],

    [CommandOptions.DescendingPoint]: {} as any, // required
    [CommandOptions.DescendingPointIndex]: 1, // required
    [CommandOptions.DescendingJoPoints]: [descenA],
    [CommandOptions.DescendingLoPoints]: [descenB],

    [CommandOptions.MotionElement]: 'MotionElement', // optional
    [CommandOptions.MotionElements]: [],

    [CommandOptions.WithPls]: ['WithPls'], // optional
    [CommandOptions.WithPlsList]: [],

    [CommandOptions.ArchNo]: 1, // optional
    [CommandOptions.ArchNoLimit]: [1, 7],

    [CommandOptions.BlendingPercentage]: 1, // optional
    [CommandOptions.BlendingPercentageLimit]: [],

    [CommandOptions.VScale]: 2, // optional
    [CommandOptions.VcruiseLimit]: [],

    [CommandOptions.Vtran]: 5, // optional
    [CommandOptions.VtranLimit]: [],

    [CommandOptions.Acc]: 4, // optional
    [CommandOptions.AccLimit]: [],

    [CommandOptions.LimZ]: 1, // optional
    [CommandOptions.LimZLimit]: [],
}

const fakeDataModel = {
    [CommandOptions.TargetPoint]: targetA.name,
    [CommandOptions.AscendingPoint]: ascendB.name,
    [CommandOptions.DescendingPoint]: descenA.name,
}

describe('JumpxCommandComponent', () => {
    let component: JumpxCommandComponent;
    let fixture: ComponentFixture<JumpxCommandComponent>;
    let store: MockStore<JumpxCommand>;
    let form = <FormGroup>{
        value: {
            [CommandOptions.TargetPoint]: targetA,
            [CommandOptions.AscendingPoint]: ascendA,
            [CommandOptions.DescendingPoint]: descenA,
            [CommandOptions.MotionElement]: 'MotionElement',
            [CommandOptions.ArchNo]: 2,
            [CommandOptions.BlendingPercentage]: 11,
            [CommandOptions.Vtran]: 22,
            [CommandOptions.VScale]: 33,
            [CommandOptions.Acc]: 44,
            [CommandOptions.WithPls]: ['WithPls'],
        }, valid: true, touched: true
    };

    const fakeDalog = jasmine.createSpyObj('MatDialogRef', ['close']);
    const closeSpy = fakeDalog.close;
    const dummyDialog = {
        open: () => {
            return {
                afterClosed: () => {
                    return {
                        subscribe: cb => {
                            cb('targetA');
                        },
                    };
                },
            };
        },
    };

    const fakeDataService = { joints: [], locations: [] };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JumpxCommandComponent],
            imports: [
                SharedModule, BrowserAnimationsModule, UnitTestModule,
                StoreModule.forFeature(jumpxCommandFeatureKey, jumpxCommandReducer),
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { type: CommandType.Jump3cp, model: fakeDataModel } },
                { provide: MatDialogRef, useValue: fakeDalog },
                { provide: MatDialog, useValue: dummyDialog },
                { provide: UtilsService, useValue: fakeUtil },
                { provide: DataService, useValue: fakeDataService },
                FormBuilder
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        fixture = TestBed.createComponent(JumpxCommandComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add form control', () => {
        expect(store.dispatch).toHaveBeenCalledWith(actions.getJumpxCommand());
        const changeModel = { jumpxCommand: { id: 0, changes: fakeCommand } };
        store.dispatch(actions.getJumpxCommandSuccess(changeModel));
        expect(store.dispatch).toHaveBeenCalledWith(actions.getJumpxCommandSuccess(changeModel));
    });

    it('should update store', () => {
        component.updateStore(CommandOptions.TargetPoint, targetA);
        component.updateStore(CommandOptions.TargetPointIndex, 2);
        component.updateStore(CommandOptions.AscendingPoint, targetA);
        component.updateStore(CommandOptions.AscendingPointIndex, 2);
        component.updateStore(CommandOptions.DescendingPoint, targetA);
        component.updateStore(CommandOptions.DescendingPointIndex, 2);
        component.updateStore(CommandOptions.MotionElement, 'MotionElement');
        component.updateStore(CommandOptions.WithPls, ['Position trigger']);
        component.updateStore(CommandOptions.Acc, 2);
        component.updateStore(CommandOptions.ArchNo, 1);
        component.updateStore(CommandOptions.LimZ, 1);
        component.updateStore(CommandOptions.VScale, 22);
        component.updateStore(CommandOptions.Vtran, 33);
        component.updateStore(CommandOptions.BlendingPercentage, 12);
        const changeModel = { jumpxCommand: { id: 0, changes: {[CommandOptions.MotionElement]: 'MotionElement'} } };
        expect(store.dispatch).toHaveBeenCalledWith(actions.selectMotionElement(changeModel));
    })

    it('should submit form with jump3cp', () => {
        component.submitForm(form);
        const cmd = 'Jump3cp MotionElement AscendingPoint=ascendA DescendingPoint=descenA TargetPoint=targetA ArchNo=2 BlendingPercentage=11 Vtran=22 Acc=44 WithPls=WithPls ';
        expect(closeSpy).toHaveBeenCalledWith(cmd);
        closeSpy.calls.reset();
    })

    it('should submit form with jump3', () => {
        component.commandType = CommandType.Jump3;
        component.commandOptionAuth = new CommandOptionAuth(CommandType.Jump3);
        component.submitForm(form);
        const cmd = 'Jump3 MotionElement AscendingPoint=ascendA DescendingPoint=descenA TargetPoint=targetA ArchNo=2 BlendingPercentage=11 Vtran=22 Acc=44 WithPls=WithPls ';
        expect(closeSpy).toHaveBeenCalledWith(cmd);
        closeSpy.calls.reset();
        component.commandType = CommandType.Jump3cp;
        component.commandOptionAuth = new CommandOptionAuth(CommandType.Jump3cp);
    })

    it('should submit form with jump', () => {
        component.commandType = CommandType.Jump;
        component.commandOptionAuth = new CommandOptionAuth(CommandType.Jump);
        component.isAdvanced = true;
        component.submitForm(form);
        const cmd = 'Jump MotionElement targetA ArchNo=2 BlendingPercentage=11 Vscale=33 Acc=44 WithPls=WithPls ';
        expect(closeSpy).toHaveBeenCalledWith(cmd);
        closeSpy.calls.reset();
        component.commandType = CommandType.Jump3cp;
        component.commandOptionAuth = new CommandOptionAuth(CommandType.Jump3cp);
    })

    it('should createVar with target point', () => {
        component.createVar(CommandOptions.TargetPoint);
        const changeModel = { jumpxCommand: { id: 0, changes: {[CommandOptions.MotionElement]: 'MotionElement'} } };
        store.dispatch(actions.createVarSuccess(changeModel));
        expect(store.dispatch).toHaveBeenCalled();
    });

    it('should createVar with ascending point', () => {
        component.createVar(CommandOptions.AscendingPoint);
        const changeModel = { jumpxCommand: { id: 0, changes: {[CommandOptions.MotionElement]: 'MotionElement'} } };
        store.dispatch(actions.createVarSuccess(changeModel));
        expect(store.dispatch).toHaveBeenCalled();
    });

    it('should createVar with descending point', () => {
        component.createVar(CommandOptions.DescendingPoint);
        const changeModel = { jumpxCommand: { id: 0, changes: {[CommandOptions.MotionElement]: 'MotionElement'} } };
        store.dispatch(actions.createVarSuccess(changeModel));
        expect(store.dispatch).toHaveBeenCalled();
    });

    it('should update form control Jump3cp', () => {
        component.commandType = CommandType.Jump3cp;
        component.commandOptionAuth = new CommandOptionAuth(CommandType.Jump3cp);
        component.model = fakeCommand;
        const changeModel = { jumpxCommand: { id: 0, changes: {[CommandOptions.MotionElement]: 'MotionElement'} } };
        store.dispatch(actions.getJumpxCommandSuccess(changeModel));
        expect(store.dispatch).toHaveBeenCalled();
    });

    it('should update form control Jump3', () => {
        component.commandType = CommandType.Jump3;
        component.commandOptionAuth = new CommandOptionAuth(CommandType.Jump3);
        component.model = fakeCommand;
        const changeModel = { jumpxCommand: { id: 0, changes: {[CommandOptions.MotionElement]: 'MotionElement'} } };
        store.dispatch(actions.getJumpxCommandSuccess(changeModel));
        expect(store.dispatch).toHaveBeenCalled();
    });
    
    it('should update form control Jump', () => {
        component.commandType = CommandType.Jump;
        component.commandOptionAuth = new CommandOptionAuth(CommandType.Jump);
        component.model = fakeCommand;
        const changeModel = { jumpxCommand: { id: 0, changes: {[CommandOptions.MotionElement]: 'MotionElement'} } };
        store.dispatch(actions.getJumpxCommandSuccess(changeModel));
        expect(store.dispatch).toHaveBeenCalled();
    });

    it('should create without dataModel', () => {
        const dataModel = component.data.model;
        component.data.model = null;
        component.ngOnInit();
        store.dispatch(actions.getJumpxCommand());
        expect(store.dispatch).toHaveBeenCalled();
        component.data.model = dataModel;
    });
});
