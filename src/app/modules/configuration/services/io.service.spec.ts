// import { TestBed } from '@angular/core/testing';

// import { IoService } from './io.service';
// import { WebsocketService } from '../../core';
// import { IoOption, CustomIOType } from './io.service.enum';

// /**
//  * It contains all the test specs to IoService.
//  */
// describe('IoService', () => {
//   /**
//    * The IoService Instance.
//    */
//   let ioService: IoService;

//   /**
//    * The WebSocketSerivce spy instance.
//    */
//   let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;

//   /**
//    * Do the test initialization before it is running.
//    */
//   beforeEach(() => {
//     const spyObj = jasmine.createSpyObj('WebSocketService', ['query']);

//     TestBed.configureTestingModule({
//       providers: [IoService, { provide: WebsocketService, useValue: spyObj }]
//     });

//     ioService = TestBed.get(IoService);
//     webSocketServiceSpy = TestBed.get(WebsocketService);
//   });

//   /**
//    * IoService constructor test.
//    */
//   it('io service should be created', () => {
//     expect(ioService).toBeTruthy();
//   });

//   it('io options should be ready for use', () => {
//     expect(ioService).toBeTruthy();

//     let ioOptions = ioService.getIoOptions();
//     expect(ioOptions).toBeTruthy();
//     expect(ioOptions.length).toBe(4, 'there are four io options');
//     expect(ioOptions[1]).toBe('All Outputs', 'io output option');
//   });

//   /**
//    * getIoOption method test.
//    */
//   it('io format options should be ready for use', () => {
//     expect(ioService).toBeTruthy();

//     let ioFormatOptions = ioService.getIoFormatOptions();
//     expect(ioFormatOptions).toBeTruthy();
//     expect(ioFormatOptions.length).toBe(3, 'there are three io format options');
//     expect(ioFormatOptions[1]).toBe('byte', 'io format option');
//   });

//   /**
//    * getCustomIoTypes method test.
//    */
//   it('custom io types should be ready for use', () => {
//     expect(ioService).toBeTruthy();

//     let customIoTypes = ioService.getCustomIoTypes();
//     expect(customIoTypes).toBeTruthy();
//     expect(customIoTypes.length).toBe(6, 'there are six custom io types');
//     expect(customIoTypes[1]).toBe('Input Byte', 'custom io type');
//   });


//   /**
//    * getCustomIoPorts method test without sending query command.
//    */
//   it('custom io port result should be null without sending query command', () => {
//     expect(ioService).toBeTruthy();

//     expect(ioService.getCustomIoPorts()).toBeNull();

//   });

//   /*********************************************************************************/

//   /**
//    * queryCustomIoPorts method test.
//    * It should return the right custom io ports in the query response.
//    */
//   it('custom io port result should not be empty after getting query response', () => {
//     expect(ioService).toBeTruthy();

//     let spyValue = createMockCustomIoPorts();
//     let mcQueryResponse = { result: spyValue, cmd: '', err: null };

//     webSocketServiceSpy.query.and.callFake(() => {
//        return Promise.resolve(mcQueryResponse);
//       });

//     ioService.queryCustomIoPorts().then(() => {
//       let customIoPorts = ioService.getCustomIoPorts();
//       expect(customIoPorts).toBeTruthy();
//       let key = CustomIOType.InputBit.replace(/\s/g, '');
//       expect(customIoPorts[key]).toBeTruthy();
//       expect(customIoPorts[key].length).toBe(0, 'no input port');

//     });
//   });

//   /**
//    * queryCustomIoPorts method test with the error response.
//    * It should return null if there is error in the query response.
//    */
//   it('custom io port result should be null if there is error in the query response', () => {
//     expect(ioService).toBeTruthy();

//     let spyValue = createMockCustomIoPorts();
//     let errFrame = createMockErrorFrame();
//     let mcQueryResponse = { result: spyValue, cmd: '', err: errFrame };

//     webSocketServiceSpy.query.and.callFake(() => {
//        return Promise.resolve(mcQueryResponse);
//       });

//       ioService.queryCustomIoPorts().then(() => {
//         expect(ioService).toBeTruthy();
//         expect(ioService.getCustomIoPorts()).toBeNull();
//     });
//   });

//   /*********************************************************************************/

