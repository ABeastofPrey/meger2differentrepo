import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import {
  DataService,
  WebsocketService,
  CoordinatesService,
  MCQueryResponse,
  ScreenManagerService,
  ProjectManagerService,
} from '../../../core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';
import { TpStatService } from '../../../core/services/tp-stat.service';
import { CommonService } from '../../../core/services/common.service';
import { FormControl, FormGroupDirective, NgForm, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

export enum DataParameter {
  OneArraySize = 'OneArraySize',
  TwoArraySize = 'TwoArraySize'
}

export enum DataParameterErrorKey {
  InvalidArraySize = 'InvalidArraySize',
}

export class ArraySizeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.touched || isSubmitted));
  }
}

@Component({
  selector: 'add-var',
  templateUrl: './add-var.component.html',
  styleUrls: ['./add-var.component.css'],
})
export class AddVarComponent implements OnInit {
  
  name: FormControl = new FormControl('', [Validators.required, Validators.maxLength(32), Validators.pattern('[a-zA-Z]+(\\w*)$')]);
  varType: string;
  values: Array<string | number>;
  isArray = false;
  arrSize = 1;
  arrSecondSize = 1;
  @Input() hotVariableOption: Array<0 | 1> = [1, 1, 1, 1, 1];
  @Input() canUseArray = true;
  validationControls = {};
  errorMatcher = new ArraySizeErrorStateMatcher();
  dataParameterReference = DataParameter;
  dimension = 1;

  private words: {};
  private errorMessages: {};
  private notifier: Subject<boolean> = new Subject();
  private _busy = false;

  get busy() {
    return this._busy;
  }

  constructor(
    public dialogRef: MatDialogRef<AddVarComponent>,
    public data: DataService,
    private ws: WebsocketService,
    private coos: CoordinatesService,
    private snackbar: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private trn: TranslateService,
    private utils: UtilsService,
    private screenManagerService: ScreenManagerService,
    public stat: TpStatService,
    public prj: ProjectManagerService,
    public cmn: CommonService,
    @Inject(MAT_DIALOG_DATA) public para: {
      varType: string,
      useAsProjectPoints: boolean,
      hotVariableOption: Array<0 | 1>,
      canUseArray: boolean
    }
  ) {
    this.varType = this.para.varType || 'JOINT';
    if (this.para.useAsProjectPoints) {
      this.hotVariableOption = [1, 0, 0, 0, 0];
    }
    if (this.para.hotVariableOption) {
      this.hotVariableOption = this.para.hotVariableOption;
    }
    if (this.para.canUseArray !== undefined && this.para.canUseArray !== null) {
      this.canUseArray = this.para.canUseArray;
    }

    if (this.data.domainIsFrame) this.varType = 'LOCATION';
    this.trn.get(['success', 'variables.cannot_use_jog_tip', 'enter_integer']).subscribe(words => {
      this.words = words;
      this.errorMessages = {
        [DataParameterErrorKey.InvalidArraySize]: words['enter_integer'],
      };
    });

  }

  isHotOption(index: number): boolean {
    return this.hotVariableOption[index] === 1 ? true : false;
  }

  ngOnInit() {
    this.values = this.data.robotCoordinateType.all.map(l => {
      return '0';
    });
    // Open jog panel
    this.stat.onlineStatus.pipe(takeUntil(this.notifier)).subscribe(stat => {
      const canNotOpen = !stat || this.prj.activeProject || !this.coos.coosLoaded.value ||
                        (this.cmn.isTablet && this.stat.mode !== 'T1' && this.stat.mode !== 'T2');
      if (!canNotOpen) {
        this.changeOverlayAndToggleJog();
      }
    });

    this.validationControls[DataParameter.OneArraySize] = new FormControl(
      '',
      [ Validators.required,
        this.createValidator(
          DataParameterErrorKey.InvalidArraySize,
          (value: string): boolean => {
            return Number(value) > 0 && (Number(value) % 1 === 0) ? true : false;
          }
        ),
      ]
    );

    this.validationControls[DataParameter.TwoArraySize] = new FormControl(
      '',
      [ Validators.required,
        this.createValidator(
          DataParameterErrorKey.InvalidArraySize,
          (value: string): boolean => {
            return Number(value) > 0 && (Number(value) % 1 === 0) ? true : false;
          }
        ),
      ]
    );
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
    this.utils.removeShrinkStretchOverlay();
  }

