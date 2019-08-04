import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material';
import { DebugElement } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from './../../../shared/unit-test.module';
import { WebsocketService } from '../../../core/services';
import { ToolCalibrationResultDialogComponent } from './tool-calibration-result-dialog.component';
import { CalibrationMessage } from './tool-calibration-result-dialog.enum';

/**
 * It contains all the test specs to ToolCalibrationResultDialogComponent.
 */
describe('ToolCalibrationResultDialogComponent', () => {
  /**
   * The ToolCalibrationResultDialogComponent instance.
   */
  let component: ToolCalibrationResultDialogComponent;

  /**
   * The fixture for debugging and testing ToolCalibrationResultDialogComponent.
   */
  let fixture: ComponentFixture<ToolCalibrationResultDialogComponent>;

  /**
   * The WebSocketService spy instance.
   */
  let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;

  /**
   * The debug element for testing.
   */
  let debugElement: DebugElement;

  /**
   * The html element for testing.
   */
  let htmlElement: HTMLElement;

  /**
   * The test tool name.
   */
  const toolName = 'testTool';

  /**
   * The mock dialog.
   */
  const dialogRef = {
    close: jasmine.createSpy('close'),
  };

  /**
   * Do the test initialization before it is running.
   */
  beforeEach(async(() => {
    const spyObj = jasmine.createSpyObj('WebSocketService', ['query']);

    TestBed.configureTestingModule({
      imports: [SharedModule, UnitTestModule, MatDialogModule],
      declarations: [ToolCalibrationResultDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { toolName: toolName } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: WebsocketService, useValue: spyObj },
      ],
    }).compileComponents();

    webSocketServiceSpy = TestBed.get(WebsocketService);

    let spyValue = createMockToolCalibrationResult();
    let resultQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(resultQueryResponse);
    });
  }));

  /**
   * Do the test initialization before it is running.
   */
  beforeEach(done => {
    fixture = TestBed.createComponent(ToolCalibrationResultDialogComponent);

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

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    let pres = htmlElement.querySelectorAll('pre');
    expect(pres).toBeTruthy();
    expect(pres.length).toBe(2);
    expect(pres.item(0).textContent).toBe(
      CalibrationMessage.IsApplyDataToTool + ' ' + toolName + '?'
    );
    expect(pres.item(1).textContent).toBe(CalibrationMessage.ResultOutOfScope);

    let resultTable = htmlElement.querySelector('mat-table');
    expect(resultTable).toBeTruthy();
    expect(resultTable.children.length).toBe(
      6,
      'there is one header and five rows.'
    );
    expect(resultTable.textContent).toBe(
      'currentnewdeltax mm  0  -484.7536  -484.7536 y mm  0  4.3401  4.3401 ' +
        'z mm  0  0  0 r °  0  0  0 Error mm    11.9508   '
    );
  });

  /**
   * onApply method test.
   */
  it('when the user clicks apply button, the dialog will be closed.', () => {
    expect(component).toBeTruthy();

    let resultQueryResponse = { result: '', cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(resultQueryResponse);
    });

    component.onApply();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.dialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  /**
   * onCancel method test.
   */
  it('when the user clicks cancel button, the dialog will be closed.', () => {
    expect(component).toBeTruthy();

    let resultQueryResponse = { result: '', cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(resultQueryResponse);
    });

    component.onCancel();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.dialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  /**
   * Create the mock tool calibration result.
   * @returns The mock tool calibration result.
   */
  function createMockToolCalibrationResult() {
    return `{
      "cur": "D:#{0 , 0 , 0 , 0}",
      "tab": [
        {
          "name": "x",
          "unit": "mm",
          "current": "",
          "new": -484.75357747290235,
          "delta": ""
        },
        {
          "name": "y",
          "unit": "mm",
          "current": "",
          "new": 4.340099563896625,
          "delta": ""
        },
        {
          "name": "z",
          "unit": "mm",
          "current": "",
          "new": 0,
          "delta": ""
        },
        {
          "name": "r",
          "unit": "°",
          "current": "",
          "new": 0,
          "delta": ""
        },
        {
          "name": "error",
          "unit": "mm",
          "current": "",
          "new": 11.950783987087391,
          "delta": ""
        }
      ]
    }`;
  }
});
