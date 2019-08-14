import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, ErrorStateMatcher, MatDialog } from '@angular/material';
import {
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { TPVariable } from '../../../../core/models/tp/tp-variable.model';
import { DataService, MCQueryResponse } from '../../../../core/services';
import { WebsocketService } from './../../../../core/services/websocket.service';
import { ProgramEditorService } from '../../../services/program-editor.service';
import { JumpParameterErrorKey, JumpParameter } from './jump-dialog.enum';
import { TranslateService } from '@ngx-translate/core';
import { AddVarComponent } from '../../add-var/add-var.component';

/**
 * The class to define the error matcher for the validation form.
 */
export class ParameterErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-jump-dialog',
  templateUrl: './jump-dialog.component.html',
  styleUrls: ['./jump-dialog.component.css'],
})
/**
 * This class describes the logics to insert jump command into the user program.
 */
export class JumpDialogComponent implements OnInit {
  private words: any = {};

  /**
   * The max value of the speed.
   */
  private speedMax: Number;
  /**
   * The min value of the Z limit.
   */
  private limitZMin: Number;
  /**
   * The max value of the Z limit.
   */
  private limitZMax: Number;
  /**
   * The max value of the acceleration.
   */
  private accelerationMax: Number;

  /**
   * The destination location of the jump command.
   */
  private jumpLocation: TPVariable;

  /**
   * The error messages for the value validation.
   */
  private errorMessages: any;

  /**
   * The motion element of the jump command.
   */
  motionRobot: string = '';
  /**
   * The avaible motion elements.
   */
  motionRobots: string[];
  /**
   * Whether the advanced mode is enabled.
   */
  advancedMode: boolean = false;
  /**
   * The blendling value of the jump command.
   */
  blending: Number = null;
  /**
   * The arc number of the jump command.
   */
  arcNumber: Number = null;
  /**
   * The z limit of the jump command.
   */
  limitZ: Number = null;
  /**
   * The speed of the jump command.
   */
  speed: Number = null;
  /**
   * The acceleration of the jump command.
   */
  acceleration: Number = null;

  /**
   * The JumpParameter enum reference.
   */
  jumpParameterReference = JumpParameter;

  /**
   * The error matcher.
   */
  errorMatcher = new ParameterErrorStateMatcher();

  /**
   * The form controls for the required parameter.
   */
  requiredFormControls = {
    [JumpParameter.MotionElement]: new FormControl('', [Validators.required]),
    [JumpParameter.DestinationFrame]: new FormControl('', [
      Validators.required,
    ]),
  };

  /**
   * The form controls for the advanced parameter.
   */
  advancedFormControls = {
    [JumpParameter.ArcNumber]: new FormControl('', [
      this.createValidator(
        1,
        7,
        JumpParameterErrorKey.NotIntegerArcNumber,
        (value: Number, min: Number, max: Number): boolean => {
          return Number(value) % 1 === 0 ? true : false;
        }
      ),
      this.createValidator(
        1,
        7,
        JumpParameterErrorKey.InValidArcNumber,
        (value: Number, min: Number, max: Number): boolean => {
          return value >= min && value <= max ? true : false;
        }
      ),
    ]),
    [JumpParameter.Blending]: new FormControl('', [
      this.createValidator(
        0,
        100,
        JumpParameterErrorKey.InValidBlending,
        (value: Number, min: Number, max: Number): boolean => {
          return value >= min && value <= max ? true : false;
        }
      ),
    ]),
  };

  /**
   * Get the destination location.
   * @returns The destination location.
   */
  get location() {
    return this.jumpLocation;
  }

  get locations(): TPVariable[] {
    return this.dataService.locations.filter(x => !x.isArr);
  }

  /**
   * Set the destination location.
   * @param newLocation The new destination location.
   */
  set location(newLocation: TPVariable) {
    this.jumpLocation = newLocation;
    this.prgService.lastVar = this.jumpLocation;
  }

