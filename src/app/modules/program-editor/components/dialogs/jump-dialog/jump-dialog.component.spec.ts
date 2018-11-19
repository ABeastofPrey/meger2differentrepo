import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MatInput, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { SharedModule } from '../../../../shared/shared.module';
import { DataService, WebsocketService } from '../../../../core/services';
import { ProgramEditorService } from './../../../services/program-editor.service';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';

import { JumpDialogComponent } from './jump-dialog.component';
import { DataNotArrayPipe } from './jump-dialog.pipe';
import { JumpParameter } from './jump-dialog.enum';


/**
 * It contains all the test specs to JumpDialogComponent.
 */
describe('JumpDialogComponent', () => {

  /**
   * The JumpDialogComponent instance
   */
  let component: JumpDialogComponent;

  /**
   * The fixture for debugging and testing JumpDialogComponent.
   */
  let fixture: ComponentFixture<JumpDialogComponent>;

  /**
   * The debug element for testing.
   */
  let debugElement: DebugElement;

  /**
   * The html element for testing.
   */
  let htmlElement: HTMLElement;

  /**
   * The mock DataService instance.
   */
  let dataService = {
    locations: () => {
      return [{
        value: null, isArr: false, varType: 1, isPosition: true, name: 'P1', typeStr: 'LOCATION', selectedIndex: 1
      }];
    }
  };

  /**
   * The mock ProgramEditorService instance.
   */
  let programEditorService = {
    lastVar: TPVariable
  };

  /**
   * The mock dialog.
   */
  let dialogRef = {
    close: jasmine.createSpy('close')
 };

  /**
   * The WebSocketService spy instance.
   */
  let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;

  /**
   * Do the test initialization before it is running.
   */
  beforeEach(async(() => {
    const spyObj = jasmine.createSpyObj('WebSocketService', ['query']);

    TestBed.configureTestingModule({
      imports: [SharedModule, MatDialogModule, MatInputModule, BrowserAnimationsModule],
      declarations: [ JumpDialogComponent, DataNotArrayPipe],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: WebsocketService, useValue: spyObj },
        { provide: DataService, useValue: dataService },
        { provide: ProgramEditorService, useValue: programEditorService },
    ]
    })
    .compileComponents();

    webSocketServiceSpy = TestBed.get(WebsocketService);

    webSocketServiceSpy.query.and.callFake((cmd: String) => {
      if (cmd === '?TP_GET_ROBOT_LIST') {
        return Promise.resolve({ result: 'SCARA,SCARA1', cmd: '', err: null });
      }

      if (cmd.includes('VELOCITYMAX')) {
        return cmd.includes('SCARA1') ?
         Promise.resolve({ result: '200', cmd: '', err: null }) : Promise.resolve({ result: '100', cmd: '', err: null });
      }
      if (cmd.includes('ACCELERATIONMAX')) {
        return cmd.includes('SCARA1') ?
         Promise.resolve({ result: '200', cmd: '', err: null }) : Promise.resolve({ result: '100', cmd: '', err: null });
      }
      if (cmd.includes('ZMAX')) {
        return cmd.includes('SCARA1') ?
         Promise.resolve({ result: '200', cmd: '', err: null }) : Promise.resolve({ result: '100', cmd: '', err: null });
      }
      if (cmd.includes('ZMIN')) {
        return cmd.includes('SCARA1') ?
         Promise.resolve({ result: '20', cmd: '', err: null }) : Promise.resolve({ result: '10', cmd: '', err: null });
      }

     });
  }));

  /**
   * Do the test initialization before it is running.
   */
  beforeEach((done) => {
    fixture = TestBed.createComponent(JumpDialogComponent);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component = fixture.componentInstance;
      fixture.detectChanges();
      done();
    });
  });

  /**
   * Constructor test.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.motionRobot).toBe('SCARA');
    expect(component.motionRobots.length).toBe(2);

    expect(Object.keys(component.requiredFormControls).length).toBe(2);
    expect(Object.keys(component.advancedFormControls).length).toBe(5);

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;
    let selectList = htmlElement.querySelectorAll('mat-select');
    expect(selectList.length).toBe(2);
    expect(selectList.item(0).getAttribute('ng-reflect-model')).toBe('SCARA', 'the motion element is first one by default');
    expect(selectList.item(1).getAttribute('ng-reflect-model')).toBeNull();

    let slideToggle = htmlElement.querySelector('mat-slide-toggle');
    expect(slideToggle).toBeTruthy();
    expect(slideToggle.getAttribute('ng-reflect-disabled')).toBe('true', 'the advanced mode is disabled by default');
  });

  /**
   * The test of the motion element change.
   */
  it('when the user changes the motion element, the value should be updated', () => {
    expect(component).toBeTruthy();
    expect(component.motionRobot).toBe('SCARA');
    expect(component.motionRobots.length).toBe(2);

    component.motionRobot = component.motionRobots[1];
    fixture.detectChanges();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;
    let selectList = htmlElement.querySelectorAll('mat-select');
    expect(selectList.length).toBe(2);
    expect(selectList.item(0).getAttribute('ng-reflect-model')).toBe('SCARA1', 'the motion element is first one by default');
    expect(selectList.item(1).getAttribute('ng-reflect-model')).toBeNull();

  });

  /**
   * The test of the advanced mode enable.
   */
  it('when the user selects the motion element and destination frame, the advanced mode should be enable', () => {
    expect(component).toBeTruthy();
    expect(component.motionRobot).toBe('SCARA');
    component.location = dataService.locations()[0];
    fixture.detectChanges();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;
    let slideToggle = htmlElement.querySelector('mat-slide-toggle');
    expect(slideToggle).toBeTruthy();
    expect(slideToggle.getAttribute('ng-reflect-disabled')).toBe('false', '');

    let inputList = debugElement.queryAll(By.directive(MatInput));
    expect(inputList.length).toBe(0);

    component.advancedMode = true;
    fixture.detectChanges();

    inputList = debugElement.queryAll(By.directive(MatInput));
    expect(inputList.length).toBe(5);
  });

  /**
   * The test to the validation error of insert.
   */
  it('when the user only selects the motion element, it will have validation error for destination frame ', () => {
    expect(component).toBeTruthy();
    expect(component.motionRobot).toBe('SCARA');

    expect(component.requiredFormControls[JumpParameter.DestinationFrame].untouched).toBe(true,
            'the destination frame window is untouched as default');

    component.insert();
    fixture.detectChanges();

    expect(component.requiredFormControls[JumpParameter.DestinationFrame].untouched).toBe(false,
            'the destination frame window is touched as default');

  });

  /**
   * The test to the jump command insertion.
   */
  it('the jump command can be inserted after the user selects the motion element and destination frame', () => {
    expect(component).toBeTruthy();
    expect(component.motionRobot).toBe('SCARA');

    component.location = dataService.locations()[0];
    fixture.detectChanges();

    expect(component.requiredFormControls[JumpParameter.DestinationFrame].status).toBe('VALID',
            'the destination frame validation is successful');

    let inputList = debugElement.queryAll(By.directive(MatInput));
    expect(inputList.length).toBe(5);

    component.insert();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.dialogRef.close).toHaveBeenCalledWith('jump(SCARA, "P1", -1, 0xffff, -1, -1, -1)');
    });

  });

  /**
   * The test to the jump command insertion.
   */
  it('the jump command can be inserted after the user selects the motion element, destination frame and enables advanced mode', () => {
    expect(component).toBeTruthy();
    expect(component.motionRobot).toBe('SCARA');

    component.location = dataService.locations()[0];
    component.advancedMode = true;
    fixture.detectChanges();

    expect(component.requiredFormControls[JumpParameter.DestinationFrame].status).toBe('VALID',
            'the destination frame validation is successful');

    component.insert();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.dialogRef.close).toHaveBeenCalledWith('jump(SCARA, "P1", -1, 0xffff, -1, -1, -1)');
    });

  });

  /**
   * The test to the cancel method.
   */
  it('when the user clicks cancel button, the dialog will be closed.', () => {
    expect(component).toBeTruthy();

    component.cancel();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.dialogRef.close).toHaveBeenCalledWith();
    });

  });

});
