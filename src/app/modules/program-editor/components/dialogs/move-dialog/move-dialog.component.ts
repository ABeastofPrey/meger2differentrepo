import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';
import { DataService } from '../../../../core';
import { ProgramEditorService } from '../../../services/program-editor.service';
import { PositionTriggerService } from '../../../services/position-trigger.service';
import { reduce, isEmpty, complement } from 'ramda';
import { AddVarComponent } from '../../add-var/add-var.component';
import {FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors} from '@angular/forms';

const rangeValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const loc = control.controls['location'].value as TPVariable;
  const rangeMode = control.controls['rangeMode'].value;
  if ((loc && !loc.isArr) || (!rangeMode)) return null;
  const iFrom = control.controls['indexFrom'];
  const iTo = control.controls['indexTo'];
  if (iFrom.value !== -1 && iTo.value !== -1 && iFrom.value <= iTo.value ) {
    iFrom.setErrors(null);
    iTo.setErrors(null);
    return null;
  }
  const err = {
    'invalidRange': true
  };
  if (iFrom.value === -1) {
    iFrom.setErrors(err);
  }
  if (iTo.value === -1 || iTo.value < iFrom.value) {
    iTo.setErrors(err);
  }
  return err;
};

const indexValidator : ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const loc = control.controls['location'].value as TPVariable;
  if (!loc || !loc.isArr || control.controls['rangeMode'].value) {
    control.controls['locationIndex'].setErrors(null);
    return null;
  }
  const val = control.controls['locationIndex'].value;
  if (val && val > 0) {
    control.controls['locationIndex'].setErrors(null);
    return null;
  }
  const err = {'invalidIndex': true };
  control.controls['locationIndex'].setErrors(err);
  return err;
};

@Component({
  selector: 'app-move-dialog',
  templateUrl: './move-dialog.component.html',
  styleUrls: ['./move-dialog.component.css'],
})
export class MoveDialogComponent implements OnInit {
  
  withParams = false;
  ptList: string[] = [];
  pts: string[] = [];
  ctrl: FormGroup = new FormGroup({
    advancedMode: new FormControl(false),
    blendingPh: new FormControl('', [
      Validators.min(0),
      Validators.max(100)
    ]),
    indexFrom: new FormControl(-1),
    indexTo: new FormControl(-1),
    location: new FormControl('',[
      Validators.required
    ]),
    locationIndex: new FormControl(-1),
    motionElement: new FormControl(null),
    rangeMode: new FormControl(false),
    vscale: new FormControl(null, [
      Validators.min(0),
      Validators.max(100)
    ])
  }, {
    validators: [
      rangeValidator,
      indexValidator
    ]
  });
  
  private onLocationChange(newLocation: TPVariable) {
    if (newLocation) {
      this.ctrl.controls['location'].setValue(newLocation);
    }
    this.ctrl.controls['rangeMode'].setValue(false);
    this.ctrl.controls['indexFrom'].setValue(-1);
    this.ctrl.controls['indexTo'].setValue(-1);
    this.ctrl.controls['locationIndex'].setValue(-1);
    this.prg.lastVar = this.ctrl.controls['location'].value;
  }

  get locations(): TPVariable[] {
    return this.dataService.locations;
  }

  get joints(): TPVariable[] {
    return this.dataService.joints;
  }
  
  get location(): TPVariable {
    return this.ctrl.get('location').value;
  }
  
  get rangeMode(): boolean {
    return this.ctrl.get('rangeMode').value;
  }
  
  get advancedMode(): boolean {
    return this.ctrl.get('advancedMode').value;
  }
  
  get blendingPh() {
    return this.ctrl.get('blendingPh');
  }

