import { Injectable } from '@angular/core';

import {
  WebsocketService,
  MCQueryResponse
} from '../../core/services/websocket.service';

import { CustomIOType, IoOption, IoFormatOption,
  IoServiceCommand, HexValue, IoDirection, IoScope, CustomIoKey, IoKey
} from './io.service.enum';

/**
 * This interface is defined IO number, value and label.
 */
export interface IO {
  port: number;
  value: string;
  label: string;
}

export interface CustomIO {
  type: CustomIOType[];
  port: number[];
  selectedType: CustomIOType;
  selectedPort: number;
  value: string;
  label: string;
}

export interface CustomIOPort {
  key: string;
  port: number[];
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
   * The IO options.
   */
  private ioOptions: IoOption[] = [
    IoOption.AllInputs,
    IoOption.AllOutputs,
    IoOption.StandardInputs,
    IoOption.StandardOutputs
  ];

  /**
   * The IO value format option.
   */
  private ioFormatOption: IoFormatOption[] = [
    IoFormatOption.Bit,
    IoFormatOption.Byte,
    IoFormatOption.Word
  ];

  /**
   * The map between io option and query command parameters.
   */
  private ioOptionMap = new Map([
    [IoOption.AllInputs, { dio: IoDirection.Din, stdAll: IoScope.All }],
    [IoOption.AllOutputs, { dio: IoDirection.Dout, stdAll: IoScope.All }],
    [IoOption.StandardInputs, { dio: IoDirection.Din, stdAll: IoScope.Std }],
    [IoOption.StandardOutputs, { dio: IoDirection.Dout, stdAll: IoScope.Std }]
  ]);

  /**
   * The custom IO types.
   */
  private customIoTypes: CustomIOType[] = [
    CustomIOType.InputBit,
    CustomIOType.InputByte,
    CustomIOType.InputWord,
    CustomIOType.OutputBit,
    CustomIOType.OutputByte,
    CustomIOType.OutputWord
  ];

  /**
   * Constructor
   * @param ws The WebSocketService instance.
   */
  constructor(private ws: WebsocketService) {
  }

  /**
   * Get all the io options.
   */
  getIoOptions(): IoOption[] {
    return this.ioOptions.slice(0);
  }

  /**
   * Get all the io value format options.
   */
  getIoFormatOptions(): IoFormatOption[] {
    return this.ioFormatOption.slice(0);
  }

  /**
   * Get all the custom io types.
   */
  getCustomIoTypes(): CustomIOType[] {
    return this.customIoTypes.slice(0);
  }

  /**
   * Query the IO list by different condition parameters.
   * @param option IO option.
   * @param bitSize IO bit size.
   * @param hex whether the value is hex.
   */
  queryIos(option: IoOption, bitSize: string, hex: boolean) {
    let cmd = this.getQueryIOCommand(option, bitSize, hex);
    return this.send(cmd);
  }

  /**
   * Query the available ports of the custom IO.
   */
  queryCustomIoPorts() {
    let cmd = `${IoServiceCommand.QueryCustomIoPorts}`;

    return this.send(cmd);
  }

  /**
   * Query all custom IOs.
   * @param tableIndex The table index of the custom IO.
   * @param hex whether the value is hex.
   */
  queryCustomIos(tableIndex: number, hex: boolean) {
    let hexValue = hex ? HexValue.Hex : HexValue.Dec;
    let cmd = `${IoServiceCommand.QueryCustomIo}(${tableIndex}, "${hexValue}")`;

    return this.send(cmd);
  }

  /**
   * Add the custom IO.
   * @param tableIndex The table index of the modified custom IO.
   * @param selectType The selected type of the custom IO.
   * @param selectPort The selected port of the custom IO.
   * @param hex whether the value is hex.
   */
  addCustomIo(tableIndex: number, selectType: CustomIOType, selectPort: number, hex: boolean) {
    let hexValue = hex ? HexValue.Hex : HexValue.Dec;
    let values = selectType.trim().split(' ');
    let type = values[0] === 'Input' ? IoDirection.Din : IoDirection.Dout;
    let bitSize = values[1].trim().toLowerCase();
    let cmd = `${IoServiceCommand.AddCustomIo}(${tableIndex}, ${selectPort}, "${type}", "${bitSize}", "${hexValue}")`;
    return this.send(cmd);
  }

