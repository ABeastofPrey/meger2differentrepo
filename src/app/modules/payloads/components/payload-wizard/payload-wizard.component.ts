import { CommonService } from './../../../core/services/common.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NewPayloadDialogComponent } from '../new-payload-dialog/new-payload-dialog.component';
import {
  DataService,
  WebsocketService,
  MCQueryResponse,
  LoginService,
  TpStatService,
} from '../../../core';
import { Payload } from '../../../core/models/payload.model';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { IdentDialogComponent } from '../ident-dialog/ident-dialog.component';

@Component({
  selector: 'app-payload-wizard',
  templateUrl: './payload-wizard.component.html',
  styleUrls: ['./payload-wizard.component.css'],
})
export class PayloadWizardComponent implements OnInit {

  selectedPayload: Payload = null;
  currPayloadString: string = null;
  ctrlMass = this.initCtrl();
  ctrlInertia = this.initCtrl();
  ctrllx = this.initCtrl();

  private currValuesInterval: number;

  get advanced() {
    return this._advanced;
  }
  set advanced(val: boolean) {
    this._advanced = val;
    if (val) {
      this.ctrlMass.disable();
      this.ctrlInertia.disable();
      this.ctrllx.disable();
    } else {
      this.ctrlMass.enable();
      this.ctrlInertia.enable();
      this.ctrllx.enable();
    }
  }

  private _advanced = false;
  private words: {};

