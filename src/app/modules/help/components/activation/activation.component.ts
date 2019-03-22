import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AES, MD5 } from 'crypto-js';
import { ActivationService } from './activation.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { compose, invoker, applySpec, identity, converge, then, bind, tap, equals, toLower, ifElse, anyPass } from 'ramda';
import { Either, IO } from 'ramda-fantasy';

@Component({
    selector: 'app-activation',
    templateUrl: './activation.component.html',
    styleUrls: ['./activation.component.scss']
})
export class ActivationComponent implements OnInit {
    public control = new FormControl('', [
        Validators.required,
        Validators.maxLength(6),
        Validators.minLength(6)
    ]);

    public url: string = 'https://www.baidu.com?token=abcdef';
    public machineId: string = '';
    public pinCode: string = '';
    private verficationCode: string = '';

    constructor(
        public dialogRef: MatDialogRef<any>,
        public snackBar: MatSnackBar,
        private service: ActivationService
    ) { }

    public get hasError(): boolean {
        const minLengthErr = invoker(1, 'hasError')('minlength');
        const maxLengthErr = invoker(1, 'hasError')('maxlength');
        const requiredErr = invoker(1, 'hasError')('required');
        const hasAnyErr = anyPass([minLengthErr, maxLengthErr, requiredErr]);
        return hasAnyErr(this.control);
    }

    async ngOnInit(): Promise<void> {
        await this.retriveIDandEncryptRouteParameter();
    }

    public verify(): void {
        const lowerVCode = toLower(this.verficationCode);
        const lowerPCode = toLower(this.pinCode);
        const isVerified: boolean = equals(lowerVCode);
        const closeDialog = () => this.dialogRef.close(this.machineId);
        const promptSnack = () => this.snackBar.open('Captcha is not correct!', '', { duration: 2000 });
        const doVerify = ifElse(isVerified, closeDialog, promptSnack);
        doVerify(lowerPCode);
    }

    private retriveIDandEncryptRouteParameter(): string {
        const saveId = id => this.machineId = id;
        const assembleUrl = kukaPar => this.url += `&kuka=${kukaPar}`;
        const bindService = bind(this.service.getMachineId, this.service);
        const errIO = err => IO(() => console.warn('Retrieve machine ID failed: ' + err));
        const runErrIO = compose(IO.runIO, errIO);
        const encrypt = compose(tap(assembleUrl), this.encryptRouteParameter.bind(this), tap(saveId));
        const logOrEncrypt = Either.either(runErrIO, encrypt);
        const doIt = compose(then(logOrEncrypt), bindService);
        return doIt();
    }

    private encryptRouteParameter(machineId: string): string {
        const saveCode = kuka => this.verficationCode = kuka.verificationCode;
        const toString = invoker(0, 'toString');
        const sliceStr = invoker(2, 'substring')(5, 9);
        const aesEncrypt = x => AES.encrypt(x, 'kuka');
        const random1to9 = () => Math.floor(Math.random() * 10);
        const md5Code = compose(sliceStr, toString, MD5);
        const randomWithMd5 = id => random1to9() + md5Code(id) + random1to9();
        const getKukaInfo = converge(applySpec({
            machineId: identity,
            verificationCode: randomWithMd5
        }), [identity, identity]);
        const encrypt = compose(toString, aesEncrypt, JSON.stringify, tap(saveCode), getKukaInfo);
        return encrypt(machineId);
    }
}
