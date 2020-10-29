import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';
import { DataService } from '../../../../core';
import { PositionTriggerService } from '../../../services/position-trigger.service';
import { reduce, isEmpty, complement } from 'ramda';
import { AddVarComponent } from '../../add-var/add-var.component';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { JumpxCommandService } from '../../combined-dialogs/services/jumpx-command.service';
import { UtilsService } from '../../../../core/services/utils.service';

@Component({
  selector: 'circle-dialog',
  templateUrl: './circle-dialog.component.html',
  styleUrls: ['./circle-dialog.component.css'],
})
export class CircleDialogComponent implements OnInit {

  withParams = false;
  ptList: string[] = [];

  ctrl: FormGroup = new FormGroup({
    advancedMode: new FormControl(false),
    angle: new FormControl(''),
    blendingPh: new FormControl('', [
      Validators.min(0),
      Validators.max(100)
    ]),
    circlePoint: new FormControl(null, Validators.required),
    circlePointIndex: new FormControl(-1),
    motionElement: new FormControl(null),
    pts: new FormControl([]),
    targetPoint: new FormControl(null),
    targetPointIndex: new FormControl(-1),
    vtran: new FormControl(''),
  });

  get advancedMode() {
    return this.ctrl.get('advancedMode').value;
  }

  set advancedMode(val) {
    this.ctrl.get('advancedMode').setValue(val);
  }

  get angle() {
    return this.ctrl.get('angle').value;
  }

  get blendingPh() {
    return this.ctrl.get('blendingPh');
  }

  get circlePoint() {
    return this.ctrl.get('circlePoint').value;
  }

  get motionElement() {
    return this.ctrl.get('motionElement').value;
  }

  set motionElement(val) {
    this.ctrl.get('motionElement').setValue(val);
  }

  get pts() {
    return this.ctrl.get('pts').value;
  }

  get targetPoint() {
    return this.ctrl.get('targetPoint').value;
  }

  set targetPoint(val: TPVariable) {
    this.ctrl.get('targetPoint').setValue(val);
  }

  get targetPointIndex() {
    return this.ctrl.get('targetPointIndex').value;
  }

  set targetPointIndex(val) {
    this.ctrl.get('targetPointIndex').setValue(val);
  }

  get vtran() {
    return this.ctrl.get('vtran').value;
  }

  set vtran(val) {
    this.ctrl.get('vtran').setValue(val);
  }

  get circlePointIndex() {
    return this.ctrl.get('circlePointIndex').value;
  }

  get joints(): TPVariable[] {
    return this.dataService.joints;
  }

  get locations(): TPVariable[] {
    return this.dataService.locations;
  }

