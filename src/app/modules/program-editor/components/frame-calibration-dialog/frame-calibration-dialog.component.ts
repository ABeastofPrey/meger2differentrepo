import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { WebsocketService, DataService, MCQueryResponse } from '../../../core';

@Component({
  selector: 'app-frame-calibration-dialog',
  templateUrl: './frame-calibration-dialog.component.html',
  styleUrls: ['./frame-calibration-dialog.component.css'],
})
export class FrameCalibrationDialogComponent implements OnInit {
  varName: string;
  positionOK: boolean[] = [false, false, false];
  setAsCurrent: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ws: WebsocketService,
    public dataService: DataService
  ) {
    this.varName = this.data.variable.name;
    if (this.data.variable.isArr)
      this.varName += '[' + this.data.variable.selectedIndex + ']';
  }

  ngOnInit() {}

  closeDialog() {
    this.dialogRef.close();
  }

  resetPos(i: number) {
    if (i < 0 || i > 2) return;
    this.positionOK[i] = false;
  }

  teach(pos: number) {
    let cmd =
      '?TP_FRAME_CALIBRATION_TEACH("' + this.data.frameType + '",' + pos + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.positionOK[pos - 1] = ret.result === '0';
    });
  }

  calibrate() {
    let cmd =
      '?TP_FRAME_CALIBRATION("' +
      this.data.frameType +
      '","' +
      this.varName +
      '",1)';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        if (this.setAsCurrent) {
          switch (this.data.frameType) {
            case 'BASE':
              this.dataService.selectedBase = this.varName;
              break;
            case 'MACHINETABLE':
              this.dataService.selectedMachineTable = this.varName;
              break;
            case 'WORKPIECE':
              this.dataService.selectedWorkPiece = this.varName;
              break;
          }
        }
        this.closeDialog();
      }
    });
  }
}
