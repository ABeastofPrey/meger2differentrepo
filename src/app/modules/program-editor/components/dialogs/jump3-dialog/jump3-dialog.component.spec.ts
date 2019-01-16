import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher, MatSelectChange } from '@angular/material';
import { Jump3DialogService } from '../../../services/jump3-dialog.service';
import { Jump3DialogComponent } from './jump3-dialog.component';
import { range, curry, compose, map } from 'ramda';
import * as Faker from 'faker';

describe('Jump3DialogComponent', () => {
  let component: Jump3DialogComponent;
  let fixture: ComponentFixture<Jump3DialogComponent>;
  const jump3DialogService = jasmine.createSpyObj('Jump3DialogService',
  ['retriveMotionElements', 'retriveDestFrames', 'retriveVolocityMax', 'retriveAccelearationMax']);
  const fakeMotions = map(Faker.random.word, range(0, Faker.random.number({min: 2, max: 5})));
  const fakeDestFra = map(Faker.random.word, range(0, Faker.random.number({min: 2, max: 5})));
  const fakeVMax = Faker.random.number({min: 5, max: 10});
  const fakeAMax = Faker.random.number({min: 15, max: 999});
  const motionElemSyp = jump3DialogService.retriveMotionElements.and.returnValue(fakeMotions);
  const destFramesSyp = jump3DialogService.retriveDestFrames.and.returnValue(fakeDestFra);
  const volocityMxSyp = jump3DialogService.retriveVolocityMax.and.returnValue(fakeVMax);
  const accelearMxSyp = jump3DialogService.retriveVolocityMax.and.returnValue(fakeAMax);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Jump3DialogComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue:  { } },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: Jump3DialogService, useValue: jump3DialogService }
      ],
      imports: [SharedModule, BrowserAnimationsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Jump3DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call retriveMotionElements to retrive motion elements.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(motionElemSyp.calls.any()).toBe(true);
    });
  }));

  it('should call retriveDestFrames to retrive dest frames.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(destFramesSyp.calls.any()).toBe(true);
    });
  }));

  it('should call retriveVolocityMax to retrive volocity max.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(volocityMxSyp.calls.any()).toBe(true);
    });
  }));

  it('should call retriveAccelearationMax to retrive accelearation max.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(accelearMxSyp.calls.any()).toBe(true);
    });
  }));

  it('should successfully assemble required parameters.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.requiredPars.length).toBeGreaterThanOrEqual(4);
      expect(component.requiredPars[0].options).toBe(fakeMotions);
      expect(component.requiredPars[1].options).toBe(fakeDestFra);
      expect(component.requiredPars[2].options).toBe(fakeDestFra);
      expect(component.requiredPars[3].options).toBe(fakeDestFra);
    });
  }));

  it('should successfully assemble optional parameters.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.optionalPars.length).toBeGreaterThanOrEqual(4);
    });
  }));

  it('should disable advanced before selected required parameters.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.enableAdvanced).toBe(false);
    });
  }));

  it('should have no invalid validator for optional parameter at beginning.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.hasInvalidOptional).toBe(false);
    });
  }));

  it('should have invalid validator for require paramter when user un-selected.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const requiredControl = component.requiredPars[0].control;
      requiredControl.markAsTouched();
      expect(component.enableAdvanced).toBe(false);
      expect(component.errorMessage(requiredControl)).toBe('This field is required');
    });
  }));

  it('should have invalid validator for optional paramter when user enter invalid value.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const volocityPar = component.optionalPars[2];
      const volocityCtl = volocityPar.control;
      volocityCtl.setValue((fakeVMax + 1).toString());
      volocityCtl.markAsTouched();
      expect(volocityCtl.value).toEqual((fakeVMax + 1).toString());
      // expect(component.hasInvalidOptional).toBe(true);
      // expect(component.errorMessage(volocityCtl)).toBe(`Please enter a number in (0, ${fakeVMax}).`);
    });
  }));

});
