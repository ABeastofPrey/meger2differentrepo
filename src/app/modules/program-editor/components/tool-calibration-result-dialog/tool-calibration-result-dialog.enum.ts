export enum CalibrationMessage {
  CalibrationResult = 'Calibration Result',
  CalibrationSuccess = 'Calibration Success.',
  IsApplyDataToTool = 'Do you want to apply the following tool data for Tool',
  ResultOutOfScope = 'The calculation error exceeds the allowed 5mm limit.\nUsing this tool data can lead to undesirable behavior.',
}

/**
 * The enum to the tool calibration command.
 */
export enum CalibrationCommand {
  GetCalibrationResult = '?TP_TOOL_getResult',
  ApplyCalibrationOnTool = '?TP_TOOL_applyCalibration',
}

/**
 * The enum to the tool calibration result table column.
 */
export enum CalibrationResultTableColumn {
  Axis = 'axis',
  Unit = 'unit',
  Current = 'current',
  New = 'new',
  Delta = 'delta',
}

/**
 * The enum to the tool calibration result key.
 */
export enum CalibratedResultKey {
  Name = 'name',
  Unit = 'unit',
  Current = 'current',
  New = 'new',
  Delta = 'delta',
  ToolValue = 'cur',
  CalibrationValue = 'tab',
}
