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
    @Input() type: 'int' | 'float';
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
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() focusEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() blurEvent: EventEmitter<string> = new EventEmitter<string>();
    @Output() pressEnterEvent: EventEmitter<string> = new EventEmitter<string>();
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
