import { HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../material-components/material-components.module';
import { UnitTestModule } from '../shared/unit-test.module';

import { CustomKeyBoardDialogComponent } from './custom-key-board-dialog.component';

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


describe('CustomKeyBoardDialogComponent', () => {
    let component: CustomKeyBoardDialogComponent;
    let fixture: ComponentFixture<CustomKeyBoardDialogComponent>;

    const dialogRef = { close: jasmine.createSpy('close')};

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CustomKeyBoardDialogComponent, CustomKeyBoardComponent],
            // imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            imports: [FormsModule, HttpClientModule, MaterialComponentsModule, BrowserAnimationsModule, UnitTestModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {

                    },
                },
                { provide: MatDialogRef, useValue: dialogRef }
            ]

        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomKeyBoardDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