  /**
   * Constructor.
   * @param dataService The data service instance.
   * @param dialogRef  The MatDialogRef reference.
   * @param prgService The program service instance.
   * @param ws The websocket service instance.
   */
  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<any>,
    private prgService: ProgramEditorService,
    private ws: WebsocketService,
    private trn: TranslateService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    this.trn.get(['projectCommands.jump']).subscribe(words => {
      this.words = words['projectCommands.jump'];
      this.errorMessages = {
        [JumpParameterErrorKey.NotIntegerArcNumber]: `${this.words['intRange']} [1, 7].`,
        [JumpParameterErrorKey.InValidArcNumber]: `${this.words['intRange']} [1, 7].`,
        [JumpParameterErrorKey.InValidBlending]: `${this.words['numRange']} [0, 100].`,
      };
    });
  }

  ngOnInit() {
    this.ws.query('?TP_GET_ROBOT_LIST').then((ret: MCQueryResponse) => {
      if (ret.err || ret.result.length === 0) {
        return;
      }
      this.motionRobots = ret.result.split(',');
      if (this.motionRobots.length > 0) {
        this.motionRobot = this.motionRobots[0];
      }

      this.initializeLimitAndValidation();
    });
  }

  public createPoint(): void {
    const option = {
      hasBackdrop: false,
      data: { hotVariableOption: [1, 1, 0, 0, 0] }
    };
    this.dialog.open(AddVarComponent, option).afterClosed().subscribe(addedVar => {
      this.location = this.locations.find(x => x.name === addedVar);
      this.cd.detectChanges();
    });
  }

  /**
   * Reset the destination location.
   */
  reset() {
    this.prgService.lastVar = this.location;
  }

  /**
   * The cancel button handler.
   */
  cancel() {
    this.dialogRef.close();
  }

  /**
   * The insert button handler.
   */
  insert() {
    let isValid = true;

    for (let formControl of Object.values(this.requiredFormControls)) {
      if (formControl.invalid) {
        formControl.markAsTouched();
        isValid = false;
      }
    }

    if (this.advancedMode) {
      for (let formControl of Object.values(this.advancedFormControls)) {
        if (formControl.invalid) {
          formControl.markAsTouched();
          isValid = false;
        }
      }
    }

    if (isValid) {
      let cmd = '';
      if (this.advancedMode) {
        cmd = `jump(${this.motionRobot}, "${this.location.name}", ${
          this.arcNumber ? this.arcNumber : -1
        }, \
${this.limitZ ? this.limitZ : '0xffff'}, ${
          this.blending ? this.blending : -1
        }, ${this.speed ? this.speed : -1}, \
${this.acceleration ? this.acceleration : -1})`;
      } else {
        cmd = `jump(${this.motionRobot}, "${this.location.name}", -1, 0xffff, -1, -1, -1)`;
      }
      this.dialogRef.close(cmd);
    }
  }

  /**
   * Get the validation error.
   * @param formControl The validation form control.
   * @returns The validation error message.
   */
  getErrors(formControl: FormControl) {
    if (formControl.errors) {
      for (let errorKey of Object.keys(this.errorMessages)) {
        if (
          formControl.hasError(errorKey[0].toLowerCase() + errorKey.slice(1))
        ) {
          return this.errorMessages[errorKey];
        }
      }
    }
  }

  /**
   * Whether the advanced mode is disabled.
   * @returns If it is disabled, return true.
   */
  isAdancedModeDisable(): boolean {
    let disable = false;

    for (let formControl of Object.values(this.requiredFormControls)) {
      if (formControl.invalid) {
        disable = true;
      }
    }

    return disable;
  }

  /**
   * The handler when the motion element is changed.
   */
  onMotionElementChanged() {
    this.initializeLimitAndValidation();
  }

  /**
   * The handler when the advanced mode is changed.
   */
  onAdvancedModeChanged() {
    if (!this.advancedMode) {
      for (let formControl of Object.values(this.advancedFormControls)) {
        formControl.setValue(null);
        formControl.markAsUntouched();
      }
    }
  }

  /**
   * Initialize the parameter limit and validator.
   */
  private initializeLimitAndValidation() {
    if (this.motionRobot && this.motionRobot.length) {
      this.initializeSpeedLimitAndValidation();
      this.initializeAccLimitAndValidation();
      this.initializeZLimitAndValidation();
    }
  }

  /**
   * Initialize the acceleration limit and validation.
   */
  private initializeAccLimitAndValidation() {
    this.ws
      .query(`?${this.motionRobot}.ACCELERATIONMAX`)
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result.length === 0) {
          return;
        }
        this.accelerationMax = Math.floor(Number(ret.result));
        this.errorMessages[
          JumpParameterErrorKey.InValidAcceleration
        ] = `${this.words['numRange']} (0, ${this.accelerationMax})`;
        this.advancedFormControls[JumpParameter.Acceleration] = new FormControl(
          '',
          [
            this.createValidator(
              0,
              this.accelerationMax,
              JumpParameterErrorKey.InValidAcceleration,
              (value: Number, min: Number, max: Number): boolean => {
                return value > min && value < max ? true : false;
              }
            ),
          ]
        );
      });
  }

  /**
   * Initialize the speed limit and validation.
   */
  private initializeSpeedLimitAndValidation() {
    this.ws
      .query(`?${this.motionRobot}.VELOCITYMAX`)
      .then((ret: MCQueryResponse) => {
        if (ret.err || ret.result.length === 0) {
          return;
        }
        this.speedMax = Math.floor(Number(ret.result));
        this.errorMessages[
          JumpParameterErrorKey.InValidSpeed
        ] = `${this.words['numRange']} (0, ${this.speedMax})`;
        this.advancedFormControls[JumpParameter.Speed] = new FormControl('', [
          this.createValidator(
            0,
            this.speedMax,
            JumpParameterErrorKey.InValidSpeed,
            (value: Number, min: Number, max: Number): boolean => {
              return value > min && value < max ? true : false;
            }
          ),
        ]);
      });
  }

  /**
   * Initialize the limit and validator for Z limit.
   */
  private initializeZLimitAndValidation() {
    let cmd = `?${this.motionRobot}.ZMAX`;
    this.ws.query(cmd).then((zMaxRet: MCQueryResponse) => {
      if (zMaxRet.err || zMaxRet.result.length === 0) {
        return;
      }
      this.limitZMax = Math.floor(Number(zMaxRet.result));

      cmd = `?${this.motionRobot}.ZMIN`;
      this.ws.query(cmd).then((zMinRet: MCQueryResponse) => {
        if (zMinRet.err || zMinRet.result.length === 0) {
          return;
        }
        this.limitZMin = Math.floor(Number(zMinRet.result));
        this.errorMessages[
          JumpParameterErrorKey.InValidLimitZ
        ] = `${this.words['numRange']} [${this.limitZMin}, ${this.limitZMax}]`;

        this.advancedFormControls[JumpParameter.LimitZ] = new FormControl('', [
          this.createValidator(
            this.limitZMin,
            this.limitZMax,
            JumpParameterErrorKey.InValidLimitZ,
            (value: Number, min: Number, max: Number): boolean => {
              return value >= min && value <= max ? true : false;
            }
          ),
        ]);
      });
    });
  }

  /**
   * Create the parameter validator.
   * @param min The min limit.
   * @param max The max limit
   * @param errorKey The error key to indicate the validation error message.
   * @param validateFunction The method to do the validation.
   * @returns ValidatorFn instance.
   */
  private createValidator(
    min: Number,
    max: Number,
    errorKey: JumpParameterErrorKey,
    validateFunction: (value: Number, min: Number, max: Number) => boolean
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === '') {
        return null;
      }
      const accelerationValue = Number(control.value);
      return validateFunction(accelerationValue, min, max)
        ? null
        : { [errorKey]: true };
    };
  }
}
