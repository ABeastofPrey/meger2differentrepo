import { Injectable } from '@angular/core';

import {
  WebsocketService,
  MCQueryResponse,
} from '../../core/services/websocket.service';

import {
  CustomIOType,
  IoOptions,
  IoServiceCommand,
  HexValue,
  IoDirection,
  IoScope,
  CustomIoKey,
  IoKey,
} from './io.service.enum';

/**
 * This interface defines IO.
 */
export interface IO {
  port: number;
  value: string;
  label: string;
}

/**
 * This interface defines custom IO.
 */
export interface CustomIO {
  type: CustomIOType[];
  port: number[];
  selectedType: CustomIOType;
  selectedPort: number;
  value: string;
  label: string;
}

/**
 * This interface defines IO port.
 */
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
   * The map between io option and query command parameters.
   */
  private ioOptionMap = new Map<IoOptions, {dio: IoDirection, ioScope: IoScope}>([
    [IoOptions.AllInputs, { dio: IoDirection.Din, ioScope: IoScope.All }],
    [IoOptions.AllOutputs, { dio: IoDirection.Dout, ioScope: IoScope.All }],
    [IoOptions.DriveIoInputs, { dio: IoDirection.Din, ioScope: IoScope.Drv }],
    [IoOptions.DriveIoOutputs, { dio: IoDirection.Dout, ioScope: IoScope.Drv }],
    [IoOptions.UserIoInputs, { dio: IoDirection.Din, ioScope: IoScope.Usr }],
    [IoOptions.UserIoOutputs, { dio: IoDirection.Dout, ioScope: IoScope.Usr }],
  ]);

  /**
   * Constructor
   * @param ws The WebSocketService instance.
   */
  constructor(private ws: WebsocketService) {}

  /**
   * Query the IO list by different condition parameters.
   * @param option IO option.
   * @param bitSize IO bit size.
   * @param hex whether the value is hex.
   * @returns One promise instance contains query command.
   */
  queryIos(option: IoOptions, bitSize: string, hex: boolean) {
    const cmd = this.getQueryIOCommand(option, bitSize, hex);
    return this.send(cmd);
  }

  /**
   * Query the available ports of the custom IO.
   * @returns One promise instance contains query command.
   */
  queryCustomIoPorts() {
    const cmd = `${IoServiceCommand.QueryCustomIoPorts}`;

    return this.send(cmd);
  }

  /**
   * Query all custom IOs.
   * @param tableIndex The table index of the custom IO.
   * @param hex whether the value is hex.
   * @returns One promise instance contains query command.
   */
  queryCustomIos(tableIndex: number, hex: boolean) {
    const hexValue = hex ? HexValue.Hex : HexValue.Dec;
    const cmd = `${IoServiceCommand.QueryCustomIo}(${tableIndex}, "${hexValue}")`;

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
  addCustomIo(
    tableIndex: number,
    selectType: CustomIOType,
    selectPort: number,
    hex: boolean
  ) {
    const hexValue = hex ? HexValue.Hex : HexValue.Dec;
    const values = selectType.key.trim().split(' ');
    const type = values[0] === 'Input' ? IoDirection.Din : IoDirection.Dout;
    const bitSize = values[1].trim().toLowerCase();
    const cmd = `${IoServiceCommand.AddCustomIo}(${tableIndex}, ${selectPort}, "${type}", "` + 
                `${bitSize}", "${hexValue}")`;
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
  modifyCustomIo(
    tableIndex: number,
    index: number,
    selectType: CustomIOType,
    selectPort: number,
    hex: boolean
  ) {
    const hexValue = hex ? HexValue.Hex : HexValue.Dec;
    const values = selectType.key.trim().split(' ');
    const type = values[0] === 'Input' ? IoDirection.Din : IoDirection.Dout;
    const bitSize = values[1].trim().toLowerCase();
    const cmd = `${IoServiceCommand.ModifyCustomIo}(${tableIndex}, ${index}, ${selectPort}, "` +
                `${type}", "${bitSize}", "${hexValue}")`;
    return this.send(cmd);
  }

  /**
   * Remove the custom IO.
   * @param tableIndex The table index of the modified custom IO.
   * @param index The index of the removed custom IO.
   * @returns One promise instance contains removing command.
   */
  removeCustomIo(tableIndex: number, index: number) {
    const cmd = `${IoServiceCommand.RemoveCustomIo}(${tableIndex}, ${index})`;
    return this.send(cmd);
  }

  /**
   * Query the Custom Tab list by different command.
   * @returns One promise instance contains query command.
   */
  queryCustomTabs() {
    const cmd = `${IoServiceCommand.QueryCustomTab}`;
    // return this.send(cmd);
    return new Promise(resolve => {
      this.ws.isConnected.subscribe(connected => {
        if (!connected) return;
        this.send(cmd).then(() => {
          resolve();
        });
      });
    });
  }

  /**
   * Set the tab value in mc library.
   * @param tabId The IO index.
   * @param tabName The IO value.
   * @returns One promise instance contains set command.
   */
  setCustomTabName(tabId: number, tabName: string) {
    const cmd = `${IoServiceCommand.SetCustomTabName}(${tabId}, "${tabName}")`;
    return this.send(cmd);
  }

  /**
   * Clear the table information in mc library.
   * @param tabId The IO index.
   * @returns One promise instance contains clear command.
   */
  clearCustomTab(tabId: number) {
    const cmd = `${IoServiceCommand.ClearCustomTab}(${tabId})`;
    return this.send(cmd);
  }

  /**
   * Set the IO output value in bit format.
   * @param port The IO port.
   * @param value The IO value.
   * @returns One promise instance contains set command.
   */
  setIoByBit(port: number, value: string) {
    const cmd = `${IoServiceCommand.SetIoByBit}(${port}, ${value})`;
    return this.send(cmd);
  }

  /**
   * Get IOs from the query result.
   * @returns All IO values.
   */
  getIos(): IO[] {
    if (this.result.length) {
      const jsonObject = JSON.parse(this.result);
      const array = [];
      for (const element of jsonObject) {
        array.push({
          port: element[IoKey.Index],
          value: element[IoKey.Value],
          label: element[IoKey.Label],
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
  getCustomIo(
    customIoTypes: CustomIOType[],
    customIoPorts: CustomIOPort
  ): CustomIO {
    if (this.result.length) {
      const element = JSON.parse(this.result);
      const key = element[CustomIoKey.Type].replace(/\s/g, '');

      let typeValue = null;
      for (const type of customIoTypes) {
        if (element[CustomIoKey.Type] === type.key) {
          typeValue = type.value;
          break;
        }
      }

      return {
        type: customIoTypes,
        port: customIoPorts[key],
        selectedType: { key: element[CustomIoKey.Type], value: typeValue },
        selectedPort: Number(element[CustomIoKey.Port]),
        value: element[CustomIoKey.Value],
        label: element[CustomIoKey.Label],
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
  getCustomIos(
    customIoTypes: CustomIOType[],
    customIoPorts: CustomIOPort
  ): CustomIO[] {
    if (this.result.length) {
      const jsonObject = JSON.parse(this.result);
      const array = [];
      for (const element of jsonObject) {
        const key = element[CustomIoKey.Type].replace(/\s/g, '');

        let typeValue = null;
        for (const type of customIoTypes) {
          if (element[CustomIoKey.Type] === type.key) {
            typeValue = type.value;
            break;
          }
        }

        array.push({
          type: customIoTypes,
          port: customIoPorts[key],
          selectedType: { key: element[CustomIoKey.Type], value: typeValue },
          selectedPort: element[CustomIoKey.Port],
          value: element[CustomIoKey.Value],
          label: element[CustomIoKey.Label],
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
  private getQueryIOCommand(
    option: IoOptions,
    bitSize: string,
    hex: boolean
  ): string {
    let dio = IoDirection.Din;
    let ioScope = IoScope.All;

    if (this.ioOptionMap.has(option)) {
      dio = this.ioOptionMap.get(option).dio;
      ioScope = this.ioOptionMap.get(option).ioScope;
    }

    const hexValue = hex ? HexValue.Hex : HexValue.Dec;

    return `${IoServiceCommand.QueryIO}("${dio}", "${ioScope}", "${bitSize}", "${hexValue}")`;
  }
}
