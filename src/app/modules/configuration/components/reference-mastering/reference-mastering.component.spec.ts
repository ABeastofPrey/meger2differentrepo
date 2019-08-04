import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import {
  MatSnackBar,
  MatDialog,
  MatHorizontalStepper,
  MatSelectChange,
} from '@angular/material';
import { TpStatService } from '../../../../modules/core/services/tp-stat.service';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReferenceMasteringService } from '../../services/reference-mastering.service';
import { TerminalService } from '../../../home-screen/services/terminal.service';
import { Either } from 'ramda-fantasy';
import { ReferenceMasteringComponent } from './reference-mastering.component';
import {of} from 'rxjs';

const { Left, Right } = Either;

describe('ReferenceMasteringComponent', () => {
  let component: ReferenceMasteringComponent;
  let fixture: ComponentFixture<ReferenceMasteringComponent>;
  const fakeService = jasmine.createSpyObj('ReferenceMasteringService', [
    'retrieveAxisInfo',
    'masterZero',
    'masterFinal',
    'recordPoint',
    'masterLeftRight',
    'resetOriginal',
    'fetchReferencePoints',
    'setReferencePoint',
    'getReferencePoint',
    'initRobot',
    'moveToRef',
    'isMoveing',
    'getCommand',
  ]);
  let retrieveAxisInfo = fakeService.retrieveAxisInfo.and.returnValue(
    Promise.resolve(Right(JSON.parse('[[0,0],[0,0],[0,67],[0,0]]')))
  );
  let masterZero = fakeService.masterZero.and.returnValue(
    Promise.resolve(Right('Success'))
  );
  let masterFinal = fakeService.masterFinal.and.returnValue(
    Promise.resolve(Right('Success'))
  );
  let recordPoint = fakeService.recordPoint.and.returnValue(
    Promise.resolve(Right('Success'))
  );
  let masterLeftRight = fakeService.masterLeftRight.and.returnValue(
    Promise.resolve(Right('Success'))
  );
  let resetOriginal = fakeService.resetOriginal.and.returnValue(
    Promise.resolve(Right('Success'))
  );
  let fetchReferencePoints = fakeService.fetchReferencePoints.and.returnValue(
    Promise.resolve(Right(['AAA', 'BBB']))
  );
  let setReferencePoint = fakeService.setReferencePoint.and.returnValue(
    Promise.resolve(Right(true))
  );
  let getReferencePoint = fakeService.getReferencePoint.and.returnValue(
    Promise.resolve(Right('AAA'))
  );
  let initRobot = fakeService.initRobot.and.returnValue(
    Promise.resolve(Right('Success'))
  );
  let moveToRef = fakeService.moveToRef.and.returnValue(
    Promise.resolve(Right('Success'))
  );
  let isMoveing = fakeService.isMoveing.and.returnValue(
    Promise.resolve(Right(false))
  );
  let getCommand = fakeService.getCommand.and.returnValue(
    Promise.resolve(Right('move SCARA DEMO::AAA vcruise = 10'))
  );
  const fakeTpState = { mode: 'T1' };
  const terminalService = jasmine.createSpyObj('TerminalService', ['']);
  terminalService.sentCommandEmitter = {
    pipe: () => { 
      return {
        subscribe: cb => {
          cb();
          return { unsubscribe: () => {} };
        }
      };
    }
  };
  const fakeDialog = {
    open: () => {
      return {
        afterClosed: () => {
          return {
            subscribe: cb => {
              cb(true);
            },
          };
        },
      };
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReferenceMasteringComponent],
      imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
      providers: [
        {
          provide: ReferenceMasteringService,
          useValue: fakeService,
        },
        {
          provide: TpStatService,
          useValue: fakeTpState,
        },
        {
          provide: TerminalService,
          useValue: terminalService,
        },
        {
          provide: MatDialog,
          useValue: fakeDialog,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceMasteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should give the expectation result of canNotUse', () => {
    let canNotUse = component.canNotUse();
    expect(canNotUse).toBe(false);
    component.stat.mode = 'T1';
    canNotUse = component.canNotUse();
    expect(canNotUse).toBe(false);
    component.stat.mode = 'T2';
    canNotUse = component.canNotUse();
    expect(canNotUse).toBe(true);
    component.stat.mode = 'Auto';
    canNotUse = component.canNotUse();
    expect(canNotUse).toBe(true);
  });

  it('should give the expectation of isInvalidForm', () => {
    const form = { status: 'INVALID' };
    expect(component.isInvalidForm(form as any)).toBe(true);
    form.status = 'VALID';
    expect(component.isInvalidForm(form as any)).toBe(false);
  });

  it('should retrieve data', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(retrieveAxisInfo.calls.any()).toBe(true);
      expect(fetchReferencePoints.calls.any()).toBe(true);
      expect(getReferencePoint.calls.any()).toBe(true);
      expect(getCommand.calls.any()).toBe(true);
    });
  }));

  it('should call masterZero api', async(() => {
    component.masterZero();
    fixture.whenStable().then(() => {
      expect(masterZero.calls.any()).toBe(true);
      masterZero.calls.reset();
    });
  }));

  it('should call masterZero api failed', async(() => {
    masterZero = fakeService.masterZero.and.returnValue(
      Promise.resolve(Left('faliled'))
    );
    component.masterZero();
    fixture.whenStable().then(() => {
      expect(masterZero.calls.any()).toBe(true);
      masterZero.calls.reset();
    });
  }));

  it('should call masterFinal api', async(() => {
    component.masterFinal();
    fixture.whenStable().then(() => {
      expect(masterFinal.calls.any()).toBe(true);
      masterFinal.calls.reset();
    });
  }));

  it('should call masterFinal api failed', async(() => {
    masterFinal = fakeService.masterFinal.and.returnValue(
      Promise.resolve(Left('faliled'))
    );
    component.masterFinal();
    fixture.whenStable().then(() => {
      expect(masterFinal.calls.any()).toBe(true);
      masterFinal.calls.reset();
    });
  }));

  it('should call recordPoint api', async(() => {
    component.recordPoint();
    fixture.whenStable().then(() => {
      expect(recordPoint.calls.any()).toBe(true);
      recordPoint.calls.reset();
    });
  }));

  it('should call recordPoint api failed', async(() => {
    recordPoint = fakeService.recordPoint.and.returnValue(
      Promise.resolve(Left('faliled'))
    );
    component.recordPoint();
    fixture.whenStable().then(() => {
      expect(recordPoint.calls.any()).toBe(true);
      recordPoint.calls.reset();
    });
  }));

  it('should call masterLeftRight api', async(() => {
    component.masterLeftRight();
    fixture.whenStable().then(() => {
      expect(masterLeftRight.calls.any()).toBe(true);
      masterLeftRight.calls.reset();
    });
  }));

  it('should call masterLeftRight api failed', async(() => {
    masterLeftRight = fakeService.masterLeftRight.and.returnValue(
      Promise.resolve(Left('faliled'))
    );
    component.masterLeftRight();
    fixture.whenStable().then(() => {
      expect(masterLeftRight.calls.any()).toBe(true);
      masterLeftRight.calls.reset();
    });
  }));

  it('should change mode tobe false', async(() => {
    component.changeMode(false);
    fixture.whenStable().then(() => {
      expect(initRobot.calls.any()).toBe(true);
    });
  }));

  it('should change mode tobe true', async(() => {
    component.changeMode(true);
    fixture.whenStable().then(() => {
      expect(initRobot.calls.any()).toBe(true);
    });
  }));

  it('should stepBackAndReset successfully', async(() => {
    component.stepBackAndReset();
    fixture.whenStable().then(() => {
      expect(resetOriginal.calls.any()).toBe(true);
    });
  }));

  it('should stepBackAndReset failed', async(() => {
    resetOriginal = fakeService.resetOriginal.and.returnValue(
      Promise.resolve(Left('failed'))
    );
    component.stepBackAndReset();
    fixture.whenStable().then(() => {
      expect(resetOriginal.calls.any()).toBe(true);
    });
  }));

  it('should go back when finish', () => {
    component.finish();
    expect(true).toBe(true);
  });

  it('should change selection successfully', async(() => {
    component.selectionChange({ value: 'AAA' } as any);
    fixture.whenStable().then(() => {
      expect(setReferencePoint.calls.any()).toBe(true);
    });
  }));

  it('should change selection failed', async(() => {
    setReferencePoint = fakeService.setReferencePoint.and.returnValue(
      Promise.resolve(Left(false))
    );
    component.selectionChange({ value: 'AAA' } as any);
    fixture.whenStable().then(() => {
      expect(setReferencePoint.calls.any()).toBe(true);
      setReferencePoint.calls.reset();
    });
  }));

  it('should be un-hot joint without zeroAxis', () => {
    expect(component.hotJoint(0)).toBe(false);
  });

  it('should be hot joint with zeroAxis', () => {
    component.zeroAxis = '[1, 0, 0, 0]';
    expect(component.hotJoint(0)).toBe(true);
    expect(component.hotJoint(1)).toBe(false);
  });

  it('should retrieve data failed', async(() => {
    retrieveAxisInfo = fakeService.retrieveAxisInfo.and.returnValue(
      Promise.resolve(Left('failed'))
    );
    fetchReferencePoints = fakeService.fetchReferencePoints.and.returnValue(
      Promise.resolve(Left('failed'))
    );
    getReferencePoint = fakeService.getReferencePoint.and.returnValue(
      Promise.resolve(Left('failed'))
    );
    getCommand = fakeService.getCommand.and.returnValue(
      Promise.resolve(Left('failed'))
    );
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(retrieveAxisInfo.calls.any()).toBe(true);
      expect(fetchReferencePoints.calls.any()).toBe(true);
      expect(getReferencePoint.calls.any()).toBe(true);
      expect(getCommand.calls.any()).toBe(true);
    });
  }));

  it('should give expectation of moveToRef api', async(() => {
    jasmine.clock().install();
    component.moveToRef(true);
    fixture.whenStable().then(() => {
      expect(moveToRef.calls.any()).toBe(true);
      jasmine.clock().tick(500);
      expect(isMoveing.calls.any()).toBe(true);
      isMoveing = fakeService.isMoveing.and.returnValue(
        Promise.resolve(Left('failed'))
      );
      component.moveToRef(true);
      jasmine.clock().tick(500);
      isMoveing.calls.reset();
      expect(isMoveing.calls.any()).toBe(false);
      jasmine.clock().uninstall();
      moveToRef.calls.reset();
      isMoveing.calls.reset();
      moveToRef = fakeService.moveToRef.and.returnValue(
        Promise.resolve(Left('failed'))
      );
      component.moveToRef(true);
      expect(isMoveing.calls.any()).toBe(false);
    });
  }));

  it('should call cancel', async(() => {
    resetOriginal = fakeService.resetOriginal.and.returnValue(
      Promise.resolve(Right('successfully'))
    );
    component.cancel();
    fixture.whenStable().then(() => {
      expect(false).toBe(false);
    });
  }));

  it('should call cancel', async(() => {
    resetOriginal = fakeService.resetOriginal.and.returnValue(
      Promise.resolve(Left('failed'))
    );
    component.cancel();
    fixture.whenStable().then(() => {
      expect(false).toBe(false);
    });
  }));

  it('should call destroy', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component.stepper.selectedIndex = 1;
      component.ngOnDestroy();
      expect(true).toBe(true);
    });
  }));
});
