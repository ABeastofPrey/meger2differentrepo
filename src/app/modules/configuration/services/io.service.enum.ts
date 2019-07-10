/**
 * The IO option enum.
 */
export enum IoOptions {
  AllInputs = 'All Inputs',
  AllOutputs = 'All Outputs',
  DriveIoInputs = 'Drive IO Inputs',
  DriveIoOutputs = 'Drive IO Outputs',
  UserIoInputs = 'User IO Inputs',
  UserIoOutputs = 'User IO Outputs',
}

/**
 * The interface of IO option.
 */
export interface IoOption {
  key: IoOptions;
  value: string;
}

/**
 * The IO format option enum.
 */
export enum IoFormatOptions {
  Bit = 'bit',
  Byte = 'byte',
  Word = 'word',
}

/**
 * The interface of IO format option.
 */
export interface IoFormatOption {
  key: IoFormatOptions;
  value: string;
}

/**
 * The custom IO type enum.
 */
export enum CustomIOTypes {
  InputBit = 'Input Bit',
  InputByte = 'Input Byte',
  InputWord = 'Input Word',
  OutputBit = 'Output Bit',
  OutputByte = 'Output Byte',
  OutputWord = 'Output Word',
}

/**
 * The interface of custom IO type.
 */
export interface CustomIOType {
  key: CustomIOTypes;
  value: string;
}

/**
 * The IoService command enum.
 */
export enum IoServiceCommand {
  QueryIO = '?getIOList',
  SetIoByBit = 'setDoBit',
  QueryCustomIoPorts = '?getAllPortList',
  QueryCustomIo = '?getCustomizedIOList',
  AddCustomIo = '?addItem',
  ModifyCustomIo = '?modifyItem',
  RemoveCustomIo = 'removeItem',
  QueryCustomTab = '?getTableName',
  SetCustomTabName = 'setTableName',
  ClearCustomTab = 'clearTable',
}

/**
 * The hex value enum.
 */
export enum HexValue {
  Hex = 'hex',
  Dec = 'dec',
}

/**
 * The IO direction enum.
 */
export enum IoDirection {
  Din = 'din',
  Dout = 'dout',
}

/**
 * The IO scope enum.
 */
export enum IoScope {
  All = 'all',
  Drv = 'drv',
  Usr = 'usr',
}

/**
 * The IO key enum.
 */
export enum IoKey {
  Index = 'index',
  Value = 'value',
  Label = 'label',
}

/**
 * The custom IO enum.
 */
export enum CustomIoKey {
  PortOpt = 'portopt',
  Type = 'type',
  Port = 'port',
  Value = 'value',
  Label = 'label',
}

/**
 * The IO table column enum.
 */
export enum IoTableColumn {
  Port = 'port',
  Value = 'value',
  Label = 'label',
  Type = 'type',
  Status = 'status',
}
