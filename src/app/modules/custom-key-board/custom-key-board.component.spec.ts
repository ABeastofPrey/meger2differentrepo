import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { InputType } from '../core/models/customKeyBoard/custom-key-board.model';
import { CommonService } from '../core/services/common.service';
import { CustomKeyBoardService } from '../core/services/custom-key-board.service';
import { UtilsService } from '../core/services/utils.service';
import { SharedModule } from '../shared/shared.module';
import { UnitTestModule } from '../shared/unit-test.module';

import { CustomKeyBoardComponent } from './custom-key-board.component';

const fakeCommonService = jasmine.createSpyObj('CommonService', ['isTablet']);
const fakeMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
const fakeUtilsService = jasmine.createSpyObj('UtilsService', ['limitValidator']);
const fakeCustomKeyBoardService = jasmine.createSpyObj('CustomKeyBoardService', ['getCharWidth', 'selectionStart', '']);
describe('CustomKeyBoardComponent', () => {
    let component: CustomKeyBoardComponent;
    let fixture: ComponentFixture<CustomKeyBoardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
            providers: [
                { provide: CommonService, useValue: fakeCommonService },
                { provide: MatDialog, useValue: fakeMatDialog },
                { provide: UtilsService, useValue: fakeUtilsService },
                { provide: CustomKeyBoardService, useValue: fakeCustomKeyBoardService }
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomKeyBoardComponent);
        component = fixture.componentInstance;
        fakeUtilsService.limitValidator.and.returnValue(({ value }: AbstractControl): { [key: string]: any } | null => {
            return { limit: { min: 0, max: 100, value: 0 } };
        })
        component.min = 0;
        component.max = 100;
        component.value = 0;
        component.required = true;
        setTimeout(() => {
            component.value = "1";
        }, 0);
        fixture.detectChanges();
    });

    beforeEach(() => {
        let input = document.createElement("input");
        input.value = "123";
        component.inputElement = input;
        fakeCustomKeyBoardService.getCharWidth.and.returnValue(10000);
        fixture.detectChanges();
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomKeyBoardComponent);
        component = fixture.componentInstance;
        component.value = 10;
        component.keyBoardDialog = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openDialog', () => {
        component.type = 'int';
        fakeMatDialog.open.and.returnValue({ "afterClosed": () => { return of(null) } })
        component.openDialog();
        fakeMatDialog.open.and.returnValue({ "afterClosed": () => { return of(10) } })
        component.openDialog();
        component.readonly = true;
        component.openDialog();
    });

    it('setValue', () => {
        component.type = 'int';
        component.control.patchValue('.');
        fakeCustomKeyBoardService.selectionStart.and.returnValue(0);
        component.setValue(InputType.Left);
        component.control.patchValue('-.');
        component.setValue(InputType.Right);
        component.control.patchValue('1-');
        component.setValue(InputType.Delete);
        fakeCustomKeyBoardService.selectionStart.and.returnValue(10);
        component.setValue(InputType.Delete);
        component.setValue("1");
        fakeCustomKeyBoardService.selectionStart.and.returnValue(10);
        component.setValue(InputType.Left);
    });

    it("cursorToLeft", () => {
        component.textIndent = -20000;
        component.cursorToLeft(5);
    })

    it("cursorToRight", () => {
        component.control.patchValue("123");
        component.cursorToRight(5);
        component.textIndent = -10000;
        fakeCustomKeyBoardService.getCharWidth.and.returnValue(100);
        component.cursorToRight(2);
        component.textIndent = 0;
        fakeCustomKeyBoardService.getCharWidth.and.returnValue(-100);
        component.cursorToRight(3);
    })

    it("deleteChar", () => {
        component.textIndent = -100000;
        component.deleteChar(2);
    })

    it("setInputValue", () => {
        component.setInputValue("1",2);
       
    })

    it("getValue", () => {
        component.getValue();
    })

    it('getValid', () => {
        component.getValid();
    })

    it("ngOnChanges", () => {
        component.ngOnChanges({value:{currentValue:123,firstChange:true,previousValue:"234"}} as any);
        component.ngOnChanges({value:{currentValue:undefined,firstChange:true,previousValue:"234"}} as any);
        component.ngOnChanges({disabled :{currentValue:true,firstChange:true,previousValue:false}} as any);
        component.ngOnChanges({disabled :{currentValue:false,firstChange:true,previousValue:true}} as any);
    })

    it('onFocus', () => {
        component.onFocus();
        component.keyBoardDialog = false;
        component.onFocus();
    })

    it('resetStatus', () => {
        component.resetStatus();
    })

    it('onSwipe', () => {
        component.onSwipe(null);
    })

    it("blurEventHandler", () => {
        component.isPad  = true;
        component.type = "float";
        component.blurEventHandler(false);
        component.blurEventHandler(true);
        component.control.patchValue(0);
        component.blurEventHandler(true);
        component.control.patchValue('12.');
        component.blurEventHandler(true);
        component.type = "int";
        component.control.patchValue(0);
        component.blurEventHandler(true);
    })

    it("keyupEventHandler", () => {
        component.keyupEventHandler({keyCode :11});
        component.keyupEventHandler({keyCode :13});
    })

    it("inputEventHandler", () => {
        component.type = "int";
        component.inputEventHandler({ target: { value: "1" } });
    })

});