  constructor(
    public data: DataService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private trn: TranslateService,
    public login: LoginService,
    private stat: TpStatService,
    private cmn: CommonService
  ) {
    this.trn
      .get(['payloads', 'button.delete', 'button.cancel', 'changeOK'])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {
    this.currValuesInterval = window.setInterval(()=>{
      this.getCurrentValues();
    },1000);
  }

  ngOnDestroy() {
    clearInterval(this.currValuesInterval);
  }

  private getCurrentValues() {
    this.ws
      .query('?pay_get_current_values(' + this.data.selectedRobot + ')')
      .then((ret: MCQueryResponse) => {
        if (ret.err) return;
        const parts = ret.result.split(',');
        if (parts.length !== 3) return;
        this.currPayloadString =
          this.words['payloads']['current'] +
          ':<br>' +
          '<b>' +
          this.words['payloads']['mass'] +
          ':</b> ' +
          parts[0] +
          '<br>' +
          '<b>' +
          this.words['payloads']['inertia'] +
          ':</b> ' +
          parts[1] +
          '<br>' +
          '<b>' +
          this.words['payloads']['offX'] +
          ':</b> ' +
          parts[2];
      });
  }

  private initCtrl(): FormControl {
    return new FormControl(
      {
        disabled: this.login.isOperator,
      },
      [Validators.min(0)]
    );
  }

  showIdentDialog() {
    const dialogText = this.words['payloads']['ident']['dialog'];
    this.dialog
      .open(YesNoDialogComponent, {
        maxWidth: '600px',
        data: {
          title: dialogText['title'],
          msg: dialogText['msg'],
          yes: dialogText['yes'],
          no: dialogText['no'],
          caution: true,
        },
      })
      .afterClosed()
      .subscribe(ret => {
        if (!ret) return;
        this.startIdent();
      });
  }

  private async startIdent() {
    if (!this.cmn.isTablet) {
      await this.stat.setMode('T2');
    }
    if (this.stat.mode !== 'T2') return;
    const cmd = '?PAY_START("' + this.selectedPayload.name + '")';
    const ret = await this.ws.query(cmd);
    if (ret.result === '0') {
      const dialog = this.dialog.open(IdentDialogComponent, {
        disableClose: true,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        closeOnNavigation: false,
        data: {
          duration: this.data.payloadDuration,
        },
        id: 'update',
      });
      dialog.afterClosed().subscribe(async ret => {
        if (ret) {
          await this.data.refreshPayloads();
          this.selectedPayload = this.data.payloads.find(p=>{
            return p.name === this.selectedPayload.name;
          });
          await this.onPayloadChange();
          this.snack.open(this.words['payloads']['done'], '', { duration: 1500 });
        }
      });
      const interval = setInterval(() => {
        this.ws
          .query('?PAY_GET_IDENT_STATUS')
          .then((ret: MCQueryResponse) => {
            const val = Number(ret.result);
            switch (val) {
              case 1: // DONE
                clearInterval(interval);
                dialog.close(true);
                break;
              case 2: // RUNNING
                dialog.componentInstance.start();
                break;
              case 3: // PROCESSING
                break;
              case 4: // ERROR
                clearInterval(interval);
                dialog.close(false);
                break;
              case 5: // NOT STARTED
                clearInterval(interval);
                dialog.close(false);
                break;
              case 6: // MOVING TO START
                break;
              case 7: // MOVING TO ORIGINAL POSITION
                dialog.componentInstance.finish();
                break;
              default:
                console.log('invalid value:' + val);
                clearInterval(interval);
                break;
            }
          });
      }, 1000);
    }
  }

  newPayload() {
    this.dialog.open(NewPayloadDialogComponent).afterClosed().subscribe((name: string) => {
      name = name.toUpperCase();
      if (name) {
        this.ws
          .query('?PAY_ASSIGN_PAYLOAD("' + name + '")')
          .then((ret: MCQueryResponse) => {
            if (ret.result === '0') {
              this.data.refreshPayloads().then(() => {
                this.selectedPayload = this.data.payloads.find(p=>{
                  return p.name === name;
                });
                this.onPayloadChange();
              });
            }
          });
      }
    });
  }

  delete() {
    this.trn
      .get('payloads.delete_title', { name: this.selectedPayload.name })
      .subscribe(word => {
        this.dialog
          .open(YesNoDialogComponent, {
            data: {
              title: word,
              msg: this.words['payloads']['delete_msg'],
              yes: this.words['button.delete'],
              no: this.words['button.cancel'],
            },
          })
          .afterClosed()
          .subscribe(ret => {
            if (!ret) return;
            this.ws
              .query('?pay_reset_payload("' + this.selectedPayload.name + '")')
              .then((ret: MCQueryResponse) => {
                if (ret.result === '0') {
                  this.selectedPayload = null;
                  this.data.refreshPayloads();
                }
              });
          });
      });
  }

  onPayloadChange() {
    const name = this.selectedPayload.name;
    /* GET PAYLOAD INFO */
    // FOR SCARA
    const promises = [
      this.ws.query('?PAY_GET_MASS("' + name + '")'),
      this.ws.query('?PAY_GET_INERTIA("' + name + '")'),
      this.ws.query('?PAY_GET_lx("' + name + '")'),
    ];

    // FOR PUMA
    /*const promises : Promise<any>[] = [
        this.ws.query('?PAY_GET_REF_POSITION("'+name+'")'),
        this.ws.query('?PAY_GET_MASS("'+name+'")'),
        this.ws.query('?PAY_GET_IDENT_MAXPOS(5)'),
        this.ws.query('?PAY_GET_IDENT_MAXPOS(6)'),
        this.ws.query('?PAY_GET_IDENT_MINPOS(5)'),
        this.ws.query('?PAY_GET_IDENT_MINPOS(6)'),
        this.ws.query('?PAY_GET_IDENT_OVRDVEL(5)'),
        this.ws.query('?PAY_GET_IDENT_OVRDVEL(6)'),
        this.ws.query('?PAY_GET_IDENT_TIME(5)'),
        this.ws.query('?PAY_GET_IDENT_TIME(6)'),
        this.ws.query('?PAY_GET_INERTIA("'+name+'")'),
        this.ws.query('?PAY_GET_lx("'+name+'")'),
      ];*/
    return Promise.all(promises).then(results => {
      /*
      // PARSE REF POS
        const refString = results[0].result.substring(1, results[0].result.length-1);
        let refPos : position[] = [];
        for (let pos of refString.split(',')) {
          refPos.push({value: Number(pos)});
        }
        this.selectedPayload.refPos = refPos;*/
      this.selectedPayload.mass = Number(results[0].result);
      this.ctrlMass.setValue(this.selectedPayload.mass);
      /*this.selectedPayload.j5_max = Number(results[2].result);
        this.selectedPayload.j6_max = Number(results[3].result);
        this.selectedPayload.j5_min = Number(results[4].result);
        this.selectedPayload.j6_min = Number(results[5].result);
        this.selectedPayload.j5_ident_vel = Number(results[6].result);
        this.selectedPayload.j6_ident_vel = Number(results[7].result);
        this.selectedPayload.j5_ident_time = Number(results[8].result);
        this.selectedPayload.j6_ident_time = Number(results[9].result);*/
      this.selectedPayload.inertia = Number(results[1].result);
      this.ctrlInertia.setValue(this.selectedPayload.inertia);
      this.selectedPayload.lx = Number(results[2].result);
      console.log(this.selectedPayload);
      this.ctrllx.setValue(this.selectedPayload.lx);
    });
  }

  onRefPosChange() {
    const cmd =
      '?PAY_SET_REF_POSITION("' +
      this.selectedPayload.name +
      '","{' +
      this.selectedPayload.refPos
        .map(p => {
          return p.value;
        })
        .join(',') +
      '}")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }

  onMassChange(e: {target: {value: number}}) {
    const newVal = e.target.value;
    const oldVal = this.selectedPayload.mass;
    const cmd =
      '?PAY_SET_MASS("' + this.selectedPayload.name + '",' + newVal + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) {
        this.ctrlMass.setValue(oldVal);
      } else {
        this.selectedPayload.mass = newVal;
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }

  onInertiaChange(e: {target: {value: number}}) {
    const newVal = e.target.value;
    const oldVal = this.selectedPayload.inertia;
    const cmd =
      '?PAY_SET_INERTIA("' + this.selectedPayload.name + '",' + newVal + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) {
        this.ctrlInertia.setValue(oldVal);
      } else {
        this.selectedPayload.inertia = newVal;
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }

  onXOffsetChange(e: {target: {value: number}}) {
    const newVal = e.target.value;
    const oldVal = this.selectedPayload.lx;
    const cmd =
      '?PAY_SET_lx("' + this.selectedPayload.name + '",' + newVal + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) {
        this.ctrllx.setValue(oldVal);
      } else {
        this.selectedPayload.lx = newVal;
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }

  /*onMaxPosChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_max : pay.j6_max;
    const cmd = '?PAY_SET_IDENT_MAXPOS(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }

  onMinPosChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_min : pay.j6_min;
    const cmd = '?PAY_SET_IDENT_MINPOS(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }

  onVelChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_ident_vel : pay.j6_ident_vel;
    const cmd = '?PAY_SET_IDENT_OVRDVEL(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }

  onTimeChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_ident_time : pay.j6_ident_time;
    const cmd = '?PAY_SET_IDENT_TIME(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
      }
    });
  }*/

  ident(axis: number) {
    this.ws.query('call tp_identification(' + axis + ')');
  }
}
