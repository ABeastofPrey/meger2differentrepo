import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UtilsService } from '../../modules/core';
import { CommonService } from '../../modules/core/services/common.service';
import { TerminalService } from '../../modules/home-screen/services/terminal.service';
import { SharedModule } from '../../modules/shared/shared.module';
import { UnitTestModule } from '../../modules/shared/unit-test.module';

import { CustomKeyBoardComponent } from './custom-key-board.component';
import { CustomKeyBoardService } from './custom-key-board.service';
const fakeCommonService = jasmine.createSpyObj('CommonService', ['isTablet']);
const fakeMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
const fakeUtilsService = jasmine.createSpyObj('UtilsService', ['limitValidator','minLengthValidator','maxLengthValidator',
'firstLetterValidator','nameRulesValidator','isNumberValidator','existNameListValidator','reserved','fullName',
'letterAndNumber','confirmPassword','precision','parseFloatAchieve']);
const fnValidator = () => {
    return ({ value }: AbstractControl): null => {
        return null;
    }
}
const fakeTerminalService = jasmine.createSpyObj('TerminalService',['up','down']);

fakeTerminalService.up.and.returnValue(
  {
    index: 1,
    cmd: '',
  }
);

fakeTerminalService.down.and.returnValue(
  {
    index: 2,
    cmd: '',
  }
);


fakeUtilsService.minLengthValidator = fnValidator;
fakeUtilsService.maxLengthValidator = fnValidator;
fakeUtilsService.firstLetterValidator = fnValidator;
fakeUtilsService.nameRulesValidator = fnValidator;
fakeUtilsService.existNameListValidator = fnValidator;
fakeUtilsService.reserved = fnValidator;
fakeUtilsService.fullName = fnValidator;
fakeUtilsService.letterAndNumber = fnValidator;
fakeUtilsService.confirmPassword = fnValidator;
fakeUtilsService.precision = fnValidator;