  /*
   * CALLED WHEN THE SELECTED VARIABLE HAS CHANGED
   */
  resetIndex() {
    this.ctrl.controls['locationIndex'].setValue(-1);
    this.prg.lastVar = this.ctrl.controls['location'].value;
  }

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<MoveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      isArr: boolean,
      moveS: boolean,
      name: string,
      params: {},
    },
    private prg: ProgramEditorService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private mtService: PositionTriggerService
  ) {
    this.withParams = typeof this.data.params !== 'undefined';
    if (this.prg.lastVar && !this.withParams) {
      const loc = this.ctrl.controls['location'];
      loc.setValue(this.prg.lastVar);
      const val = loc.value as TPVariable;
      if (val.isArr && this.prg.lastVarIndex) {
        const index = this.prg.lastVarIndex;
        if (!Array.isArray(val.value)) return;
        this.ctrl.controls['locationIndex'].setValue(
          index < val.value.length ? index + 1 : 1
        );
        this.prg.lastVarIndex = this.ctrl.controls['locationIndex'].value;
      }
    }
  }

  ngOnInit() {
    this.mtService.plsNameList().then(nameList => {
      this.ptList = nameList;
    });
    this.ctrl.controls['location'].valueChanges.subscribe(val=>{
      this.onLocationChange(null);
    });
  }

  ngAfterContentInit() {
    const params = this.data.params;
    if (params) {
      if (params['element'] || params['vscale'] || params['blending']) {
        this.ctrl.controls['advancedMode'].setValue(true);
      }
      // PARSE MOTION ELEMENT
      if (params['element']) {
        this.ctrl.controls['motionElement'].setValue(params['element'] + ' ');
      }
      // PARSE TARGET
      if (params['target']) {
        for (const v of this.dataService.joints.concat(
          this.dataService.locations
        )) {
          if (v.name === params['target'].name) {
            this.ctrl.controls['location'].setValue(v);
            this.ctrl.controls['locationIndex'].setValue(params['target'].selectedIndex);
          }
        }
      }
      // PARSE OTHER PARAMS
      if (params['vscale']) {
        this.ctrl.controls['vscale'].setValue(params['vscale']);
      }
      if (params['blending']) {
        this.ctrl.controls['blendingPh'].setValue(params['blending']);
      }
    }
  }

  createPoint(): void {
    const option = {
      hasBackdrop: false,
      data: { hotVariableOption: [1, 1, 0, 0, 0] }
    };
    this.dialog.open(AddVarComponent, option).afterClosed().subscribe(addedVar => {
      const _location = this.locations.find(x => x.name === addedVar);
      this.onLocationChange(_location || this.joints.find(x => x.name === addedVar));
      if (_location && _location.isArr) {
        this.ctrl.controls['locationIndex'].setValue(1);
      }
      this.cd.detectChanges();
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }

  insert() {
    let cmds = '';
    const cmd = this.data.moveS ? 'Moves ' : 'Move ';
    const names = [];
    const loc = this.ctrl.controls['location'].value as TPVariable;
    const idx = this.ctrl.controls['locationIndex'].value;
    const name = loc.name;
    const el = this.ctrl.controls['motionElement'].value;
    const robot = el ? el + ' ' : '';
    if (loc.isArr) {
      if (!this.ctrl.controls['rangeMode'].value) {
        names.push(name + '[' + idx + ']');
      }
      else {
        const iFrom = this.ctrl.controls['indexFrom'].value;
        const iTo = this.ctrl.controls['indexTo'].value;
        for (let i = iFrom; i <= iTo; i++) {
          names.push(name + '[' + i + ']');
        }
      }
    } else {
      names.push(name);
    }
    let vscaleString = '';
    const vscale = this.ctrl.controls['vscale'].value;
    if (vscale && Number(vscale) > 0) {
      vscaleString = (this.data.moveS ? ' Vtran=' : ' VScale=') + vscale;
    }
    let blendingString = '';
    if (this.ctrl.controls['blendingPh'].value) {
      blendingString = ' BlendingPercentage=' + this.ctrl.controls['blendingPh'].value;
    }
    for (let i = 0; i < names.length; i++) {
      cmds += cmd + robot + names[i] + vscaleString + blendingString;
      if (i < names.length - 1) cmds += '\n';
    }
    // add pls to cmds.
    if (complement(isEmpty(this.pts.length))) {
      cmds += ' ';
      cmds += reduce((acc, pt) => acc + 'withpls=' + pt + ' ', '', this.pts);
    }
    this.dialogRef.close(cmds);
  }
}
