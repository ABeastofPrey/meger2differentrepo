import { Component, OnInit } from '@angular/core';
import { MatDialogRef, ErrorStateMatcher } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import {
  isNil,
  or,
  gte,
  lte,
  converge,
  and,
  __,
  equals,
  anyPass,
  length,
  compose,
} from 'ramda';

class ParameterErrorStateMatcher implements ErrorStateMatcher {
  static of(): ParameterErrorStateMatcher {
    return new this();
  }

  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && control.touched);
  }
}

const gte24: (x: number) => boolean = gte(__, 24);
const gte65: (x: number) => boolean = gte(__, 65);
const lte90: (x: number) => boolean = lte(__, 90);
const gte48: (x: number) => boolean = gte(__, 48);
const lte57: (x: number) => boolean = lte(__, 57);
const gte96: (x: number) => boolean = gte(__, 96);
const lte105: (x: number) => boolean = lte(__, 105);
const isLetter: (keyCode: number) => boolean = converge(and, [gte65, lte90]);
const isNumber: (keyCode: number) => boolean = converge(or, [
  converge(and, [gte48, lte57]),
  converge(and, [gte96, lte105]),
]);
const isBackSpace: (keyCode: number) => boolean = equals(8);
const isOverLimit: (x: string) => boolean = compose(
  gte24,
  length
);
const isLegalInput: (keyCode: number) => boolean = anyPass([
  isBackSpace,
  isLetter,
  isNumber,
]);
const isPressShift: (keyCode: number) => boolean = equals(16);

@Component({
  templateUrl: './new-position-trigger.component.html',
  styleUrls: ['./new-position-trigger.component.scss'],
})
export class NewPositionTriggerComponent implements OnInit {
  public namePrefix = 'PT_';
  public name: string;
  public nameControl = new FormControl('', [Validators.required]);
  public nameMatcher = ParameterErrorStateMatcher.of();
  private pressingShift = false;

  constructor(public dialogRef: MatDialogRef<any>) {}

  public get canNotCreate(): boolean {
    return or(isNil(this.name), this.nameControl.hasError('required'));
  }

  ngOnInit(): void {}

  public close(): void {
    this.dialogRef.close(this.namePrefix + this.name);
  }

  public onKeyDown(keyCode: number): boolean {
    if (isOverLimit(this.name)) {
      if (isBackSpace(keyCode)) {
        return true;
      }
      return false;
    }
    // tslint:disable-next-line
    isPressShift(keyCode) && (this.pressingShift = true);
    if (this.pressingShift) {
      return isLetter(keyCode);
    } else {
      return isLegalInput(keyCode);
    }
  }

  public onKeyUp(keyCode: number): void {
    // tslint:disable-next-line
    isPressShift(keyCode) && (this.pressingShift = false);
  }
}
