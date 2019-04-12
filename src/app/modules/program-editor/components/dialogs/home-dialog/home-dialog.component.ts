import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import { HomeDialogService } from '../../../services/home-dialog.service';
import { FormControl, FormGroupDirective, NgForm, AbstractControl, ValidatorFn } from '@angular/forms';
import { isEmpty, trim, ifElse, always, identity, compose } from 'ramda';
import { isTrue, isString } from 'ramda-adjunct';
import { Either } from 'ramda-fantasy';
import { TranslateService } from '@ngx-translate/core';

class ParameterErrorStateMatcher implements ErrorStateMatcher {
    static of(): ParameterErrorStateMatcher { return new this(); }
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control && control.invalid && (control.touched || (form && form.submitted)));
    }
}

const limitValidator = (min: number, max: Number, msg: string): ValidatorFn => {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!!control.value === false) { return null; }
        const _msg = `${msg} (${min}, ${max}].`;
        let forbidden = (Number(control.value).toString() === 'NaN') || Number(control.value) > max || Number(control.value) <= min;
        return forbidden ? { 'limit': { msg: _msg } } : null;
    };
};
const assembleControl = (min: number, max: number, msg: string) => new FormControl('', [limitValidator(min, max, msg)]);
const handleNilandEmpty = ifElse(isString, trim, always('')); // Avoid user enter '    ' or ' 11  ';
const initialDefaultVal = ifElse(isEmpty, always('-1'), identity);
const handleVelocity = compose(initialDefaultVal, handleNilandEmpty);

@Component({
    selector: 'app-home-dialog',
    templateUrl: './home-dialog.component.html',
    styleUrls: ['./home-dialog.component.scss']
})
export class HomeDialogComponent implements OnInit {
    public matcher = ParameterErrorStateMatcher.of();
    public control: FormControl = new FormControl('', []);
    public velocity: string;
    private words: any;

    public get errorMessage(): string {
        if (this.control.hasError('limit')) {
            return this.control.errors.limit.msg;
        }
    }

    public get cannotInsert(): boolean {
        return isTrue(this.control.invalid);
    }

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<any>,
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
            max => this.control = assembleControl(0, max, this.words['numRange'])
        )(await this.service.retrieveVelocityMax());
    }

    public emitCmd(): void {
        const velocity = handleVelocity(this.velocity);
        this.dialogRef.close(`goHome(${velocity})`);
    }
}
