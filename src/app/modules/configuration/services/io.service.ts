import { Injectable } from '@angular/core';

import {
  WebsocketService,
  MCQueryResponse
} from '../../core/services/websocket.service';

/**
 * This interface is defined IO number, value and label.
 */
export interface IO {
  index: number;
  value: string;
  label: string;
}

/**
 * This service is used to get and set IO values.
 */
@Injectable()
export class IoService {
  /**
   * The result of the query command.
   */
  private result = '';

  /**
   * The command to get io list.
   */
  private queryFunction: string = '?getIOList';

  /**
   * The command to set io value by bit.
   */
  private setBitFunction: string = 'setDoBit';

  /**
   * The IO options.
   */
  private ioOptions: string[] = [
    'All Inputs',
    'All Outputs',
    'Standard Inputs',
    'Standard Outputs'
  ];

  /**
   * The IO value format option.
   */
  private ioFormatOption: string[] = ['bit', 'byte', 'word'];

  /**
   * The map between io option and query command parameters.
   */
  private ioOptionMap = new Map([
    ['All Inputs' , {dio: 'din', stdAll: 'all'}],
    ['All Outputs' , {dio: 'dout', stdAll: 'all'}],
    ['Standard Inputs' , {dio: 'din', stdAll: 'std'}],
    ['Standard Outputs' , {dio: 'dout', stdAll: 'std'}]
  ]);

  /**
   * Constructor
   * @param ws The WebSocketService instance.
   */
  constructor(private ws: WebsocketService) {
  }

  /**
   * Get all the io options.
   */
  getIoOptions(): string[] {
    return this.ioOptions.slice(0);
  }

  /**
   * Get all the io value format options.
   */
  getIoFormatOptions(): string[] {
    return this.ioFormatOption.slice(0);
  }

  /**
   * Query the IO list by different condition parameters.
   * @param option IO option.
   * @param bitSize IO bit size.
   * @param hex whether the value is hex.
   */
  query(option: string, bitSize: string, hex: boolean) {
    let cmd = this.getQueryCommand(option, bitSize, hex);
    return this.send(cmd);
  }

  /**
   * Set the IO output value in bit format.
   * @param index The IO index.
   * @param value The IO value.
   */
  setIoByBit(index: number, value: string) {
    let cmd = `${this.setBitFunction}(${index}, ${value})`;
    return this.send(cmd);
  }

  /**
   * Get IOs from the query result.
   */
  getIos(): IO[] {
    if (this.result.length) {
      return JSON.parse(this.result);
    }
     return [];
  }

  /**
   * Send the query command to the controller.
   * @param cmd Query command.
   */
 private send(cmd: string) {
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.result = '';

      if (ret.err) {
        return;
      }

      this.result = ret.result;
    });
  }

  /**
   * Get the query command by different condition parameters.
   * @param option IO option.
   * @param bitSize IO bit size.
   * @param hex Whether the value is hex.
   */
  private getQueryCommand(option: string, bitSize: string, hex: boolean): string {
    let dio = 'din';
    let stdall = 'all';
    let hexValue: string;

    if (this.ioOptionMap.has(option)) {
      dio = this.ioOptionMap.get(option).dio;
      stdall = this.ioOptionMap.get(option).stdAll;
    }

    hexValue = hex ? 'hex' : 'dec';

    return `${this.queryFunction}("${dio}", "${stdall}", "${bitSize}", "${hexValue}")`;
  }
}
