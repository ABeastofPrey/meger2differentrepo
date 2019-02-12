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
    IoOption.DriveIoInputs,
    IoOption.DriveIoOutputs,
    IoOption.UserIoInputs,
    IoOption.UserIoOutputs
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
    [IoOption.AllInputs, { dio: IoDirection.Din, ioScope: IoScope.All }],
    [IoOption.AllOutputs, { dio: IoDirection.Dout, ioScope: IoScope.All }],
    [IoOption.DriveIoInputs, { dio: IoDirection.Din, ioScope: IoScope.Drv }],
    [IoOption.DriveIoOutputs, { dio: IoDirection.Dout, ioScope: IoScope.Drv }],
    [IoOption.UserIoInputs, { dio: IoDirection.Din, ioScope: IoScope.Usr }],
    [IoOption.UserIoOutputs, { dio: IoDirection.Dout, ioScope: IoScope.Usr }],
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
   * @returns All io options.
   */
  getIoOptions(): IoOption[] {
    return this.ioOptions.slice(0);
  }

  /**
   * Get all the io value format options.
   * @returns All io format options.
   */
  getIoFormatOptions(): IoFormatOption[] {
    return this.ioFormatOption.slice(0);
  }

  /**
   * Get all the custom io types.
   * @returns All custom io types.
   */
  getCustomIoTypes(): CustomIOType[] {
    return this.customIoTypes.slice(0);
  }

  /**
   * Query the IO list by different condition parameters.
   * @param option IO option.
   * @param bitSize IO bit size.
   * @param hex whether the value is hex.
   * @returns One promise instance contains query command.
   */
  queryIos(option: IoOption, bitSize: string, hex: boolean) {
    let cmd = this.getQueryIOCommand(option, bitSize, hex);
    return this.send(cmd);
  }

  /**
   * Query the available ports of the custom IO.
   * @returns One promise instance contains query command.
   */
  queryCustomIoPorts() {
    let cmd = `${IoServiceCommand.QueryCustomIoPorts}`;

    return this.send(cmd);
  }

  /**
   * Query all custom IOs.
   * @param tableIndex The table index of the custom IO.
   * @param hex whether the value is hex.
   * @returns One promise instance contains query command.
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
   * @returns One promise instance contains add command.
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
   * @returns One promise instance contains modification command.
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
   * @returns One promise instance contains removing command.
   */
  removeCustomIo(tableIndex: number, index: number) {
    let cmd = `${IoServiceCommand.RemoveCustomIo}(${tableIndex}, ${index})`;
    return this.send(cmd);
  }

  /**
   * Query the Custom Tab list by different command.
   * @returns One promise instance contains query command.
   */
  queryCustomTabs() {
    let cmd = `${IoServiceCommand.QueryCustomTab}`;
    return this.send(cmd);
  }

  /**
   * Set the tab value in mc library.
   * @param tabId The IO index.
   * @param tabName The IO value.
   * @returns One promise instance contains set command.
   */
  setCustomTabName(tabId: number, tabName: string) {
    let cmd = `${IoServiceCommand.SetCustomTabName}(${tabId}, "${tabName}")`;
    return this.send(cmd);
  }

  /**
   * Clear the table information in mc library.
   * @param tabId The IO index.
   * @returns One promise instance contains clear command.
   */
  clearCustomTab(tabId: number) {
    let cmd = `${IoServiceCommand.ClearCustomTab}(${tabId})`;
    return this.send(cmd);
  }

  /**
   * Set the IO output value in bit format.
   * @param port The IO port.
   * @param value The IO value.
   * @returns One promise instance contains set command.
   */
  setIoByBit(port: number, value: string) {
    let cmd = `${IoServiceCommand.SetIoByBit}(${port}, ${value})`;
    return this.send(cmd);
  }

  /**
   * Get IOs from the query result.
   * @returns All IO values.
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
   * Get available ports for all custom IOs.
   * @returns All available custom IO ports.
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
   * @param customIoPorts All available custom io ports.
   * @returns The custom IO value.
   */
  getCustomIo(customIoTypes: CustomIOType[], customIoPorts: CustomIOPort): CustomIO {
    if (this.result.length) {
      let element = JSON.parse(this.result);
      let key = element[CustomIoKey.Type].replace(/\s/g, '');
      return {
        type: customIoTypes,
        port: customIoPorts[key],
        selectedType: element[CustomIoKey.Type],
        selectedPort: Number(element[CustomIoKey.Port]),
        value: element[CustomIoKey.Value],
        label: element[CustomIoKey.Label]
      };
    }
    return null;
  }

  /**
   * Get all the customIOs.
   * @param customIoTypes All available custom io types.
   * @param customIoPorts All available custom io ports.
   * @returns All the custom IO values.
   */
  getCustomIos(customIoTypes: CustomIOType[], customIoPorts: CustomIOPort): CustomIO[] {
    if (this.result.length) {
      let jsonObject = JSON.parse(this.result);
      let array = [];
      for (let element of jsonObject) {
        let key = element[CustomIoKey.Type].replace(/\s/g, '');
        array.push({
          type: customIoTypes,
          port: customIoPorts[key],
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
   * Get all custom IO tabs from the query result.
   * @returns All custom IO tabs.
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
    let ioScope = IoScope.All;

    if (this.ioOptionMap.has(option)) {
      dio = this.ioOptionMap.get(option).dio;
      ioScope = this.ioOptionMap.get(option).ioScope;
    }

    let hexValue = hex ? HexValue.Hex : HexValue.Dec;

    return `${IoServiceCommand.QueryIO}("${dio}", "${ioScope}", "${bitSize}", "${hexValue}")`;
  }
}
