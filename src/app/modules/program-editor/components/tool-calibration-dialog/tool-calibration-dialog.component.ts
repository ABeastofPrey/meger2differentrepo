import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import {WebsocketService, DataService, MCQueryResponse} from '../../../core';

@Component({
  selector: 'app-tool-calibration-dialog',
  templateUrl: './tool-calibration-dialog.component.html',
  styleUrls: ['./tool-calibration-dialog.component.css']
})
export class ToolCalibrationDialogComponent implements OnInit {
  
  varName : string;
  pointsAdded : number = 0;
  maxPoints: number = 4;
  
  private _singlePointStepTwo : boolean = false;
  get singlePointStepTwo() {return this._singlePointStepTwo;}

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ws : WebsocketService,
    public dataService : DataService,
    private snack : MatSnackBar
  ) {
    this.varName = this.data.variable.name;
    if (this.data.variable.isArr)
      this.varName += '[' + this.data.variable.selectedIndex + ']';
    this.calibType = 'MULTIPLE_POINTS';
  }

  ngOnInit() {
    const cmd = '?TP_GET_NEEDED_CALIBRATION_POINTS';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      this.maxPoints = Number(ret.result) || 4;
    });
  }
  
  closeDialog() {
    this.dialogRef.close();
  }
  
  private _calibType : string = null;
  get calibType() {return this._calibType;}
  set calibType(newType : string) {
    let oldType = this._calibType;
    this._calibType = newType;
    this.ws.query('?TP_TOOL_CALIBRATION_TYPE("' + newType + '")')
    .then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result !== '0') {
        this._calibType = oldType;
      }
    });
  }
  
  addPoint() {
    this.ws.query("?TP_CALIBRATE_POINT(" + (this.pointsAdded+1) + ")")
    .then((ret:MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        return;
      this.pointsAdded++;
    });
  }
  
  removePoint() {
    this.ws.query("?TP_REMOVE_CALIBRATION_POINT(" + this.pointsAdded + ")")
    .then((ret:MCQueryResponse)=>{
      if (ret.err || ret.result !== '0')
        return;
      if (this.pointsAdded > 0)
        this.pointsAdded--;
    });
  }
  
  clearCalibrationPoints() {
    this.ws.send('?TP_REMOVE_CALIBRATION_POINT(1)');
    this.pointsAdded = 0;
  }
  
  calibrate(multi : boolean) {
    let cmd =
        '?TP_TOOL_CALIBRATION("' + this.varName + '")';
    if (multi || this._singlePointStepTwo) {
      this.ws.query(cmd).then((ret:MCQueryResponse)=>{
        if (ret.result === '0') {
          this.dialogRef.close();
          this.snack.open('Calibration Success!','',{duration: 2000});
          this.dataService.selectedTool = this.varName;
          this._singlePointStepTwo = false;
          this.pointsAdded = 0;
        }
      });
    } else if (!multi) { // SINGLE POINT CALIBRATION STEP 1
      this.ws.query('?TP_SET_CALIBRATION_LOCATION').then((ret:MCQueryResponse)=>{
        if (ret.err || ret.result !== '0')
          return;
        this._singlePointStepTwo = true;
      });
    }
  }

}
