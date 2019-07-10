import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';

import { CustomIOComponent } from './custom-io.component';

import {
  CustomIOTypes,
  CustomIOType,
} from './../../../services/io.service.enum';
import { IoService } from '../../../services/io.service';
import { WebsocketService } from '../../../../core/services/websocket.service';

/**
 * It contains all the test specs to CustomIOComponent.
 */
describe('CustomIOComponent', () => {
  /**
   * The CustomIOComponent instance.
   */
  let component: CustomIOComponent;

  /**
   * The fixture for debugging and testing CustomIOComponent.
   */
  let fixture: ComponentFixture<CustomIOComponent>;

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
      imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
      providers: [IoService, { provide: WebsocketService, useValue: spyObj }],
      declarations: [CustomIOComponent],
    }).compileComponents();

    webSocketServiceSpy = TestBed.get(WebsocketService);

    let spyValue = createMockCustomIoPorts();
    let customIoPortQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      let promise = Promise.resolve(customIoPortQueryResponse);
      promise.then(() => {
        spyValue = createMockCustomIos();
        let customIoQueryResponse = { result: spyValue, cmd: '', err: null };
        webSocketServiceSpy.query.and.callFake(() => {
          return Promise.resolve(customIoQueryResponse);
        });
      });
      return promise;
    });
  }));

  /**
   * Do the test initialization before it is running.
   */
  beforeEach(done => {
    fixture = TestBed.createComponent(CustomIOComponent);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component = fixture.componentInstance;
      fixture.detectChanges();
      done();
    });
  });

  /*********************************************************************************/

  /**
   * CustomIOComponent constructor test.
   */
  it('should create', () => {
    expect(component).toBeTruthy();

    expect(component.tableIndex).toBe(1, 'default custom io table index');
    expect(component.isAddEnable).toBe(true, 'add button is enabled');
    expect(component.isDeleteEnable).toBe(false, 'delete button is disabled');

    expect(component.selectedRowInCustomTable).toBeNull();
    expect(component.selectedIndexInCustomTable).toBe(
      -1,
      'there is no row selected'
    );

    expect(component.customDataSource.data).toBeTruthy();
    expect(component.customDataSource.data.length).toBe(
      3,
      'there are three rows'
    );
    expect(component.customDataSource.data[0].type.length).toBe(
      4,
      'there are three types'
    );
  });

  /*********************************************************************************/

  /**
   * selectRowInCustomTable method test.
   */
  it('select one row in the custom io table, delete button will be enabled', () => {
    expect(component).toBeTruthy();
    expect(component.selectedRowInCustomTable).toBeNull();
    expect(component.selectedIndexInCustomTable).toBe(
      -1,
      'there is no row selected'
    );

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    component.selectRowInCustomTable(component.customDataSource.data[0], 0);
    fixture.detectChanges();

    expect(component.selectedIndexInCustomTable).toBe(
      0,
      'the select index will be 0'
    );
    expect(component.selectedRowInCustomTable).toBe(
      component.customDataSource.data[component.selectedIndexInCustomTable],
      'the first row is selected'
    );
  });

  /*********************************************************************************/

  /**
   * addRowInCustomTable method test.
   */
  it('add one row in the custom io table and the new row will be selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedRowInCustomTable).toBeNull();
    expect(component.selectedIndexInCustomTable).toBe(
      -1,
      'there is no row selected'
    );

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    let spyValue = createMockCustomIo();
    let mcQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(mcQueryResponse);
    });

    component.addRowInCustomTable();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(ioTable.children.length).toBe(
        5,
        'there is one header and four rows'
      );
      expect(component.customDataSource.data.length).toBe(
        4,
        'there are four rows'
      );

      expect(component.selectedRowInCustomTable).toBe(
        component.customDataSource.data[component.selectedIndexInCustomTable],
        'the last row is selected'
      );
      expect(component.selectedIndexInCustomTable).toBe(
        3,
        'the select index will be 3'
      );
    });
  });

  /*********************************************************************************/

  /**
   * deleteRowInCustomTable method test.
   * Delete the last row and then the new last row will be selected.
   */
  it('delete last row in the custom io table and then the new last row will be selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedRowInCustomTable).toBeNull();
    expect(component.selectedIndexInCustomTable).toBe(
      -1,
      'there is no row selected'
    );

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    let ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    let mcQueryResponse = { result: '', cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(mcQueryResponse);
    });

    let selectRow = ioTable.children.item(1);
    component.selectRowInCustomTable(selectRow, 2);
    fixture.detectChanges();

    expect(component.selectedRowInCustomTable).toBe(
      selectRow,
      'the last row is selected'
    );
    expect(component.selectedIndexInCustomTable).toBe(
      2,
      'the select index will be 2'
    );

    component.deleteRowInCustomTable();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(ioTable.children.length).toBe(
        3,
        'there is one header and two rows'
      );
      expect(component.customDataSource.data.length).toBe(
        2,
        'there are two rows'
      );

      expect(component.selectedIndexInCustomTable).toBe(
        1,
        'the select index will be 1'
      );
      expect(component.selectedRowInCustomTable).toBe(
        component.customDataSource.data[component.selectedIndexInCustomTable],
        'the last row is selected'
      );
    });
  });

  /**
   * deleteRowInCustomTable method test.
   * Delete one row not last and then the selected row will be null.
   */
  it('delete one row not last in the custom io table and then the selected row will be null', () => {
    expect(component).toBeTruthy();
    expect(component.selectedRowInCustomTable).toBeNull();
    expect(component.selectedIndexInCustomTable).toBe(
      -1,
      'there is no row selected'
    );

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    let ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    let mcQueryResponse = { result: '', cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(mcQueryResponse);
    });

    let selectRow = ioTable.children.item(1);
    component.selectRowInCustomTable(selectRow, 0);
    fixture.detectChanges();

    expect(component.selectedRowInCustomTable).toBe(
      selectRow,
      'the first row is selected'
    );
    expect(component.selectedIndexInCustomTable).toBe(
      0,
      'the select index will be 0'
    );

    component.deleteRowInCustomTable();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(ioTable.children.length).toBe(
        3,
        'there is one header and two rows'
      );
      expect(component.customDataSource.data.length).toBe(
        2,
        'there are two rows'
      );

      expect(component.selectedIndexInCustomTable).toBe(
        -1,
        'the select index will be -1'
      );
      expect(component.selectedRowInCustomTable).toBeNull();
    });
  });

  /*********************************************************************************/

  /**
   * removeSelectionOnPortOrTypeChange method test.
   */
  it('if select io type or port on custom IO, the row will be changed to unselected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedRowInCustomTable).toBeNull();
    expect(component.selectedIndexInCustomTable).toBe(
      -1,
      'there is no row selected'
    );

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    component.selectRowInCustomTable(component.customDataSource.data[0], 0);
    fixture.detectChanges();

    expect(component.selectedIndexInCustomTable).toBe(
      0,
      'the select index will be 0'
    );
    expect(component.selectedRowInCustomTable).toBe(
      component.customDataSource.data[component.selectedIndexInCustomTable],
      'the first row is selected'
    );

    component.removeSelectionOnPortOrTypeChange(new Event(''));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.selectedIndexInCustomTable).toBe(
        -1,
        'the select index will be -1'
      );
      expect(component.selectedRowInCustomTable).toBeNull();
    });
  });

  /*********************************************************************************/

  /**
   * typeSelectionChange method test.
   */
  it('if io type is changed, the row will be updated', () => {
    expect(component).toBeTruthy();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    expect(ioTable.children.item(1).textContent).toBe(
      'Output Bit2000 1 ',
      'it is the first row.'
    );

    let spyValue = createMockCustomIo(CustomIOTypes.OutputByte);
    let mcQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(mcQueryResponse);
    });

    component.typeSelectionChange(0, CustomIOTypes.OutputByte);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(ioTable.children.item(1).textContent).toBe(
        'Output Byte2000 0  1 ',
        'it is the first row.'
      );
    });
  });

  /**
   * typeSelectionChange method test.
   * If io type is changed and selected port is not in the new list, the select port will be updated to the first one.
   */
  it('if io type is changed and selected port is not in the new list, the select port will be updated to the first one', () => {
    expect(component).toBeTruthy();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    expect(ioTable.children.item(1).textContent).toBe(
      'Output Bit2000 1 ',
      'it is the first row.'
    );

    let spyValue = createMockCustomIo(CustomIOTypes.InputBit, 3000, '0', '1');
    let mcQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(mcQueryResponse);
    });

    component.typeSelectionChange(0, CustomIOTypes.InputBit);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(ioTable.children.item(1).textContent).toBe(
        'Input Bit3000 1 ',
        'it is the first row.'
      );
    });
  });

  /*********************************************************************************/

  /**
   * portSelectionChange method test.
   */
  it('if io port is changed, the row will be updated', () => {
    expect(component).toBeTruthy();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    expect(ioTable.children.item(1).textContent).toBe(
      'Output Bit2000 1 ',
      'it is the first row.'
    );

    let spyValue = createMockCustomIo(CustomIOTypes.OutputBit, 2001, '0', '1');
    let mcQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
      return Promise.resolve(mcQueryResponse);
    });

    component.portSelectionChange(0, 2001);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(ioTable.children.item(1).textContent).toBe(
        'Output Bit2001 1 ',
        'it is the first row.'
      );
    });
  });

  /*********************************************************************************/

  /**
   * onClickRadioButtonInCustomIO method test.
   */
  it('the io value can be changed in the table if the type is output', () => {
    expect(component).toBeTruthy();

    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;

    const ioTable = htmlElement.querySelector('mat-table');
    expect(ioTable).toBeTruthy();
    expect(ioTable.children.length).toBe(
      4,
      'there is one header and three rows.'
    );

    component.onClickRadioButtonInCustomIO(0, new Event(''));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      let row = ioTable.children.item(1);
      let cell = row.children.item(2);
      let input = cell.children.item(0) as HTMLInputElement;
      expect(input.checked).toBe(
        true,
        'the radio button should be checked after click'
      );
    });
  });

  /*********************************************************************************/

  /**
   * Create the mock custom io ports.
   * @returns The mock custom io ports.
   */
  function createMockCustomIoPorts() {
    return `{
        "InputBit":[3000,3001],
        "InputByte":[],
        "InputWord":[],
        "OutputBit":[2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015],
        "OutputByte":[2000,2008],
        "OutputWord":[2000]
      }`;
  }

  /**
   * Create the mock custom io.
   * @param type The mock custom io type.
   * @param port The mock custom io port.
   * @param value The mock custom io value.
   * @param label The mock custom io label.
   * @returns The mock custom io.
   */
  function createMockCustomIo(
    type = CustomIOTypes.OutputBit,
    port = 2000,
    value = '0',
    label = '1'
  ) {
    return `{"type":"${type}","port":${port},"value":"${value}","label":"${label}"}`;
  }

  /**
   * Create the mock custom ios.
   * @returns The mock custom ios.
   */
  function createMockCustomIos() {
    return `[{"type":"Output Bit","port":2000,"value":"0","label":"1"},
    {"type":"Output Bit","port":2000,"value":"0","label":"2"},
    {"type":"Output Bit","port":2000,"value":"0","label":"3"}]`;
  }
});
