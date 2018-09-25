import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';

import { IoComponent } from './io.component';

import { IoService } from './../../services/io.service';
import { WebsocketService } from '../../../core/services/websocket.service';

/**
 * It contains all the test specs to IoComponent.
 */
describe('IoComponent', () => {
  /**
   * The IoComponent instance.
   */
  let component: IoComponent;

  /**
   * The fixture for debugging and testing IoComponent.
   */
  let fixture: ComponentFixture<IoComponent>;

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
   * Do the test initialization before it is running.
   */
  beforeEach(async(() => {
    const spyObj = jasmine.createSpyObj('WebSocketService', ['query']);

    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [IoService, { provide: WebsocketService, useValue: spyObj }],
      declarations: [IoComponent]
    })
    .compileComponents();

    webSocketServiceSpy = TestBed.get(WebsocketService);

    const spyValue = `[
      {"index":0,"value":"0","label":"Omri"},
      {"index":1,"value":"0","label":"Mirko"}
    ]`;

    const mcQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
       return Promise.resolve(mcQueryResponse);
      });
  }));

  /**
   * Do the test initialization before it is running.
   */
  beforeEach((done) => {
    fixture = TestBed.createComponent(IoComponent);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component = fixture.componentInstance;
      done();
    });

  });

  /**
   * IoComponent constructor test.
   */
  it('should create', () => {
    expect(component).toBeTruthy();

    expect(component.ioOptions.length).toBe(4, 'there are four io options');
    expect(component.ioOptions[0]).toEqual('All Inputs', 'the first one is all inputs');
    expect(component.ioOptions[1]).toEqual('All Outputs', 'the second one is all outputs');

    expect(component.radioButtonOptions.length).toBe(3, 'there are three io value format options');
    expect(component.radioButtonOptions[0]).toEqual('bit', 'the first one is all inputs');
    expect(component.radioButtonOptions[1]).toEqual('byte', 'the second one is all outputs');

  });

  /**
   * The default io option test.
   */
  it('the io option should be one input, one output for the dropdown list', () => {
    expect(component).toBeTruthy();

    expect(component.leftSelected).toBe('All Inputs', 'all inputs on the left table');
    expect(component.rightSelected).toBe('All Outputs', 'all outputs on the right table');

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const selectList = htmlElement.querySelectorAll('mat-select');
    expect(selectList.length).toBe(2, 'there are two drop down list');
    expect(selectList.item(0).getAttribute('ng-reflect-model')).toBe('All Inputs', 'all inputs on the left table');
    expect(selectList.item(1).getAttribute('ng-reflect-model')).toBe('All Outputs', 'all outputs on the right table');
  });

  /**
   * The default io format test.
   */
  it('the io format option should be bit as default', () => {
    expect(component).toBeTruthy();

    expect(component.leftRadioOptions).toBe('bit', 'the value format is bit on the left table');
    expect(component.rightRadioOptions).toBe('bit', 'the value format is bit on the right table');

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const radioGroupList = htmlElement.querySelectorAll('mat-radio-group');
    expect(radioGroupList.length).toBe(2, 'there are two radio group');
    expect(radioGroupList.item(0).getAttribute('ng-reflect-model')).toBe('bit', 'the value format is bit on the left table');
    expect(radioGroupList.item(1).getAttribute('ng-reflect-model')).toBe('bit', 'the value format is bit on the right table');
  });

  /**
   * The default table header test.
   */
  it('the table header should be bit, status and label as default', () => {
    expect(component).toBeTruthy();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const tableList = htmlElement.querySelectorAll('mat-table');
    expect(tableList.length).toBe(2, 'there are two tables');
    expect(tableList.item(0).children.length).toBe(3, 'there is one header and two rows');

    let tableHeader = tableList.item(0).children.item(0) as HTMLElement;
    expect(tableHeader.innerText).toBe('Bit\nStatus\nLabel\n', 'the table header should be bit, status and label');
  });

  /**
   * The table header test if the io format is byte.
   */
  it('the table header should be bit, value and label if the format is byte', () => {
    expect(component).toBeTruthy();
    component.leftRadioOptions = 'byte';
    fixture.detectChanges();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const tableList = htmlElement.querySelectorAll('mat-table');
    expect(tableList.length).toBe(2, 'there are two tables');
    expect(tableList.item(0).children.length).toBe(3, 'there is one header and two rows');

    let tableHeader = tableList.item(0).children.item(0) as HTMLElement;
    expect(tableHeader.innerText).toBe('Byte\nValue\nLabel\n', 'the table header should be bit, status and label');
  });

  /**
   * The io value change test in the left table if io option is output.
   */
  it('the io value can be changed in the left table if the option is output', () => {
    expect(component).toBeTruthy();
    component.leftSelected = 'All Outputs';
    component.onClickRadioButton(0, 'left');
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      checkRadioButton(fixture, 0, true, 'the radio button should be checked after click');
    }).then(() => {
      component.onClickRadioButton(0, 'left');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        checkRadioButton(fixture, 0, false, 'the radio button should be unchecked after click');
      });
    });

  });

  /**
   * The io value change test in the right table if io option is output.
   */
  it('the io value can be changed in the right table if the option is output', () => {
    expect(component).toBeTruthy();
    component.rightSelected = 'All Outputs';
    component.onClickRadioButton(0, 'right');
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      checkRadioButton(fixture, 1, true, 'the radio button should be checked after click');
    }).then(() => {
      component.onClickRadioButton(0, 'right');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        checkRadioButton(fixture, 1, false, 'the radio button should be unchecked after click');
      });
    });

  });

  /**
   * The io value change test in the left table if io option is input.
   */
  it('the io value cannot be changed if the option is input', () => {
    expect(component).toBeTruthy();
    component.onClickRadioButton(0, 'left');
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      checkRadioButton(fixture, 0, false, 'the radio button should be unchecked after click');
    });

  });

  /**
   * The io value change test in the right table if io option is input.
   */
  it('the io status cannot be changed in the right table if the option is input', () => {
    expect(component).toBeTruthy();
    component.rightSelected = 'All Inputs';
    component.onClickRadioButton(0, 'right');
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      checkRadioButton(fixture, 1, false, 'the radio button should be unchecked after click');
    });

  });

  /**
   * Check the radio button to verify io value change.
   * @param testFixture The fixture for debugging and testing.
   * @param tableIndex  The table index.
   * @param expectValue The expect value for the radio button.
   * @param comment The comment to value check.
   */
  function checkRadioButton(testFixture: ComponentFixture<IoComponent>, tableIndex: number, expectValue: boolean, comment: string) {
    debugElement = testFixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const tableList = htmlElement.querySelectorAll('mat-table');
    expect(tableList.length).toBe(2, 'there are two tables');
    expect(tableList.item(tableIndex).children.length).toBe(3, 'there is one header and two rows');

    let row = tableList.item(tableIndex).children.item(1);
    let cell = row.children.item(1);
    let input = cell.children.item(0) as HTMLInputElement;
    expect(input.checked).toBe(expectValue, comment);
    return null;
  }

});
