import { Component, OnInit } from '@angular/core';
import {
  MatDialogRef,
  ErrorStateMatcher,
} from '@angular/material';
import { HomeDialogService } from '../../../services/home-dialog.service';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  AbstractControl,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';
import { isEmpty, trim, ifElse, always, identity, compose } from 'ramda';
import { isTrue, isString } from 'ramda-adjunct';
import { Either } from 'ramda-fantasy';
import { TranslateService } from '@ngx-translate/core';

class ParameterErrorStateMatcher implements ErrorStateMatcher {
  static of(): ParameterErrorStateMatcher {
    return new this();
  }
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(
      control &&
      control.invalid &&
      (control.touched || (form && form.submitted))
    );
  }
}

const limitValidator = (min: number, max: number, msg: string): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: {} } | null => {
    if (!!control.value === false) {
      return null;
    }
    const _msg = `${msg} (${min}, ${max}].`;
    const forbidden =
      Number(control.value).toString() === 'NaN' ||
      Number(control.value) > max ||
      Number(control.value) <= min;
    return forbidden ? { limit: { msg: _msg } } : null;
  };
};
const handleNilandEmpty = ifElse(isString, trim, always('')); // Avoid user enter '    ' or ' 11  ';
const initialDefaultVal = ifElse(isEmpty, always('-1'), identity);
const handleVelocity = compose(
  initialDefaultVal,
  handleNilandEmpty
);

@Component({
  selector: 'app-home-dialog',
  templateUrl: './home-dialog.component.html',
  styleUrls: ['./home-dialog.component.scss'],
})
export class HomeDialogComponent implements OnInit {
  matcher = ParameterErrorStateMatcher.of();

  control: FormGroup = new FormGroup({
    velocity: new FormControl('', [])
  });
  
  private words: {};

  get errorMessage(): string {
    const ctrl = this.control.controls['velocity'];
    if (ctrl.hasError('limit')) {
      return ctrl.errors.limit.msg;
    }
  }

  get cannotInsert(): boolean {
    return isTrue(this.control.invalid);
  }

  constructor(
    public dialogRef: MatDialogRef<HomeDialogComponent>,
    private service: HomeDialogService,
    private trn: TranslateService
  ) {
    this.trn.get(['projectCommands.goHome']).subscribe(words => {
      this.words = words['projectCommands.goHome'];
    });
  }

  async ngOnInit(): Promise<void> {
    // Assemble control.
    Either.either(
      err => console.warn('Retrieve maxmum of velocity failed: ' + err),
      max => {
        const ctrl = this.control.controls['velocity'];
        ctrl.setValidators(limitValidator(0, 100, this.words['numRange']));
        ctrl.markAsTouched();
      }
    )(await this.service.retrieveVelocityMax());
  }

  emitCmd(): void {
    if (this.cannotInsert) return;
    const val = this.control.controls['velocity'].value as number;
    const velocity = handleVelocity(val.toString());
    this.dialogRef.close(`goHome(${velocity})`);
  }

  vscaleChange(value) {
    this.control.controls.velocity.patchValue(value);
  }
}
