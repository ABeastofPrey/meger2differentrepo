import { Component, OnInit, Inject } from '@angular/core';
import {
  MatTableDataSource,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material';
import { WebsocketService, MCQueryResponse } from '../../../core';

import {
  CalibratedResultKey,
  CalibrationCommand,
  CalibrationResultTableColumn,
  CalibrationMessage,
} from './tool-calibration-result-dialog.enum';

@Component({
  selector: 'app-tool-calibration-result-dialog',
  templateUrl: './tool-calibration-result-dialog.component.html',
  styleUrls: ['./tool-calibration-result-dialog.component.css'],
})
/**
 * This class describes the logics to the tool calibration result dialog.
 */
export class ToolCalibrationResultDialogComponent implements OnInit {
  /**
   * The columns of the tool calibration result table.
   */
  resultDisplayedColumns: CalibrationResultTableColumn[] = [
    CalibrationResultTableColumn.Axis,
    CalibrationResultTableColumn.Unit,
    CalibrationResultTableColumn.Current,
    CalibrationResultTableColumn.New,
    CalibrationResultTableColumn.Delta,
  ];

  /**
   * The instance reference to CalibrationResultTableColumn enum.
   */
  CalibrationTableColumnReference = CalibrationResultTableColumn;

  /**
   * The instance reference to CalibrationMessage enum.
   */
  calibrationMessageReference = CalibrationMessage;

  /**
   * The data source of the tool calibration result table.
   */
  calibrationResultSource: MatTableDataSource<CalibrationAxis>;

  /**
   * The tool name.
   */
  toolName: string;

  /**
   * The flag to show whether the tool calibration is in the delta scope.
   */
  calibrationOutOfScope: boolean;

  /**
   * The standard delta to the tool calibration.
   */
  private readonly calibrationDelta = 5.0;

  /**
   * Constructor.
   * @param dialogRef The tool calibration dialog reference.
   * @param data The input data to the dialog.
   * @param ws The WebsocketService instance.
   */
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ws: WebsocketService
  ) {
    this.calibrationResultSource = new MatTableDataSource([]);
    this.toolName = this.data.toolName;

    this.initialize();
  }

  ngOnInit() {}

  /**
   *  The handler when the user clicks the apply button.
   */
  onApply() {
    this.ws
      .query(
        CalibrationCommand.ApplyCalibrationOnTool + '("' + this.toolName + '")'
      )
      .then((cmdRes: MCQueryResponse) => {
        this.dialogRef.close(true);
      });
  }

  /**
   * The handler when the user clicks the cancel button.
   */
  onCancel() {
    this.dialogRef.close(false);
  }

  /**
   * Initialize the dialog.
   */
  private initialize() {
    let array = [];

    this.ws
      .query(CalibrationCommand.GetCalibrationResult)
      .then((calibratedRes: MCQueryResponse) => {
        array = this.getCalibrationResult(calibratedRes.result);

        this.calibrationResultSource.data = array;

        this.calibrationOutOfScope =
          array[array.length - 1].new > this.calibrationDelta;
      });
  }

  /**
   * Get the tool calibration result.
   * @param result The result from the tool calibration query.
   * @returns All the tool calibration axis values.
   */
  private getCalibrationResult(result: string): CalibrationAxis[] {
    if (result.length) {
      let jsonObject = JSON.parse(result);

      let toolValueArray = jsonObject[CalibratedResultKey.ToolValue]
        .match(/[\d.-]+/g)
        .map(Number);

      let calibrationValueArray = [];
      let calibrationValue = jsonObject[CalibratedResultKey.CalibrationValue];

      for (let index = 0; index < calibrationValue.length; index++) {
        let element = calibrationValue[index];
        calibrationValueArray.push({
          name: element[CalibratedResultKey.Name],
          unit: element[CalibratedResultKey.Unit],
          current: index < toolValueArray.length ? toolValueArray[index] : null,
          new:
            index > 1 && index < toolValueArray.length
              ? toolValueArray[index]
              : element[CalibratedResultKey.New],
          delta:
            index < toolValueArray.length
              ? element[CalibratedResultKey.New] - toolValueArray[index]
              : null,
        });
      }

      return calibrationValueArray;
    }
    return [];
  }
}

/**
 * The interface to define the data structure of tool calibration.
 */
export interface CalibrationAxis {
  name: string;
  unit: string;
  current: number;
  new: number;
  delta: number;
}

/**
 * The class to define the data structure of teach pendant status.
 */
class TPStatResponse {
  ENABLE: number;
  MOVING: number;
  SETTELED: number;
  ERRMESSAGE: string;
  VRATE: number;
  BIP: number;
  REFRESH: number;
  DEADMAN: number;
  SWITCH: string;
  CART_REACH: number;
}
