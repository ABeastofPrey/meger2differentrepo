import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { SharedModule } from '../../../../shared/shared.module';

import { FunctionProgramComponent } from './function-program.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { ProgramEditorService } from '../../../services/program-editor.service';


const fakeProgramEditorService = jasmine.createSpyObj('ProgramEditorService', ['activeFile']);
fakeProgramEditorService.activeFile = "APP.UPG";

describe('FunctionProgramComponent', () => {
    let component: FunctionProgramComponent;
    let fixture: ComponentFixture<FunctionProgramComponent>;

    const dialogRef = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FunctionProgramComponent],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: ProgramEditorService, useValue: fakeProgramEditorService },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        title: 'Failed!'
                    },
                },
                { provide: MatDialogRef, useValue: dialogRef },
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FunctionProgramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.existParameter = ["s", "b"];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('changeInput', () => {
        component.changeInput({ "target": { "value": "functionName" } });
    });

    it('addParameter', () => {
        component.existParameter = ["", "s"];
        component.addParameter();
        component.existParameter = ["a", "s"];
        component.addParameter();
    });

    it('deleteParameter', () => {
        component.deleteParameter(0);
    });

    it('changeParameter', () => {
        component.dataSource = [
            { "VariableName": new FormControl("abc", [Validators.required]), "VariableType": "double", "operation": "" },
            { "VariableName": new FormControl("s", [Validators.required]), "VariableType": "double", "operation": "" },
        ]
        component.changeParameter({ "target": { "value": "abc" } }, 0);
    });

    it('blurParameter', () => {
        component.dataSource = [
            { "VariableName": new FormControl("abc", [Validators.required]), "VariableType": "double", "operation": "" },
            { "VariableName": new FormControl("s", [Validators.required]), "VariableType": "double", "operation": "" },
            { "VariableName": new FormControl("", [Validators.required]), "VariableType": "double", "operation": "" },
        ]
        component.blurParameter(0);
        component.blurParameter(2);
    });

    it('cancel', () => {
        component.cancel();
    });

    it('insert', () => {
        component.ULB_LIB_End = true;
        component.dataSource = [
            { "VariableName": new FormControl("abc", [Validators.required]), "VariableType": "double", "operation": "" },
            { "VariableName": new FormControl("s", [Validators.required]), "VariableType": "double", "operation": "" },
        ]
        component.insert();
        component.ULB_LIB_End = false;
        component.dataSource = [];
        component.insert();
    });
});