//   /**
//    * getCustomIos method test without sending query command.
//    */
//   it('custom ios result should be empty without sending query command', () => {
//     expect(ioService).toBeTruthy();

//     let spyValue = createMockCustomIoPorts();
//     let customIoPorts = JSON.parse(spyValue);

//     expect(ioService.getCustomIos(ioService.getCustomIoTypes(), customIoPorts)).toBeTruthy();
//     expect(ioService.getCustomIos(ioService.getCustomIoTypes(), customIoPorts).length).toBe(
//       0, 'custom ios query result should be empty');
//   });

//   /**
//    * getCustomIos method test.
//    * It should return the right io information in the query response.
//    */
//   it('custom ios result should not be empty after getting query response', () => {
//     expect(ioService).toBeTruthy();

//     let spyValue = createMockCustomIos();
//     let mcQueryResponse = { result: spyValue, cmd: '', err: null };

//     webSocketServiceSpy.query.and.callFake(() => {
//        return Promise.resolve(mcQueryResponse);
//       });

//     spyValue = createMockCustomIoPorts();
//     let customIoPorts = JSON.parse(spyValue);

//     ioService.queryCustomIos(1, false).then(() => {
//       let customIos = ioService.getCustomIos(ioService.getCustomIoTypes(), customIoPorts);
//       expect(customIos.length).toBe(3, 'it should have three custom ios');
//       expect(customIos[0].label).toBe('1', 'custom io has its own label');

//     });
//   });


//   /**
//    * getCustomIos method test with the error response.
//    * It should return empty result if there is error in the query response.
//    */
//   it('custom ios result should be empty if there is error in the query response', () => {
//     expect(ioService).toBeTruthy();

//     let spyValue = createMockCustomIos();
//     let errFrame = createMockErrorFrame();
//     let mcQueryResponse = { result: spyValue, cmd: '', err: errFrame };

//     webSocketServiceSpy.query.and.callFake(() => {
//        return Promise.resolve(mcQueryResponse);
//       });

//     spyValue = createMockCustomIoPorts();
//     let customIoPorts = JSON.parse(spyValue);

//       ioService.queryCustomIos(1, false).then(() => {
//         let customIos = ioService.getCustomIos(ioService.getCustomIoTypes(), customIoPorts);
//         expect(customIos.length).toBe(0, 'there is no custom io');
//     });
//   });

//   /*********************************************************************************/

//   /**
//    * addCustomIo method test.
//    */
//   it('Add new custom io item into the view', () => {
//     expect(ioService).toBeTruthy();

//     let spyValue = createMockCustomIo();
//     let mcQueryResponse = { result: spyValue, cmd: '', err: null };

//     webSocketServiceSpy.query.and.callFake(() => {
//       return Promise.resolve(mcQueryResponse);
//     });

//     spyValue = createMockCustomIoPorts();
//     let customIoPorts = JSON.parse(spyValue);

//     ioService.addCustomIo(1, CustomIOType.OutputBit, 2000, false).then(() => {
//       let customIo = ioService.getCustomIo(ioService.getCustomIoTypes(), customIoPorts);
//       expect(customIo).toBeTruthy();
//     });

//   });

//   /**
//    * modifyCustomIo method test.
//    */
//   it('modify custom io item in the view', () => {
//     expect(ioService).toBeTruthy();

//     let spyValue = createMockCustomIo();
//     let mcQueryResponse = { result: spyValue, cmd: '', err: null };

//     webSocketServiceSpy.query.and.callFake(() => {
//       return Promise.resolve(mcQueryResponse);
//     });

//     spyValue = createMockCustomIoPorts();
//     let customIoPorts = JSON.parse(spyValue);

//     ioService.modifyCustomIo(1, 1, CustomIOType.OutputBit, 2000, false).then(() => {
//       let customIo = ioService.getCustomIo(ioService.getCustomIoTypes(), customIoPorts);
//       expect(customIo).toBeTruthy();
//     });

//   });

//     /**
//    * removeCustomIo method test.
//    */
//   it('remove custom io item in the view', () => {
//     expect(ioService).toBeTruthy();

//     let mcQueryResponse = { result: '', cmd: '', err: null };

//     webSocketServiceSpy.query.and.callFake(() => {
//       return Promise.resolve(mcQueryResponse);
//     });

