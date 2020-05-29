import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VisionCommandComponent } from './vision-command.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { UnitTestModule } from '../../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { CommandType, CommandOptions } from '../../enums/vision-command.enum';
import { VisionCommand } from '../../models/vision-command.model';
import { visionCommandFeatureKey, reducer as visionCommandReducer } from '../../reducers/vision-command.reducer';
import { getVisionCommand } from '../../actions/vision-command.actions';


describe('VisionCommandComponent', () => {
    let component: VisionCommandComponent;
    let fixture: ComponentFixture<VisionCommandComponent>;
    let store: MockStore<VisionCommand>;
    let form = <FormGroup>{
        value: {
            [CommandOptions.Station]: 'STATIONA',
            [CommandOptions.Job]: 'JOBA',
            [CommandOptions.Dimension]: 'DIMENSIONA',
            [CommandOptions.DataNum]: 'DATANUMA',
            [CommandOptions.AsData]: 'ASDATAA',
            [CommandOptions.Status]: 'STATUSA',
            [CommandOptions.Error]: 'ERRORA',
            [CommandOptions.Variable]: null,
            [CommandOptions.Timeout]: null
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
                            cb(true);
                        },
                    };
                },
            };
        },
    };

    // beforeEach(async(() => {
    //     TestBed.configureTestingModule({
    //         declarations: [VisionCommandComponent],
    //         imports: [
    //             SharedModule, BrowserAnimationsModule, UnitTestModule,
    //             StoreModule.forFeature(visionCommandFeatureKey, visionCommandReducer),
    //         ],
    //         providers: [
    //             { provide: MAT_DIALOG_DATA, useValue: { type: CommandType.RunJobFull } },
    //             { provide: MatDialogRef, useValue: fakeDalog },
    //             { provide: MatDialog, useValue: dummyDialog },
    //             FormBuilder
    //         ],
    //     }).compileComponents();
    // }));

    // beforeEach(() => {
    //     store = TestBed.get(Store);
    //     spyOn(store, 'dispatch').and.callThrough();
    //     fixture = TestBed.createComponent(VisionCommandComponent);
    //     component = fixture.componentInstance;
    //     fixture.detectChanges();
    // });

    // it('should create', () => {
    //     expect(component).toBeTruthy();
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // });

    // it('should update store when select item.', () => {
    //     const vc = <VisionCommand>{ id: 0, [CommandOptions.Station]: 'StatsionA' };
    //     component.selectItem(vc);
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // })

    // it('should update store when select none item.', () => {
    //     const vc = <VisionCommand>{ id: null, [CommandOptions.Station]: 'StatsionA' };
    //     component.selectItem(vc);
    //     component.updateStore(vc);
    //     expect(store.dispatch).toHaveBeenCalledTimes(1);
    // })

    // it('should submitform with without timeout', () => {
    //     let cmd = '?VRunJobFull("STATIONA", "JOBA", -1, DIMENSIONA, DATANUMA, ASDATAA, ERRORA)';
    //     component.submitForm(form);
    //     expect(closeSpy).toHaveBeenCalledWith(cmd);
    //     closeSpy.calls.reset();
    // })

    // it('should submitform with GetJobData command', () => {
    //     component.commandType = CommandType.GetJobData;
    //     let cmd = '?VGetJobData("STATIONA", "JOBA", DIMENSIONA, DATANUMA, ASDATAA)';
    //     component.submitForm(form);
    //     expect(closeSpy).toHaveBeenCalledWith(cmd);
    //     closeSpy.calls.reset();
    // })
    
    // it('should submitform with GetJobError command', () => {
    //     component.commandType = CommandType.GetJobError;
    //     let cmd = '?VGetJobError("STATIONA", "JOBA", ERRORA)';
    //     component.submitForm(form);
    //     expect(closeSpy).toHaveBeenCalledWith(cmd);
    //     closeSpy.calls.reset();
    // })

    // it('should submitform with GetJobStatus command', () => {
    //     component.commandType = CommandType.GetJobStatus;
    //     let cmd = '?VGetJobStatus("STATIONA", "JOBA", STATUSA, -1)';
    //     component.submitForm(form);
    //     expect(closeSpy).toHaveBeenCalledWith(cmd);
    //     closeSpy.calls.reset();
    // })
    
    // it('should submitform with RunJob command', () => {
    //     component.commandType = CommandType.RunJob;
    //     let cmd = '?VRunJob("STATIONA", "JOBA", -1)';
    //     component.submitForm(form);
    //     expect(closeSpy).toHaveBeenCalledWith(cmd);
    //     closeSpy.calls.reset();
    // })

    // it('should submitform with StopJob command', () => {
    //     component.commandType = CommandType.StopJob;
    //     let cmd = 'VStopJob("STATIONA", "JOBA")';
    //     component.submitForm(form);
    //     expect(closeSpy).toHaveBeenCalledWith(cmd);
    //     closeSpy.calls.reset();
    // })

    // it('should submitform with RunJob command', () => {
    //     component.commandType = CommandType.RunJob;
    //     form.value[CommandOptions.Timeout] = 122;
    //     form.value[CommandOptions.Variable] = 'VARIABLEA';
    //     const cmd = 'VARIABLEA = VRunJob("STATIONA", "JOBA", 122)';
    //     component.submitForm(form);
    //     expect(closeSpy).toHaveBeenCalledWith(cmd);
    //     form.value[CommandOptions.Timeout] = null;
    //     form.value[CommandOptions.Variable] = null;
    //     closeSpy.calls.reset();
    // })

    // it('should crate var for Dimension', () => {
    //     component.createVar(CommandOptions.Dimension);
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // })

    // it('should crate var for DataNum', () => {
    //     component.createVar(CommandOptions.DataNum);
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // })

    // it('should crate var for AsData', () => {
    //     component.createVar(CommandOptions.AsData);
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // })

    // it('should crate var for Status', () => {
    //     component.createVar(CommandOptions.Status);
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // })

    // it('should crate var for Error', () => {
    //     component.createVar(CommandOptions.Error);
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // })

    // it('should crate var for Variable', () => {
    //     component.createVar(CommandOptions.Variable);
    //     expect(store.dispatch).toHaveBeenCalledWith(getVisionCommand());
    // })
});