  /**
   * Modify the custom IO.
   * @param tableIndex The table index of the modified custom IO.
   * @param index The index of the modified custom IO.
   * @param selectType The selected type of the custom IO.
   * @param selectPort The selected port of the custom IO.
   * @param hex whether the value is hex.
   */
  modifyCustomIo(tableIndex: number, index: number, selectType: CustomIOType, selectPort: number, hex: boolean) {
    let hexValue = hex ? HexValue.Hex : HexValue.Dec;
    let values = selectType.trim().split(' ');
    let type = values[0] === 'Input' ? IoDirection.Din : IoDirection.Dout;
    let bitSize = values[1].trim().toLowerCase();
    let cmd = `${IoServiceCommand.ModifyCustomIo}(${tableIndex}, ${index}, ${selectPort}, "${type}", "${bitSize}", "${hexValue}")`;
    return this.send(cmd);
  }

  /**
   * Remove the custom IO.
   * @param tableIndex The table index of the modified custom IO.
   * @param index The index of the removed custom IO.
   */
  removeCustomIo(tableIndex: number, index: number) {
    let cmd = `${IoServiceCommand.RemoveCustomIo}(${tableIndex}, ${index})`;
    return this.send(cmd);
  }

  /**
   * Query the Custom Tab list by different command.
   */
  queryCustomTabs() {
    let cmd = `${IoServiceCommand.QueryCustomTab}`;
    return this.send(cmd);
  }

  /**
   * Set the tab value in mc library.
   * @param tabId The IO index.
   * @param tabName The IO value.
   */
  setCustomTabName(tabId: number, tabName: string) {
    let cmd = `${IoServiceCommand.SetCustomTabName}(${tabId}, "${tabName}")`;
    return this.send(cmd);
  }

  /**
   * Clear the table information in mc library.
   * @param tabId The IO index.
   */
  clearCustomTab(tabId: number) {
    let cmd = `${IoServiceCommand.ClearCustomTab}(${tabId})`;
    return this.send(cmd);
  }

  /**
   * Set the IO output value in bit format.
   * @param port The IO port.
   * @param value The IO value.
   */
  setIoByBit(port: number, value: string) {
    let cmd = `${IoServiceCommand.SetIoByBit}(${port}, ${value})`;
    return this.send(cmd);
  }

  /**
   * Get IOs from the query result.
   */
  getIos(): IO[] {
    if (this.result.length) {
      let jsonObject = JSON.parse(this.result);
      let array = [];
      for (let element of jsonObject) {
        array.push({
          port: element[IoKey.Index],
          value: element[IoKey.Value],
          label: element[IoKey.Label]
        });
      }
      return array;
    }
    return [];
  }

  /**
   * Get avaiable ports for all custom IOs.
   */
  getCustomIoPorts(): CustomIOPort {
    if (this.result.length) {
      return JSON.parse(this.result);
    }
    return null;
  }

  /**
   * Get single custom IO.
  * @param customIoTypes All available custom io types.
   */
  getCustomIo(customIoTypes: CustomIOType[]): CustomIO {
    if (this.result.length) {
      let element = JSON.parse(this.result);
      return {
        type: customIoTypes,
        port: element[CustomIoKey.PortOpt],
        selectedType: element[CustomIoKey.Type],
        selectedPort: element[CustomIoKey.Port],
        value: element[CustomIoKey.Value],
        label: element[CustomIoKey.Label]
      };
    }
    return null;
  }

  /**
   * Get all the customIOs.
   * @param customIoTypes All available custom io types.
   */
  getCustomIos(customIoTypes: CustomIOType[]): CustomIO[] {
    if (this.result.length) {
      let jsonObject = JSON.parse(this.result);
      let array = [];
      for (let element of jsonObject) {
        array.push({
          type: customIoTypes,
          port: element[CustomIoKey.PortOpt],
          selectedType: element[CustomIoKey.Type],
          selectedPort: element[CustomIoKey.Port],
          value: element[CustomIoKey.Value],
          label: element[CustomIoKey.Label]
        });
      }
      return array;
    }
    return [];
  }

  /**
   * Get all custom tabs from the query result.
   */
  getCustomTabs() {
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
  private getQueryIOCommand(option: IoOption, bitSize: string, hex: boolean): string {
    let dio = IoDirection.Din;
    let stdall = IoScope.All;

    if (this.ioOptionMap.has(option)) {
      dio = this.ioOptionMap.get(option).dio;
      stdall = this.ioOptionMap.get(option).stdAll;
    }

    let hexValue = hex ? HexValue.Hex : HexValue.Dec;

    return `${IoServiceCommand.QueryIO}("${dio}", "${stdall}", "${bitSize}", "${hexValue}")`;
  }
}
