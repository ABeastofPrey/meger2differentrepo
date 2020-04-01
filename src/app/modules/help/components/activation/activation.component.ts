import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivationService } from './activation.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import {
  compose, invoker, applySpec, identity, converge,
  toLower, ifElse, anyPass, then, bind, tap, equals,
} from 'ramda';
import { Either, IO } from 'ramda-fantasy';
import * as CryptoJS from 'crypto-js';

const venderUrl = 'https://wx1.kuka-robotics.cn/deviceactivation/';
const key = CryptoJS.enc.Utf8.parse('kukalbsqrcode123');
const iv = CryptoJS.enc.Utf8.parse('lbsqrcodekuka123');

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss'],
})
export class ActivationComponent implements OnInit {
  public control = new FormControl('', [
    Validators.required,
    Validators.maxLength(6),
    Validators.minLength(6)
  ]);

  public url = venderUrl;
  public pinCode = '';
  private machineId = '';
  private verficationCode = '';

  constructor(
    public dialogRef: MatDialogRef<ActivationComponent, string>,
    public snackBar: MatSnackBar,
    private service: ActivationService,
  ) { }

  get hasError(): boolean {
    const minLengthErr = invoker(1, 'hasError')('minlength');
    const maxLengthErr = invoker(1, 'hasError')('maxlength');
    const requiredErr = invoker(1, 'hasError')('required');
    const hasAnyErr = anyPass([minLengthErr, maxLengthErr, requiredErr]);
    return hasAnyErr(this.control);
  }

  ngOnInit(): void {
    this.retriveIDandEncryptRouteParameter();
  }

  verify(): void {
    const lowerVCode = toLower(this.verficationCode);
    const lowerPCode = toLower(this.pinCode);
    const isVerified: boolean = equals(lowerVCode);
    const closeDialog = () => this.dialogRef.close(this.machineId);
    const promptSnack = () => this.control.setErrors({ incorrectPinCode: {} });
    const doVerify = ifElse(isVerified, closeDialog, promptSnack);
    doVerify(lowerPCode);
  }

  private retriveIDandEncryptRouteParameter(): void {
    const saveId = id => (this.machineId = id);
    const assembleUrl = kukaPar => (this.url += `${kukaPar}`);
    const getMachineId = bind(this.service.getMachineId, this.service);
    const errIO = err => IO(() => console.warn('Retrieve machine ID failed: ' + err));
    const runErrIO = compose(IO.runIO, errIO);
    const encrypt = compose(tap(assembleUrl), this.encryptRouteParameter.bind(this), tap(saveId));
    const logOrEncrypt = Either.either(runErrIO, encrypt);
    const _retriveIDandEncryptRouteParameter = compose(then(logOrEncrypt), getMachineId);
    _retriveIDandEncryptRouteParameter();
  }

  private encryptRouteParameter(machineId: string): string {
    const aesEncrypt = rawText => {
      const parse2Utf8 = CryptoJS.enc.Utf8.parse(rawText);
      const aesOptions = { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Iso10126 };
      const aesEcrypted = CryptoJS.AES.encrypt(parse2Utf8, key, aesOptions);
      const convert2Base64 = CryptoJS.enc.Base64.stringify(aesEcrypted.ciphertext);
      return convert2Base64;
    };
    const saveCode = kuka => (this.verficationCode = kuka.verificationCode);
    const toString = invoker(0, 'toString');
    const sliceStr = invoker(2, 'substring')(5, 9);
    const random1to9 = () => Math.floor(Math.random() * 10);
    const md5Code = compose(sliceStr, toString, CryptoJS.MD5);
    const randomWithMd5 = id => random1to9() + md5Code(id) + random1to9();
    const getKukaInfo = converge(applySpec({ machineId: identity, verificationCode: randomWithMd5 }), [identity, identity]);
    const assembleVal = x => (`SN:${x.machineId},RUNTIME:0.00,ROBOT:SCARA,KEY:${x.verificationCode}`);
    const encrypt = compose(aesEncrypt, assembleVal, tap(saveCode), getKukaInfo);
    return encrypt(machineId);
  }
}
