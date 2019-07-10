import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { ActivationComponent } from './activation.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivationService } from './activation.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Either } from 'ramda-fantasy';

declare const Kuka: {
  kukaInfo: (
    encryptText: string
  ) => { machinedId: string; verificationCode: string };
};

const { Right } = Either;

const getKukaParameter = url => {
  const reg = new RegExp('(^|&)kuka=([^&]*)(&|$)', 'i');
  const res = url.match(reg);
  let context = '';
  if (res !== null) {
    context = res[2];
  }
  return context === null || context === '' || context === 'undefined'
    ? ''
    : context;
};

describe('ProgramSettingsComponent', () => {
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
      imports: [
        SharedModule,
        UnitTestModule,
        QRCodeModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatSnackBar, useValue: fakeMatSnackBar },
        { provide: MatDialogRef, useValue: fakeMatDialog },
        { provide: ActivationService, useValue: fakeService },
      ],
      declarations: [ActivationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      expect(kukaPara).not.toBe('');
      getMachineIdSpy.calls.reset();
    });
  }));

  it('should verify passed when enter pincode which decrypt from route parameter', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getMachineIdSpy.calls.any()).toBe(true);
      const kukaPara = getKukaParameter(component.url);
      expect(kukaPara).not.toBe('');
      const info = Kuka.kukaInfo(kukaPara); // Decrypt kuka route parameter to get verification code.
      component.pinCode = info.verificationCode;
      component.verify();
      expect(closeSpy.calls.any()).toBe(true);
      getMachineIdSpy.calls.reset();
    });
  }));

  it('should verify failed when enter a wrong pincode', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getMachineIdSpy.calls.any()).toBe(true);
      const kukaPara = getKukaParameter(component.url);
      expect(kukaPara).not.toBe('');
      const info = Kuka.kukaInfo(kukaPara); // Decrypt kuka route parameter to get verification code.
      component.pinCode = info.verificationCode += 'a';
      component.verify();
      expect(openSpy.calls.any()).toBe(true);
      getMachineIdSpy.calls.reset();
    });
  }));
});
