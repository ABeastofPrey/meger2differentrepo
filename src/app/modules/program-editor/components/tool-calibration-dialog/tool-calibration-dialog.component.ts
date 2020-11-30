import { TPVariable } from './../../../core/models/tp/tp-variable.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/portal';
import { WebsocketService, DataService, MCQueryResponse } from '../../../core';

import { ToolCalibrationResultDialogComponent } from '../tool-calibration-result-dialog/tool-calibration-result-dialog.component';

@Component({
  selector: 'app-tool-calibration-dialog',
  templateUrl: './tool-calibration-dialog.component.html',
  styleUrls: ['./tool-calibration-dialog.component.scss'],
})
export class ToolCalibrationDialogComponent implements OnInit {
  varName: string;
  pointsAdded = 0;
  maxPoints = 4;
  isScara = false;

  private _singlePointStepTwo = false;
  get singlePointStepTwo() {
    return this._singlePointStepTwo;
  }

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ToolCalibrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      variable: TPVariable
    },
    private ws: WebsocketService,
    public dataService: DataService,
    private snack: MatSnackBar
  ) {
    this.varName = this.data.variable.name;
    if (this.data.variable.isArr) {
      this.varName += '[' + this.data.variable.selectedIndex + ']';
    }
    this.calibType = 'MULTIPLE_POINTS';
  }

  ngOnInit() {
    const cmd = '?TP_GET_NEEDED_CALIBRATION_POINTS';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.maxPoints = Number(ret.result) || 4;
    });

    this.isScara = this.dataService.robotType === 'SCARA';
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private _calibType: string = null;
  get calibType() {
    return this._calibType;
  }
  set calibType(newType: string) {
    const oldType = this._calibType;
    this._calibType = newType;
    this.ws
      .query('?TP_TOOL_CALIBRATION_TYPE("' + newType + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this._calibType = oldType;
        }
      });
  }

  addPoint() {
    this.ws
      .query('?TP_CALIBRATE_POINT(' + (this.pointsAdded + 1) + ')')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') return;
        this.pointsAdded++;
      });
  }

  removePoint() {
    this.ws
      .query('?TP_REMOVE_CALIBRATION_POINT(' + this.pointsAdded + ')')
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') return;
        if (this.pointsAdded > 0) this.pointsAdded--;
      });
  }

  clearCalibrationPoints() {
    this.ws.send('?TP_REMOVE_CALIBRATION_POINT(1)', true);
    this.pointsAdded = 0;
  }

  calibrate(multi: boolean) {
    const cmd = '?TP_TOOL_CALIBRATION("' + this.varName + '")';

    const dialog = ToolCalibrationResultDialogComponent;

    if (multi || this._singlePointStepTwo) {
      this.ws.query(cmd).then(successRes => {
        if (successRes.result === '0') {
          const ref = this.dialog.open(dialog, {
            width: '500px',
            minHeight: '600px',
            data: {
              toolName: this.varName,
            },
            backdropClass: 'static',
            disableClose: true,
          });

          ref.afterClosed().subscribe(result => {
            if (result.apply && successRes.result === '0') {
              this.dialogRef.close();
              if (result.setAsCurrent) {
                this.dataService._selectedTool = this.varName;
              }
              this._singlePointStepTwo = false;
              this.pointsAdded = 0;
            }
          });
        }
      });
    } else if (!multi) {
      // SINGLE POINT CALIBRATION STEP 1

      this.ws
        .query('?TP_SET_CALIBRATION_LOCATION')
        .then((ret: MCQueryResponse) => {
          if (ret.err || ret.result !== '0') {
            return;
          }
          this._singlePointStepTwo = true;
        });
    }
  }
}
