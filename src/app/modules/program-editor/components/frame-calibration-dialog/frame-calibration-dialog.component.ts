import { YesNoDialogComponent } from './../../../../components/yes-no-dialog/yes-no-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CoordinatesService } from './../../../core/services/coordinates.service';
import { TPVariable } from './../../../core/models/tp/tp-variable.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { WebsocketService, DataService, MCQueryResponse } from '../../../core';

@Component({
  selector: 'app-frame-calibration-dialog',
  templateUrl: './frame-calibration-dialog.component.html',
  styleUrls: ['./frame-calibration-dialog.component.css'],
})
export class FrameCalibrationDialogComponent implements OnInit {

  varName: string;
  positionOK: boolean[] = [false, false, false];
  teachVal: string[] = [null, null, null];
  setAsCurrent = true;

  private words: {};

  constructor(
    private dialog: MatDialog,
    private trn: TranslateService,
    public dialogRef: MatDialogRef<FrameCalibrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      variable: TPVariable,
      frameType: string
    },
    private ws: WebsocketService,
    public dataService: DataService,
    private coos: CoordinatesService
  ) {
    this.varName = this.data.variable.name;
    if (this.data.variable.isArr) {
      this.varName += '[' + this.data.variable.selectedIndex + ']';
    }
  }

  ngOnInit() {
    this.trn.get('frames.calibration.dialog_close').subscribe(word=>{
      this.words = word;
    });
  }

  closeDialog() {
    this.dialog.open(YesNoDialogComponent, {
      maxWidth: '600px',
      data: {
        title: this.words['title'],
        msg: this.words['msg'],
        yes: this.words['yes'],
        no: this.words['no'],
        caution: true
      },
    }).afterClosed().subscribe(ret => {
      if (ret) {
        this.dialogRef.close();
      }
    });
  }

  resetPos(i: number) {
    if (i < 0 || i > 2) return;
    this.positionOK[i] = false;
  }

  async teach(pos: number) {
    const cmd = '?TP_FRAME_CALIBRATION_TEACH("' + this.data.frameType + '",' + pos + ')';
    const ret = await this.ws.query(cmd);
    const resultPosition = await this.ws.query(`?TP_GET_CALIBRATION_TEACH_POINT("${this.data.frameType}",${pos})`);
    if (pos === 4) pos = 3;
    this.positionOK[pos - 1] = ret.result === '0';
    this.teachVal[pos - 1] = resultPosition.result;
  }

  calibrate() {
    const cmd =
      '?TP_FRAME_CALIBRATION("' +
      this.data.frameType +
      '","' +
      this.varName +
      '",' + (this.setAsCurrent ? 1 : 0) + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        if (this.setAsCurrent) {
          switch (this.data.frameType.toUpperCase()) {
            default:
              break;
            case 'BASE':
              this.dataService._selectedBase = this.varName;
              break;
            case 'MT':
              this.dataService._selectedMachineTable = this.varName;
              break;
            case 'WP':
              this.dataService._selectedWorkPiece = this.varName;
              break;
          }
        }
        this.dialogRef.close();
      }
    });
  }
}
