import { TestBed } from '@angular/core/testing';

import { IoService } from './io.service';
import { WebsocketService } from '../../core';

/**
 * It contains all the test specs to IoService.
 */
describe('IoService', () => {
  let ioService: IoService;
  let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;

  /**
   * Do the test initialization before it is running.
   */
  beforeEach(() => {
    const spyObj = jasmine.createSpyObj('WebSocketService', ['query']);

    TestBed.configureTestingModule({
      providers: [IoService, { provide: WebsocketService, useValue: spyObj }]
    });

    ioService = TestBed.get(IoService);
    webSocketServiceSpy = TestBed.get(WebsocketService);
  });

  /**
   * IoService constructor test.
   */
  it('should be created', () => {
    expect(ioService).toBeTruthy();
  });

  it('io options should be ready for use', () => {
    expect(ioService).toBeTruthy();

    let ioOptions = ioService.getIoOptions();
    expect(ioOptions).toBeTruthy();
    expect(ioOptions.length).toBe(4, 'there are four io options');
    expect(ioOptions[1]).toBe('All Outputs', 'io output option');
  });

  /**
   * getIoOption method test.
   */
  it('io format options should be ready for use', () => {
    expect(ioService).toBeTruthy();

    let ioFormatOptions = ioService.getIoFormatOptions();
    expect(ioFormatOptions).toBeTruthy();
    expect(ioFormatOptions.length).toBe(3, 'there are three io format options');
    expect(ioFormatOptions[1]).toBe('byte', 'io format option');
  });

  /**
   * getIos method test without sending query command.
   */
  it('io result should be empty without sending query command', () => {
    expect(ioService).toBeTruthy();

    expect(ioService.getIos()).toBeTruthy();

    expect(ioService.getIos().length).toBe(
      0,
      'io query result should be empty'
    );
  });

  /**
   * IoService query method test.
   * It should return the right io information in the query response.
   */
  it('io result should not be empty after getting query response', () => {
    expect(ioService).toBeTruthy();

    const spyValue = `[
      {"index":"0","status":"false","label":"Omri"},
      {"index":"1","status":"false","label":"Mirko"}
    ]`;

    const mcQueryResponse = { result: spyValue, cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
       return Promise.resolve(mcQueryResponse);
      });

    ioService.query('All Inputs', 'all', false).then(() => {
      let ios = ioService.getIos();
      expect(ios.length).toBe(2, 'it should have two ios');
      expect(ios[0].label).toBe('Omri', 'io has its own label');

    });
  });

  /**
   * IoService query method test with the error response.
   * It should return empty result if there is error in the query response.
   */
  it('io result should be empty if there is error in the query response', () => {
    expect(ioService).toBeTruthy();

    const spyValue = `[
      {"index":"0","status":"false","label":"Omri"},
      {"index":"1","status":"false","label":"Mirko"}
    ]`;

    const errFrame = {
      errType : 'error',
      errCode : 'error',
      errMsg : 'error',
      errTask : 'error',
      errLine : 'error',
      errModule  : 'error'
    };

    const mcQueryResponse = { result: spyValue, cmd: '', err: errFrame };

    webSocketServiceSpy.query.and.callFake(() => {
       return Promise.resolve(mcQueryResponse);
      });

    ioService.query('All Inputs', 'all', false).then(() => {
      let ios = ioService.getIos();
      expect(ios.length).toBe(0, 'there is no io');
    });
  });

  /**
   * setIoByBit method test.
   * Change the io output value by bit.
   */
  it('change io output value', () => {
    expect(ioService).toBeTruthy();

    const mcQueryResponse = { result: '', cmd: '', err: null };

    webSocketServiceSpy.query.and.callFake(() => {
       return Promise.resolve(mcQueryResponse);
      });

    ioService.setIoByBit(1, '1').then(() => {
    });
  });

});