//     let spyValue = createMockCustomIoPorts();
//     let customIoPorts = JSON.parse(spyValue);

//     ioService.removeCustomIo(1, 1).then(() => {
//       let customIo = ioService.getCustomIo(ioService.getCustomIoTypes(), customIoPorts);
//       expect(customIo).toBeNull();
//     });

//   });

//   /*********************************************************************************/

//   /**
//    * getIos method test without sending query command.
//    */
//   it('io result should be empty without sending query command', () => {
//     expect(ioService).toBeTruthy();

//     expect(ioService.getIos()).toBeTruthy();

//     expect(ioService.getIos().length).toBe(
//       0,
//       'io query result should be empty'
//     );
//   });

//   /**
//    * getIos method test.
//    * It should return the right io information in the query response.
//    */
//   it('io result should not be empty after getting query response', () => {
//     expect(ioService).toBeTruthy();

//     const spyValue = createMockIos();
//     const mcQueryResponse = { result: spyValue, cmd: '', err: null };

//     webSocketServiceSpy.query.and.callFake(() => {
//        return Promise.resolve(mcQueryResponse);
//       });

//     ioService.queryIos(IoOption.AllInputs, 'all', false).then(() => {
//       let ios = ioService.getIos();
//       expect(ios.length).toBe(2, 'it should have two ios');
//       expect(ios[0].label).toBe('Omri', 'io has its own label');

//     });
//   });

//   /**
//    * getIos method test with the error response.
//    * It should return empty result if there is error in the query response.
//    */
//   it('io result should be empty if there is error in the query response', () => {
//     expect(ioService).toBeTruthy();

//     const spyValue = createMockIos();
//     const errFrame = createMockErrorFrame();
//     const mcQueryResponse = { result: spyValue, cmd: '', err: errFrame };

//     webSocketServiceSpy.query.and.callFake(() => {
//        return Promise.resolve(mcQueryResponse);
//       });

//     ioService.queryIos(IoOption.AllInputs, 'all', false).then(() => {
//       let ios = ioService.getIos();
//       expect(ios.length).toBe(0, 'there is no io');
//     });
//   });

//   /*********************************************************************************/

//   /**
//    * setIoByBit method test.
//    * Change the io output value by bit.
//    */
//   it('change io output value', () => {
//     expect(ioService).toBeTruthy();

//     const mcQueryResponse = { result: '', cmd: '', err: null };

//     webSocketServiceSpy.query.and.callFake(() => {
//        return Promise.resolve(mcQueryResponse);
//       });

//     ioService.setIoByBit(1, '1').then(() => {
//     });
//   });

//   /*********************************************************************************/

//   /**
//    * Create the mock custom io ports.
//    * @returns The mock custom io ports.
//    */
//   function createMockCustomIoPorts() {
//     return `{
//         "InputBit":[],
//         "InputByte":[],
//         "InputWord":[],
//         "OutputBit":[2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015],
//         "OutputByte":[2000,2008],
//         "OutputWord":[2000]
//       }`;
//   }

//   /**
//    * Create the mock custom io.
//    * @returns The mock custom io.
//    */
//   function createMockCustomIo() {
//     return `{"type":"Output Bit","port":2000,"value":"0","label":"1"}`;
//   }

//   /**
//    * Create the mock custom ios.
//    * @returns The mock custom ios.
//    */
//   function createMockCustomIos() {
//     return `[{"type":"Output Bit","port":2002,"value":"0","label":"1"},
//     {"type":"Output Bit","port":2000,"value":"0","label":"2"},
//     {"type":"Output Bit","port":2000,"value":"0","label":"3"}]`;
//   }

//   /**
//    * Create the mock ios.
//    * @returns The mock ios.
//    */
//   function createMockIos() {
//     return `[
//       {"index":0,"value":"0","label":"Omri"},
//       {"index":1,"value":"0","label":"Mirko"}
//     ]`;
//   }

//   /**
//    * Create the mock error frame.
//    * @returns The mock error frame.
//    */
//   function createMockErrorFrame() {
//     return {
//       errType : 'error',
//       errCode : 'error',
//       errMsg : 'error',
//       errTask : 'error',
//       errLine : 'error',
//       errModule  : 'error'
//     };
//   }

// });
