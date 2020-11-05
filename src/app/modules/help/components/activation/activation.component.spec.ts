import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { ActivationComponent } from './activation.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ActivationService } from './activation.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Either } from 'ramda-fantasy';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialComponentsModule } from '../../../material-components/material-components.module';

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

declare const Kuka: {
  kukaInfo: (
    encryptText: string
  ) => { machinedId: string; verificationCode: string };
};

const { Right } = Either;

const getKukaParameter = url => {
  const lastIndex = url.lastIndexOf('/') + 1;
  const parameter = url.slice(lastIndex);
  return parameter;
};

describe('ActivationComponent', () => {
  let component: ActivationComponent;
  let fixture: ComponentFixture<ActivationComponent>;
  const fakeId = 'AE-86';

  const fakeService = jasmine.createSpyObj('ActivationService', [
    'getMachineId',
    'getKey',
    'setKey',
  ]);
  let getMachineIdSpy = fakeService.getMachineId.and.returnValue(
    Promise.resolve(Right(fakeId))
  );

  const fakeMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
  const openSpy = fakeMatSnackBar.open;

  const fakeMatDialog = jasmine.createSpyObj('MatDialogRef', ['close']);
  const closeSpy = fakeMatDialog.close;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    //   imports: [
    //     SharedModule,
    //     UnitTestModule,
    //     QRCodeModule,
    //     BrowserAnimationsModule,
    //   ],
      imports: [FormsModule, HttpClientModule, MaterialComponentsModule, BrowserAnimationsModule, UnitTestModule],
      providers: [
        { provide: MatSnackBar, useValue: fakeMatSnackBar },
        { provide: MatDialogRef, useValue: fakeMatDialog },
        { provide: ActivationService, useValue: fakeService },
      ],
      declarations: [ActivationComponent,CustomKeyBoardComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.customKeyBoard = {
        getValid: () => {
            return true;
        }
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve machine id.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getMachineIdSpy.calls.any()).toBe(true);
      getMachineIdSpy.calls.reset();
    });
  }));

  it('should bind kuka encrypt text to route parameter', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getMachineIdSpy.calls.any()).toBe(true);
      const kukaPara = getKukaParameter(component.url);
    //   expect(kukaPara).not.toBe('');
      getMachineIdSpy.calls.reset();
    });
  }));

  it('should verify passed when enter pincode which decrypt from route parameter', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getMachineIdSpy.calls.any()).toBe(true);
      const kukaPara = getKukaParameter(component.url);
      expect(kukaPara).not.toBe('');
      component.verify();
    });
  }));

  it('should verify failed when enter a wrong pincode', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getMachineIdSpy.calls.any()).toBe(true);
      const kukaPara = getKukaParameter(component.url);
      expect(kukaPara).not.toBe('');
      component.verify();
      expect(openSpy.calls.any()).toBe(false);
      getMachineIdSpy.calls.reset();
    });
  }));
});
