import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Jump3DialogService } from '../../../services/jump3-dialog.service';
import { Jump3DialogComponent, ParameterErrorStateMatcher } from './jump3-dialog.component';
import { range, map } from 'ramda';
import * as Faker from 'faker';

describe('Jump3DialogComponent', () => {
  let component: Jump3DialogComponent;
  let fixture: ComponentFixture<Jump3DialogComponent>;
  const jump3DialogService = jasmine.createSpyObj('Jump3DialogService',
    ['retriveMotionElements', 'retriveDestFrames', 'retriveVolocityMax', 'retriveAccelearationMax']);
  const fakeMotions = map(Faker.random.word, range(0, Faker.random.number({ min: 2, max: 5 })));
  const fakeDestFra = map(Faker.random.word, range(0, Faker.random.number({ min: 2, max: 5 })));
  const fakeVMax = Faker.random.number({ min: 5, max: 10 });
  const fakeAMax = Faker.random.number({ min: 15, max: 999 });
  const motionElemSyp = jump3DialogService.retriveMotionElements.and.returnValue(fakeMotions);
  const destFramesSyp = jump3DialogService.retriveDestFrames.and.returnValue(fakeDestFra);
  const volocityMxSyp = jump3DialogService.retriveVolocityMax.and.returnValue(fakeVMax);
  const accelearMxSyp = jump3DialogService.retriveVolocityMax.and.returnValue(fakeAMax);

  const fakeDalog = jasmine.createSpyObj('MatDialogRef', ['close']);
  const closeSpy = fakeDalog.close;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Jump3DialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        // { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MatDialogRef, useValue: fakeDalog },
        { provide: Jump3DialogService, useValue: jump3DialogService }
      ],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule]
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
    const control = {
      hasError: key => {
        return (key === 'limit') ? true : false;
      },
      errors: {
        limit: {
          msg: 'good'
        }
      }
    };
    fixture.whenStable().then(() => {
      const hasErr = component.errorMessage(control as any);
      expect(hasErr).toBe('good');
    });
  }));

  it('should give the correct state', async(() => {
    fixture.detectChanges();
    const matcher = ParameterErrorStateMatcher.of();
    const control = { invalid: true, touched: true };
    const form = { submitted: true };
    fixture.whenStable().then(() => {
      const state1 = matcher.isErrorState(control as any, form as any);
      form.submitted = false;
      control.touched = false;
      const state2 = matcher.isErrorState(control as any, form as any);
      expect(state1).toBe(true);
      expect(state2).toBe(false);
    });
  }));

  it('should emit the correct command', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component.optionalPars.forEach(item => {
        item.selected = 'true';
      });
      component.requiredPars.forEach(item => {
        item.selected = 'true';
      });
      component.isAdvanced = true;
      component.emitCmd();
      component.optionalPars.forEach(item => {
        item.selected = '';
      });
      component.requiredPars.forEach(item => {
        item.selected = 'false';
      });
      component.isAdvanced = false;
      component.emitCmd();
      expect(closeSpy.calls.any()).toBe(true);
    });
  }));

  it('should assemble correct validator', async(() => {
    fixture.detectChanges();
    const control = { value: 10 } as any;
    fixture.whenStable().then(() => {
      for (let i = 0; i < 4; i++) {
        component.limitValidator(1, 20, i)(control);
      }
      control.value = 1.2;
      const res = component.limitValidator(1, 20, 0)(control);
      expect(res.limit.msg).toEqual('Please enter an integer in [1, 20].');
    });
  }));
});