const fakeCustomKeyBoardService = jasmine.createSpyObj('CustomKeyBoardService', ['getCharWidth', 'selectionStart']);
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
                { provide: CustomKeyBoardService, useValue: fakeCustomKeyBoardService },
                { provide: TerminalService, useValue: fakeTerminalService }
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CustomKeyBoardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });


    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // beforeEach(() => {
    //     fixture = TestBed.createComponent(CustomKeyBoardComponent);
    //     component = fixture.componentInstance;
    //     fakeUtilsService.limitValidator.and.returnValue(({ value }: AbstractControl): { [key: string]: any } | null => {
    //         return { limit: { min: 0, max: 100, value: 0 } };
    //     })
    //     component.type = "string";
    //     component.min = 0;
    //     component.max = 100;
    //     component.value = 0;
    //     component.required = true;
    //     component.minLength = 3;
    //     component.maxLength = 32;
    //     component.firstLetter = true;
    //     component.nameRules = true;
    //     component.existNameList = ['a'];
    //     component.reserved = true;
    //     component.fullName = true;
    //     component.letterAndNumber = true;
    //     component.confirmPassword = "ADMIN";
    //     component.password  = true;
    //     component.isPad = false;
    //     component.type = "float";
    //     setTimeout(() => {
    //         component.value = "1";
    //     }, 0);
    //     fixture.detectChanges();
    // });

    // beforeEach(() => {
    //     let input = document.createElement("input");
    //     input.value = "123";
    //     component.inputElement = input;
    //     fakeCustomKeyBoardService.getCharWidth.and.returnValue(10000);
    //     component.password  = true;
    //     component.isPad = true;
    //     fixture.detectChanges();
    // })

    // beforeEach(() => {
    //     fixture = TestBed.createComponent(CustomKeyBoardComponent);
    //     component = fixture.componentInstance;
    //     component.value = 10;
    //     component.min = 10;
    //     component.max = 100;
    //     component.type = "int";
    //     component.keyBoardDialog = true;
    //     fixture.detectChanges();
    // });

    // beforeEach(() => {
    //     fixture = TestBed.createComponent(CustomKeyBoardComponent);
    //     component = fixture.componentInstance;
    //     component.type = "string";
    //     component.value = "abc";
    //     component.markAsTouchedFirst = false;
    //     fixture.detectChanges();
    // });


    // it('openDialog', () => {
    //     component.type = 'int';
    //     fakeMatDialog.open.and.returnValue({ "afterClosed": () => { return of(null) } })
    //     component.openDialog();
    //     component.toNumber = true;
    //     fakeMatDialog.open.and.returnValue({ "afterClosed": () => { return of(10) } })
    //     component.openDialog();
    //     component.readonly = true;
    //     let a = undefined;
    //     component.openDialog();
    //     component.toNumber = true;
    //     fakeMatDialog.open.and.returnValue({ "afterClosed": () => { return of(a) } })
    //     component.openDialog();
    // });

    // it('setValue', () => {
    //     component.type = 'int';
    //     component.control.patchValue('.');
    //     fakeCustomKeyBoardService.selectionStart.and.returnValue(0);
    //     component.setValue(InputType.Left);
    //     component.control.patchValue('-.');
    //     component.setValue(InputType.Right);
    //     component.control.patchValue('1-');
    //     component.setValue(InputType.Delete);
    //     fakeCustomKeyBoardService.selectionStart.and.returnValue(10);
    //     component.setValue(InputType.Delete);
    //     component.setValue("1");
    //     fakeCustomKeyBoardService.selectionStart.and.returnValue(10);
    //     component.setValue(InputType.Left);
    //     component.type = "string";
    //     component.setValue("abc");
    // });

    // it("cursorToLeft", () => {
    //     component.textIndent = -20000;
    //     component.cursorToLeft(5);
    // })

    // it("cursorToRight", () => {
    //     component.control.patchValue("123");
    //     component.cursorToRight(5);
    //     component.textIndent = -10000;
    //     fakeCustomKeyBoardService.getCharWidth.and.returnValue(100);
    //     component.cursorToRight(2);
    //     component.textIndent = 0;
    //     fakeCustomKeyBoardService.getCharWidth.and.returnValue(-100);
    //     component.cursorToRight(3);
    // })

    // it("deleteChar", () => {
    //     component.textIndent = -100000;
    //     component.deleteChar(2);
    // })

    // it("setInputValue", () => {
    //     component.setInputValue("1",2);

    // })

    // it("getValue", () => {
    //     component.getValue();
    // })

    // it('getValid', () => {
    //     component.getValid();
    // })

    // it("ngOnChanges", () => {
    //     component.ngOnChanges({value:{currentValue:123,firstChange:true,previousValue:"234"}} as any);
    //     component.ngOnChanges({value:{currentValue:undefined,firstChange:true,previousValue:"234"}} as any);
    //     component.ngOnChanges({disabled :{currentValue:true,firstChange:true,previousValue:false}} as any);
    //     component.ngOnChanges({disabled :{currentValue:false,firstChange:true,previousValue:true}} as any);
    //     component.ngOnChanges({existNameList  :{currentValue:["a","b"],firstChange:true,previousValue:false}} as any);
    //     component.ngOnChanges({existNameList  :{currentValue:["c","d"],firstChange:true,previousValue:true}} as any);
    // })

    // it('onFocus', () => {
    //     component.keyBoardDialog = true;
    //     component.onFocus();
    //     component.keyBoardDialog = false;
    //     component.toNumber = true;
    //     component.value = "123";
    //     component.control = new FormControl("123");
    //     component.onFocus();
    // })

    // it('onFocus2', () => {
    //     component.toNumber = false;
    //     component.value = "123";
    //     component.control = new FormControl("123");
    //     component.onFocus();
    // })

    // it('resetStatus', () => {
    //     component.resetStatus();
    // })

    // it('onSwipe', () => {
    //     component.onSwipe(null);
    // })

    // it("blurEventHandler", () => {
    //     component.isPad  = true;
    //     component.type = "float";
    //     component.control.patchValue("0");
    //     component.blurEventHandler(false);
    //     component.blurEventHandler(true);
    //     component.control.patchValue("0");
    //     component.blurEventHandler(true);
    //     component.control.patchValue('12.');
    //     component.blurEventHandler(true);
    //     component.type = "int";
    //     component.control.patchValue("0");
    //     component.blurEventHandler(true);
    // })

    // it("keyupEventHandler", () => {
    //     component.keyupEventHandler({keyCode :11});
    //     component.keyupEventHandler({keyCode :13});
    //     component.toNumber = true;
    //     component.value = "123";
    //     component.control = new FormControl("123");
    //     component.keyupEventHandler({keyCode :13});
    // })

    // it("inputEventHandler", () => {
    //     component.type = "int";
    //     component.inputEventHandler({ target: { value: "1" } });
    //     component.type = "string";
    //     component.toNumber = true;
    //     component.value = "123";
    //     component.control = new FormControl("123");
    //     component.inputEventHandler({ target: { value: "1" } });
    // })

    // it("setDefaultValue", () => {
    //     localStorage.setItem(CommandLocalType.CommandList,JSON.stringify(["a","b"]));
    //     component.setDefaultValue(InputType.Top);
    //     component.setDefaultValue(InputType.Bottom);
    //     localStorage.setItem(CommandLocalType.CommandList,JSON.stringify([]));
    //     component.setDefaultValue(InputType.Top);
    // })

    // it("setControlValue", () => {
    //     component.setControlValue("a");
    // })

});