  resetIndexCirclePoint() {
    this.ctrl.get('circlePointIndex').setValue(-1);
  }
  resetIndexTargetPoint() {
    this.targetPointIndex = -1;
  }

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<CircleDialogComponent>,
    private mtService: PositionTriggerService,
    private jumpxService: JumpxCommandService,
    private utilsService: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: {
      angle: boolean,
      isArr: boolean,
      name: string,
      params: {},
    },
    private dialog: MatDialog
  ) {
    this.withParams = typeof this.data.params !== 'undefined';
  }

  ngAfterContentInit() {
    const params = this.data.params;
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
        for (const v of this.dataService.joints.concat(
          this.dataService.locations
        )) {
          if (v.name === params['target'][0].name) {
            this.ctrl.get('circlePoint').setValue(v);
            this.ctrl.get('circlePointIndex').setValue(params['target'][0].selectedIndex);
          }
          if (params['target'][1] && v.name === params['target'][1].name) {
            this.targetPoint = v;
            this.targetPointIndex = params['target'][1].selectedIndex;
          }
        }
      }

      // PARSE ANGLE
      if (params['angle']) {
        this.ctrl.get('angle').setValue(params['angle']);
      }

      // PARSE OTHER PARAMS
      if (params['vtran']) this.vtran = params['vtran'];
      if (params['blending']) {
        this.ctrl.get('blendingPh').setValue(params['blending']);
      }
    }
  }

  createPoint(type: string): void {
    const preCPoint = this.ctrl.get('circlePoint').value;
    const preTPoint = this.targetPoint;
    const option = {
      hasBackdrop: false,
      data: { hotVariableOption: [1, 1, 0, 0, 0] }
    };
    this.dialog.open(AddVarComponent, option).afterClosed().subscribe(addedVar => {
      let _point = this.locations.find(x => x.name === addedVar);
      _point = _point ? _point : this.joints.find(x => x.name === addedVar);
      if (type === 'circle') {
        this.ctrl.get('circlePoint').setValue(_point);
        const preJIdx = preTPoint ? this.joints.findIndex(x => x.name === preTPoint.name) : -1;
        const preLIdx = preTPoint ? this.locations.findIndex(x => x.name === preTPoint.name) : -1;
        this.targetPoint = (preJIdx !== -1) ? this.joints[preJIdx] : this.locations[preLIdx];
        if (this.ctrl.get('circlePoint').value.isArr) {
          this.ctrl.get('circlePointIndex').setValue(1);
        }
      } else if (type === 'target') {
        this.targetPoint = _point;
        const preJIdx = preCPoint ? this.joints.findIndex(x => x.name === preCPoint.name) : -1;
        const preLIdx = preCPoint ? this.locations.findIndex(x => x.name === preCPoint.name) : -1;
        this.ctrl.get('circlePoint').setValue((preJIdx !== -1) ? this.joints[preJIdx] : this.locations[preLIdx]);
        if (this.targetPoint.isArr) {
          this.targetPointIndex = 1;
        }
      }
    });
  }

  public vtranMax: number;
  ngOnInit() {
    this.mtService.plsNameList().then(nameList => {
      this.ptList = nameList;
    });
    this.jumpxService.retrieveVtranMax().subscribe(max => {
      this.vtranMax = max;
      this.ctrl.controls['vtran'].setValidators(
        this.utilsService.limitValidator(0, max, false, true)
      );
    });
  }

  angleChange(value) {
    this.ctrl.controls.angle.patchValue(value);
  }

  vtranChange(value) {
    this.ctrl.controls.vtran.patchValue(value);
  }

  blendChange(value) {
    this.ctrl.controls.blendingPh.patchValue(value);
  }

  cancel() {
    this.dialogRef.close();
  }

  insert() {
    let cmd = 'Circle ';
    let name1 = this.ctrl.get('circlePoint').value.name;
    let name2 = this.data.angle ? '' : this.targetPoint.name;
    const robot = this.motionElement ? this.motionElement + ' ' : '';
    if (this.ctrl.get('circlePoint').value.isArr) name1 += '[' + this.circlePointIndex + ']';
    if (!this.data.angle && this.targetPoint.isArr) {
      name2 += '[' + this.targetPointIndex + ']';
    }
    let vtranString = '';
    if (this.vtran && Number(this.vtran) > 0) {
      vtranString = ' Vtran=' + this.vtran;
    }
    const circlePoint = this.data.angle ? 'Angle=' + this.angle : 'CirclePoint=' + name1;
    const targetPoint = this.data.angle
      ? ' CircleCenter=' + name1
      : ' TargetPoint=' + name2;
    let blendingString = '';
    if (this.blendingPh.valid && this.blendingPh.value) {
      blendingString = ' BlendingPercentage=' + this.blendingPh.value;
    }
    cmd += robot + circlePoint + targetPoint + vtranString + blendingString;
    // add pls to cmds.
    if (complement(isEmpty(this.pts.length))) {
      cmd += ' ';
      cmd += reduce((acc, pt) => acc + 'withpls=' + pt + ' ', '', this.pts);
    }
    this.dialogRef.close(cmd);
  }
}
