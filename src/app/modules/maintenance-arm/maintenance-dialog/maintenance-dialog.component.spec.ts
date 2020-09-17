import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { MaintenanceDialogComponent } from './maintenance-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParamsType, RARM_ROBOT_STATUS, MaintenanceStepId } from '../maintenance-arm.model';
import { LoginService } from '../../core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MaintenanceArmService } from '../maintenance-arm.service';
import { UnitTestModule } from '../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';



describe('MaintenanceDialogComponent', () => {

  const mockMaintenanceArmService = jasmine.createSpyObj('MaintenanceArmService', [
    'restoration',
  ]);
  const restoration = mockMaintenanceArmService.restoration.and.returnValue(
    Promise.resolve(true)
  );

  const mockLoginService = jasmine.createSpyObj('LoginService', ['logout', 'isAdmin']);
  mockLoginService.logout.and.returnValue(true);
  mockLoginService.isAdmin.and.returnValue(true);

  const dialogData = jasmine.createSpyObj('MAT_DIALOG_DATA', ['robotType', 'paramsType']);
  dialogData.robotType.and.returnValue(RARM_ROBOT_STATUS.ERROR);
  dialogData.paramsType.and.returnValue(ParamsType.Arm);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UnitTestModule,
        SharedModule,
        BrowserAnimationsModule,
      ],
      declarations: [MaintenanceDialogComponent],
      providers: [
        { provide: MaintenanceArmService, useValue: mockMaintenanceArmService },
        { provide: LoginService, useValue: mockLoginService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: (dialogResult: any) => { },
          },
        }
      ],
    }).compileComponents();
  }));

  let component: MaintenanceDialogComponent;
  let fixture: ComponentFixture<MaintenanceDialogComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Robot arm is not match with controller, robotType !== RARM_ROBOT_STATUS.Match ', () => {
    it('default error', () => {//
      dialogData.robotType = RARM_ROBOT_STATUS.ERROR;
      //default component.data.robotType = RARM_ROBOT_STATUS. type_not_match
    });

    it('robotType === RARM_ROBOT_STATUS.SN_NOT_MATCH', () => {
      dialogData.robotType = RARM_ROBOT_STATUS.SN_NOT_MATCH;
    });

    it('robotType === RARM_ROBOT_STATUS.SN_PN_NOT_MATCH', () => {
      dialogData.robotType = RARM_ROBOT_STATUS.SN_PN_NOT_MATCH;
    });

    it('unexception', () => {
      dialogData.robotType = RARM_ROBOT_STATUS.Match;
    });

    it('not admin', () => {
      mockLoginService.isAdmin = false;
    });

    afterEach(() => {
      component.paramsType = component.data.paramsType;
      component.ngOnInit();
      expect(component.stepInfo.id).not.toBeNull();
    });

  });


  describe('excute restore opration', () => {
    let stepId: MaintenanceStepId;
    beforeEach(() => {
      component.data.robotType = RARM_ROBOT_STATUS.Match;
      component.stepInfo.disabled = true;
    });
    it('not match ', () => {
      stepId = MaintenanceStepId.ERROR;
    });

    it("don't have permission,need admin privilege to deal with.", () => {
      stepId = MaintenanceStepId.USERSWITCH;
    });

    it('select resore params', () => {
      stepId = MaintenanceStepId.PARAMETERSELECTION;
    });

    it('double confirm', () => {
      stepId = MaintenanceStepId.CHOICECONFIRM;
    });

    it('restore', () => {
      stepId = MaintenanceStepId.RESTORATION;
    });

    afterEach(fakeAsync(() => {
      component.setStepInfo(stepId);
      fixture.detectChanges()
      fixture.whenStable().then(() => {
        const cancelEle: DebugElement = fixture.debugElement;
        const nextBtn = cancelEle.query(By.css('.btnNext'));
        nextBtn.triggerEventHandler('click', component.onNext);
        tick(0);
      });

    }));

  });

  it('back to params choise dialog', () => {
    jasmine.createSpy('onBack', () => {
      component.stepInfo.id = MaintenanceStepId.PARAMETERSELECTION;
    });
    component.onBack();
    expect(component.stepInfo.id).toBe(MaintenanceStepId.PARAMETERSELECTION)
  });


});
