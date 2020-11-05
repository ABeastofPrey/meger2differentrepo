import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { SharedModule } from '../../../../shared/shared.module';

import { SubProgramComponent } from './sub-program.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { ProgramEditorService } from '../../../services/program-editor.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MaterialComponentsModule } from '../../../../material-components/material-components.module';

@Component({ selector: 'custom-key-board', template: '' })
export class CustomKeyBoardComponent {
    @Input() value: string | number;
    @Input() keyBoardDialog: boolean = false;
    @Input() type: 'int' | 'float' | 'string';
    @Input() min: number;
    @Input() max: number;
    @Input() leftClosedInterval = true;
    @Input() rightClosedInterval = true;
    @Input() required: boolean = false;
    @Input() requiredErrMsg: string;
    @Input() disabled: boolean = false;
    @Input() label: string | number;
    @Input() prefix: string | number;
    @Input() suffix: string | number;
    @Input() hint: string;
    @Input() placeHolder: string | number;
    @Input() appearance: string = "legacy";
    @Input() matLabel: string;
    @Input() isPositiveNum: boolean = false;
    @Input() isNgIf: boolean = true;
    @Input() readonly: boolean = false;
    @Input() toNumber: boolean = false;
    @Input() maxLength: number;
    @Input() minLength: number;
    @Input() firstLetter: boolean = false;
    @Input() nameRules: boolean = false;
    @Input() existNameList: string[];
    @Input() password: boolean = false;
    @Input() isCommand: boolean = false;
    @Input() iconPrefix: boolean = false;
    @Input() iconPrefixColor: string = "#0000000DE";
    @Input() iconSuffix: boolean = false;
    @Input() markAsTouchedFirst: boolean = true;
    @Input() reserved: boolean = false;
    @Input() fullName: boolean = false;
    @Input() letterAndNumber: boolean = false;
    @Input() confirmPassword: string;
    @Output() valueChange: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() focusEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() blurEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() pressEnterEvent: EventEmitter<string | number> = new EventEmitter<string | number>();
    @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
}


const fakeProgramEditorService = jasmine.createSpyObj('ProgramEditorService', ['activeFile']);
fakeProgramEditorService.activeFile = "APP.UPG";

describe('SubProgramComponent', () => {
    let component: SubProgramComponent;
    let fixture: ComponentFixture<SubProgramComponent>;

    const dialogRef = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SubProgramComponent,CustomKeyBoardComponent],
            // imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            imports: [FormsModule, HttpClientModule, MaterialComponentsModule, BrowserAnimationsModule, UnitTestModule],
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
        fixture = TestBed.createComponent(SubProgramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.existParameter = ["s", "b"];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('changeInput', () => {
        component.changeInput({ "target": { "value": "subName" } });
    });

    it('addParameter', () => {
        component.existParameter = ["", "s"];
        // component.addParameter();
        component.existParameter = ["a", "s"];
        // component.addParameter();
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
