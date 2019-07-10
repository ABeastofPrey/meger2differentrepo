import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';
import { DataService } from '../../../../core';
import { PositionTriggerService } from '../../../services/position-trigger.service';
import { reduce, isEmpty, complement } from 'ramda';
import { AddVarComponent } from '../../add-var/add-var.component';

@Component({
  selector: 'circle-dialog',
  templateUrl: './circle-dialog.component.html',
  styleUrls: ['./circle-dialog.component.css'],
})
export class CircleDialogComponent implements OnInit {
  circlePoint: TPVariable;
  targetPoint: TPVariable;
  circlePointIndex: number = -1;
  targetPointIndex: number = -1;
  motionElement: string = null;
  vtran: string = null;
  advancedMode: boolean = false;
  angle: string = '';
  withParams: boolean = false;
  blending: string = null;
  ptList: string[] = [];
  pts: string[] = [];

  get joints(): TPVariable[] {
    return this.dataService.joints;
  }

  get locations(): TPVariable[] {
    return this.dataService.locations;
  }

  resetIndexCirclePoint() {
    this.circlePointIndex = -1;
  }
  resetIndexTargetPoint() {
    this.targetPointIndex = -1;
  }

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<any>,
    private mtService: PositionTriggerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {
    this.withParams = typeof this.data.params !== 'undefined';
  }

  ngAfterContentInit() {
    let params = this.data.params;
    if (params) {
      if (params['element'] || params['vtran'] || params['blending']) {
        this.advancedMode = true;
      }
      // PARSE MOTION ELEMENT
      if (params['element']) {
        this.advancedMode = true;
        this.motionElement = params['element'] + ' ';
      }

      // PARSE TARGET
      if (params['target']) {
        for (let v of this.dataService.joints.concat(
          this.dataService.locations
        )) {
          if (v.name === params['target'][0].name) {
            this.circlePoint = v;
            this.circlePointIndex = params['target'][0].selectedIndex;
          }
          if (params['target'][1] && v.name === params['target'][1].name) {
            this.targetPoint = v;
            this.targetPointIndex = params['target'][1].selectedIndex;
          }
        }
      }

      // PARSE ANGLE
      if (params['angle']) {
        this.angle = params['angle'];
      }

      // PARSE OTHER PARAMS
      if (params['vtran']) this.vtran = params['vtran'];
      if (params['blending']) {
        this.blending = params['blending'];
      }
    }
  }

  public createPoint(type: string): void {
    const preCPoint = this.circlePoint;
    const preTPoint = this.targetPoint;
    const option = { data: { hotVariableOption: [1, 1, 0, 0, 0] } };
    this.dialog.open(AddVarComponent, option).afterClosed().subscribe(addedVar => {
      let _point = this.locations.find(x => x.name === addedVar);
      _point = _point ? _point : this.joints.find(x => x.name === addedVar);
      if (type === 'circle') {
        this.circlePoint = _point;
        const preJIdx = preTPoint ? this.joints.findIndex(x => x.name === preTPoint.name) : -1;
        const preLIdx = preTPoint ? this.locations.findIndex(x => x.name === preTPoint.name) : -1;
        this.targetPoint = (preJIdx !== -1) ? this.joints[preJIdx] : this.locations[preLIdx];
      } else if (type === 'target') {
        this.targetPoint = _point;
        const preJIdx = preCPoint ? this.joints.findIndex(x => x.name === preCPoint.name) : -1;
        const preLIdx = preCPoint ? this.locations.findIndex(x => x.name === preCPoint.name) : -1;
        this.circlePoint = (preJIdx !== -1) ? this.joints[preJIdx] : this.locations[preLIdx];
      }
    });
  }

  invalidBlending() : boolean {
    if (this.blending) {
      let n = Number(this.blending);
      if (!isNaN(n) && (n < 0 || n > 100)) return true;
    }
    return false;
  }

  ngOnInit() {
    this.mtService.plsNameList().then(nameList => {
      this.ptList = nameList;
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  insert() {
    let cmd = 'Circle ';
    let name1 = this.circlePoint.name;
    let name2 = this.data.angle ? '' : this.targetPoint.name;
    let robot = this.motionElement ? this.motionElement + ' ' : '';
    if (this.circlePoint.isArr) name1 += '[' + this.circlePointIndex + ']';
    if (!this.data.angle && this.targetPoint.isArr)
      name2 += '[' + this.targetPointIndex + ']';
    let vtranString = '';
    if (this.vtran && Number(this.vtran) > 0)
      vtranString = ' Vtran=' + this.vtran;
    let circlePoint = 'CirclePoint=' + name1;
    let targetPoint = this.data.angle
      ? ' Angle=' + this.angle
      : ' TargetPoint=' + name2;
    let blendingString = '';
    if (this.blending) blendingString = ' BlendingPercentage=' + this.blending;
    cmd += robot + circlePoint + targetPoint + vtranString + blendingString;
    // add pls to cmds.
    if (complement(isEmpty(this.pts.length))) {
      cmd += ' ';
      cmd += reduce((acc, pt) => acc + 'withpls=' + pt + ' ', '', this.pts);
    }
    this.dialogRef.close(cmd);
  }
}
