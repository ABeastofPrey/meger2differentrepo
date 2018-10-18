/**
 * The IO option enum.
 */
export enum IoOption {
  AllInputs = 'All Inputs',
  AllOutputs = 'All Outputs',
  StandardInputs = 'Standard Inputs',
  StandardOutputs = 'Standard Outputs'
}

/**
 * The IO format option enum.
 */
export enum IoFormatOption {
  Bit = 'bit',
  Byte = 'byte',
  Word = 'word'
}

/**
 * The custom IO type enum.
 */
export enum CustomIOType {
  InputBit = 'Input Bit',
  InputByte = 'Input Byte',
  InputWord  = 'Input Word',
  OutputBit = 'Output Bit',
  OutputByte = 'Output Byte',
  OutputWord = 'Output Word'
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
  ClearCustomTab = 'clearTable'
}

/**
 * The hex value enum.
 */
export enum HexValue {
  Hex = 'hex',
  Dec = 'dec'
}

/**
 * The IO direction enum.
 */
export enum IoDirection {
  Din = 'din',
  Dout = 'dout'
}

/**
 * The IO scope enum.
 */
export enum IoScope {
  All = 'all',
  Std = 'std'
}

/**
 * The IO key enum.
 */
export enum IoKey {
  Index = 'index',
  Value = 'value',
  Label = 'label'
}

/**
 * The custom IO enum.
 */
export enum CustomIoKey {
  PortOpt = 'portopt',
  Type = 'type',
  Port = 'port',
  Value = 'value',
  Label = 'label'
}

/**
 * The IO table column enum.
 */
export enum IoTableColumn {
  Port = 'port',
  Value = 'value',
  Label = 'label',
  Type = 'type',
  Status = 'status'
}