  getErrors(formControl: FormControl) {
    if (formControl.errors) {
      for (const errorKey of Object.keys(this.errorMessages)) {
        if (formControl.hasError(errorKey)) {
          return this.errorMessages[errorKey];
        }
      }
    }
  }

  onTypeChange() {
    if (this.varType === 'STRING') this.values[0] = '';
    else this.values[0] = '0';
  }

  closeDialog() {
    this.dialogRef.close(this.name.value && this.name.value.toUpperCase());
  }

  add(): Promise<void> {
    this._busy = true;
    let name = "";
    if (this.varType === 'STRING') {
      name = this.name.value;
      if (this.isArray) {
        name = this.dimension > 1 ? 
          this.name.value + '[' + this.arrSize + ']' + '[' + this.arrSecondSize + ']' :
          this.name.value + '[' + this.arrSize + ']';
      }
    } else {
      name = this.isArray ? this.name.value + '[' + this.arrSize + ']' : this.name.value;
    }

    let value = '';
    if (!this.isArray) {
      const legendSize =
        this.varType === 'JOINT' || this.varType === 'LOCATION'
          ? this.data.robotCoordinateType.legends.length
          : 1;
      value = this.values.slice(0, legendSize).join();
      if (this.varType === 'LOCATION') {
        value += ';' + this.values.slice(legendSize).join();
      }
    }
    let cmd =
      '?TP_ADDVAR("' +
      name +
      '","' +
      this.varType +
      '","' +
      this.data.selectedRobot +
      '","' +
      value +
      '")';
    if (this.para.useAsProjectPoints) {
      cmd =
        '?TP_ADD_project_points("' +
        name +
        '","' +
        this.varType +
        '","' +
        this.data.selectedRobot +
        '","' +
        value +
        '")';
    }
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        console.log(ret);
        this._busy = false;
      } else {
        return this.data.refreshVariables().then(() => {
          this._busy = false;
          this.closeDialog();
        });
      }
    });
  }

  getCurrent(): void {
    if (this.varType === 'JOINT') {
      const j1 = this.coos.joints.find(x => x.key === 'J1');
      const j2 = this.coos.joints.find(x => x.key === 'J2');
      const j3 = this.coos.joints.find(x => x.key === 'J3');
      const j4 = this.coos.joints.find(x => x.key === 'J4');
      this.values = [j1.value, j2.value, j3.value, j4.value];
    } else if (this.varType === 'LOCATION') {
      const x = this.coos.locations.find(_x => _x.key === 'X');
      const y = this.coos.locations.find(_y => _y.key === 'Y');
      const z = this.coos.locations.find(_z => _z.key === 'Z');
      const r = this.coos.locations.find(_r => _r.key === 'Roll');
      this.values = [x.value, y.value, z.value, r.value, '0'];
    }
  }

  private changeOverlayAndToggleJog(): void {
    const isOpened = this.screenManagerService.openedControls.value;
    this.shrinkOverlayAndExpandJog(isOpened);
    this.dialogRef.afterClosed().subscribe(() => {
      const isOpened = this.screenManagerService.openedControls.value;
      if (isOpened) {
        this.stretchOverlayAndCollapseJog(isOpened);
      }
    });
  }

  private shrinkOverlayAndExpandJog(isOpened: boolean): void {
    this.utils.shrinkOverlay();
    if (!isOpened) {
      this.screenManagerService.toggleControls(true);
    }
  }

  private stretchOverlayAndCollapseJog(isOpened: boolean): void {
    this.utils.stretchOverlay();
    if (!isOpened && this.screenManagerService.openedControls) {
      this.screenManagerService.toggleControls(true);
    }
    setTimeout(() => {
      this.utils.removeShrinkStretchOverlay();
    }, 400);
  }

  private createValidator(
    errorKey: string,
    validateFunction: (value: string) => boolean
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === '') {
        return null;
      }
      return validateFunction(control.value)
        ? null
        : { [errorKey]: true };
    };
  }
}
