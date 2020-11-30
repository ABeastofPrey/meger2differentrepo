import { Component, OnInit, Inject } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';

@Component({
  selector: 'app-single-input-dialog',
  templateUrl: './single-input-dialog.component.html',
  styleUrls: ['./single-input-dialog.component.css'],
})
export class SingleInputDialogComponent implements OnInit {

  matcher = new LiveErrorMatcher();

  dialogForm = new FormGroup({
    val: new FormControl('',[])
  });

  constructor(
    private dialogRef: MatDialogRef<SingleInputDialogComponent, string | number>,
    @Inject(MAT_DIALOG_DATA) public data: {
      initialValue?: string | number,
      icon?: string,
      title: string,
      placeholder: string,
      type?: string,
      suffix?: string,
      accept: string,
      regex?: string,
      maxLength?: number,
      minLength?: number,
      letterAndNumber?: boolean,
      nameRules?: boolean,
      password?: boolean
    }
  ) {}

  ngOnInit() {
    if (this.data.initialValue) {
      this.dialogForm.controls['val'].setValue(this.data.initialValue);
    }
    const validators = [Validators.required];
    if (this.data.regex) {
      validators.push(Validators.pattern(this.data.regex));
    }
    if (this.data.maxLength) {
      validators.push(Validators.maxLength(this.data.maxLength));
    }
    if (this.data.minLength) {
      validators.push(Validators.minLength(this.data.minLength));
    }
    this.dialogForm.controls['val'].setValidators(validators);
  }

  create() {
    if (this.dialogForm.invalid) return;
    const val = this.dialogForm.controls['val'].value;
    this.dialogRef.close(val);
  }

  change(value: string): void {
      this.dialogForm.controls.val.setValue(value);
      this.dialogForm.controls.val.markAsTouched();
  }
}

class LiveErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}