import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';
import { DataService } from '../../../../core';
import { ProgramEditorService } from '../../../services/program-editor.service';
import { PositionTriggerService } from '../../../services/position-trigger.service';
import { reduce, isEmpty, complement } from 'ramda';
import { AddVarComponent } from '../../add-var/add-var.component';

@Component({
  selector: 'app-move-dialog',
  templateUrl: './move-dialog.component.html',
  styleUrls: ['./move-dialog.component.css'],
})
export class MoveDialogComponent implements OnInit {
  private _location: TPVariable;
  private _locationIndex: number = -1;
  indexFrom: number = -1;
  indexTo: number = -1;
  motionElement: string = null;
  vcruise: string = null;
  advancedMode: boolean = false;
  rangeMode: boolean = false;
  withParams: boolean = false;
  blending: string = null;
  ptList: string[] = [];
  pts: string[] = [];

  get locationIndex() {
    return this._locationIndex;
  }
  set locationIndex(val: number) {
    this._locationIndex = val;
    this.prg.lastVarIndex = val;
  }

  get location() {
    return this._location;
  }
  set location(newLocation: TPVariable) {
    this._location = newLocation;
    this.rangeMode = false;
    this.indexFrom = -1;
    this.indexTo = -1;
    this._locationIndex = -1;
    this.prg.lastVar = this._location;
  }

  get locations(): TPVariable[] {
    return this.dataService.locations;
  }

  get joints(): TPVariable[] {
    return this.dataService.joints;
  }

  /*
   * CALLED WHEN THE SELECTED VARIABLE HAS CHANGED
   */
  resetIndex() {
    this.locationIndex = -1;
    this.prg.lastVar = this._location;
  }

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private prg: ProgramEditorService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private mtService: PositionTriggerService
  ) {
    this.withParams = typeof this.data.params !== 'undefined';
    if (this.prg.lastVar && !this.withParams) {
      this._location = this.prg.lastVar;
      if (this._location.isArr && this.prg.lastVarIndex) {
        let index = this.prg.lastVarIndex;
        this._locationIndex =
          index < this._location.value.length ? index + 1 : 1;
        this.prg.lastVarIndex = this._locationIndex;
      }
    }
  }

  ngOnInit() {
    this.mtService.plsNameList().then(nameList => {
      this.ptList = nameList;
    });
  }

  ngAfterContentInit() {
    let params = this.data.params;
    if (params) {
      if (params['element'] || params['vcruise'] || params['blending']) {
        this.advancedMode = true;
      }
      // PARSE MOTION ELEMENT
      if (params['element']) this.motionElement = params['element'] + ' ';
      // PARSE TARGET
      if (params['target']) {
        for (let v of this.dataService.joints.concat(
          this.dataService.locations
        )) {
          if (v.name === params['target'].name) {
            this._location = v;
            this._locationIndex = params['target'].selectedIndex;
          }
        }
      }
      // PARSE OTHER PARAMS
      if (params['vcruise']) {
        this.vcruise = params['vcruise'];
      }
      if (params['blending']) {
        this.blending = params['blending'];
      }
    }
  }

  public createPoint(): void {
    const option = { data: { hotVariableOption: [1, 1, 0, 0, 0] } };
    this.dialog.open(AddVarComponent, option).afterClosed().subscribe(addedVar => {
      let _location = this.locations.find(x => x.name === addedVar);
      this.location = _location ? _location : this.joints.find(x => x.name === addedVar);
      this.cd.detectChanges();
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  invalidBlending(): boolean {
    if (this.blending) {
      let n = Number(this.blending);
      if (!isNaN(n) && (n < 0 || n > 100)) return true;
    }
    return false;
  }

  insert() {
    let cmds = '';
    let cmd = this.data.moveS ? 'Moves ' : 'Move ';
    let names = [];
    let name = this.location.name;
    let robot = this.motionElement ? this.motionElement + ' ' : '';
    if (this.location.isArr) {
      if (!this.rangeMode) names.push(name + '[' + this.locationIndex + ']');
      else {
        for (var i = this.indexFrom; i <= this.indexTo; i++)
          names.push(name + '[' + i + ']');
      }
    } else {
      names.push(name);
    }
    let vcruiseString = '';
    if (this.vcruise && Number(this.vcruise) > 0)
      vcruiseString =
        (this.data.moveS ? ' Vtran=' : ' Vcruise=') + this.vcruise;
    let blendingString = '';
    if (this.blending) blendingString = ' BlendingPercentage=' + this.blending;
    for (let i = 0; i < names.length; i++) {
      cmds += cmd + robot + names[i] + vcruiseString + blendingString;
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
