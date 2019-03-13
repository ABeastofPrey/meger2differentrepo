import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher, MatSelectChange } from '@angular/material';
import { FormControl, Validators, FormGroupDirective, NgForm, AbstractControl, ValidatorFn } from '@angular/forms';
import { Jump3DialogService } from '../../../services/jump3-dialog.service';
import { map, range, all, find } from 'ramda';

interface IParameter {
  placeholder: string;
  control: FormControl;
  matcher: ParameterErrorStateMatcher;
  selected: string;
}

interface IRequiredPar extends IParameter {
  change: (event: MatSelectChange) => void;
  options: string[];
}

interface IOptionalPar extends IParameter {
  suffix: string;
  sup: number;
}

class ParameterErrorStateMatcher implements ErrorStateMatcher {
  static of(): ParameterErrorStateMatcher { return new this(); }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.touched || (form && form.submitted)));
  }
}

@Component({
  selector: 'app-jump3-dialog',
  templateUrl: 'jump3-dialog.component.html',
  styleUrls: ['jump3-dialog.component.scss']
})
export class Jump3DialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private service: Jump3DialogService) { }

  public requiredPars: IRequiredPar[];
  public optionalPars: IOptionalPar[];
  public isAdvanced: boolean;
  private vMax: number;
  private aMax: number;
  private limits: {min: number, max: number}[];

  async ngOnInit() {
    this.requiredPars = await this.assemblingRequiredPars();
    await this.retriveLimits(this.requiredPars[0].options[0]);
    this.optionalPars = this.assemblingOptionalPars();
  }

  get enableAdvanced(): boolean {
    return (this.requiredPars && all(x => x.control.invalid === false, this.requiredPars)) ? true : false;
  }

  get hasInvalidOptional(): boolean {
    return (this.optionalPars && find(x => x.control.invalid === true, this.optionalPars)) ? true : false;
  }

  public emitCmd(): void {
    this.dialogRef.close(this.assemblingCmd());
  }

  public errorMessage(control: FormControl): string {
    if (control.hasError('required')) {
      return 'This field is required';
    } else if (control.hasError('limit')) {
      return control.errors.limit.msg;
    }
  }

  private async assemblingRequiredPars(): Promise<IRequiredPar[]> {
    const placeholders = ['Motion Element', 'Depart Point', 'Approach Point', 'Dest Frame'],
      motionElements = await this.service.retriveMotionElements(),
      destFrames = this.service.retriveDestFrames(),
      options = [motionElements, destFrames, destFrames, destFrames];
    return map(n => {
      return {
        placeholder: placeholders[n],
        control: new FormControl('', [Validators.required]),
        matcher: ParameterErrorStateMatcher.of(),
        change: (event: MatSelectChange) => {if (n === 0) { this.retriveLimits(event.value); }},
        options: options[n],
        selected: null
      } as IRequiredPar;
    }, range(0, 4));
  }

  private assemblingOptionalPars(): IOptionalPar[] {
    const placeholders = ['Arch Number', 'Blending Percentage', 'Speed', 'Acceleration'];
    const suffixs = [, '%', 'mm/s', 'mm/s'], sups = [, , , 2];
    this.limits = [{min: 1, max: 7}, {min: 0, max: 100}, {min: 0, max: this.vMax}, {min: 0, max: this.aMax}];
    return map(n => {
      return {
        placeholder: placeholders[n],
        control: new FormControl('', [this.limitValidator(this.limits[n].min, this.limits[n].max, n)]),
        matcher: ParameterErrorStateMatcher.of(),
        selected: null,
        suffix: suffixs[n],
        sup: sups[n]
      } as IOptionalPar;
    }, range(0, 4));
  }

  private async retriveLimits(motionElement: string): Promise<void> {
    this.vMax = await this.service.retriveVolocityMax(motionElement);
    this.aMax = await this.service.retriveAccelearationMax(motionElement);
  }

  private assemblingCmd(): string {
    const opAN = this.optionalPars[0].selected ? this.optionalPars[0].selected : -1,
      opBP = this.optionalPars[1].selected ? this.optionalPars[1].selected : -1,
      opSD = this.optionalPars[2].selected ? this.optionalPars[2].selected : -1,
      opAC = this.optionalPars[3].selected ? this.optionalPars[3].selected : -1;
    const advanceCmd = `(${this.requiredPars[0].selected}, "${this.requiredPars[1].selected}",\
 "${this.requiredPars[2].selected}", "${this.requiredPars[3].selected}", ${opAN}, ${opBP}, ${opSD}, ${opAC})`;
    const normalCmd = `(${this.requiredPars[0].selected}, "${this.requiredPars[1].selected}",\
 "${this.requiredPars[2].selected}", "${this.requiredPars[3].selected}", -1, -1, -1, -1\)`;
    return this.isAdvanced ? advanceCmd : normalCmd;
  }

  private limitValidator(min: number, max: number, index: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!!control.value === false) { return null; }
      let msg = `Please enter a number in [${min}, ${max}].`;
      let forbidden = (Number(control.value).toString() === 'NaN') || Number(control.value) > max || Number(control.value) < min;
      if (index === 0 && !forbidden) {
        if (Number(control.value) % 1 !== 0) { // Shouldn't input decimal number for Arch number.
          msg = `Please enter an integer in [${min}, ${max}].`;
          forbidden = true;
        }
      }
      if (index === 2 || index === 3) {
        msg = `Please enter a number in (${min}, ${max}).`;
        forbidden = (Number(control.value).toString() === 'NaN') || Number(control.value) >= max || Number(control.value) <= min;
       }
      return forbidden ? {'limit': {
        index: index, min: min, max: max, value: control.value,
        msg: msg
      }} : null;
    };
  }

  private limitValidator1(min: number, max: number, index: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!!control.value === false) { return null; }
      const forbidden = (Number(control.value).toString() === 'NaN') || Number(control.value) >= max || Number(control.value) <= min;
      return forbidden ? {'limit1': {index: index, min: min, max: max, value: control.value}} : null;
    };
  }
}
