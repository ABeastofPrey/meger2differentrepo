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
  ctrlLx = this.initCtrl();

  get advanced() {
    return this._advanced;
  }
  set advanced(val: boolean) {
    this._advanced = val;
    if (val) {
      this.ctrlMass.disable();
      this.ctrlInertia.disable();
      this.ctrlLx.disable();
    } else {
      this.ctrlMass.enable();
      this.ctrlInertia.enable();
      this.ctrlLx.enable();
    }
  }

  private _advanced: boolean = false;
  private words: any;

  constructor(
    public data: DataService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private trn: TranslateService,
    public login: LoginService,
    private stat: TpStatService
  ) {
    this.trn
      .get(['payloads', 'button.delete', 'button.cancel', 'changeOK'])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {
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
          no: dialogText['cancel'],
          caution: true,
        },
      })
      .afterClosed()
      .subscribe(ret => {
        if (!ret) return;
        this.startIdent();
      });
  }

  private startIdent() {
    this.stat.mode = 'T2';
    const cmd = '?PAY_START("' + this.selectedPayload.name + '")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
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
        dialog.afterClosed().subscribe(ret => {
          if (ret) {
            this.data.refreshPayloads();
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
              }
            });
        }, 1000);
      }
    });
  }

  newPayload() {
    let ref = this.dialog.open(NewPayloadDialogComponent);
    ref.afterClosed().subscribe((name: string) => {
      name = name.toUpperCase();
      if (name) {
        this.ws
          .query('?PAY_ASSIGN_PAYLOAD("' + name + '")')
          .then((ret: MCQueryResponse) => {
            if (ret.result === '0') {
              this.data.refreshPayloads().then(() => {
                for (let p of this.data.payloads) {
                  if (p.name === name) {
                    this.selectedPayload = p;
                    this.onPayloadChange();
                  }
                }
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
    let name = this.selectedPayload.name;
    /* GET PAYLOAD INFO */
    // FOR SCARA
    const promises: Promise<any>[] = [
      this.ws.query('?PAY_GET_MASS("' + name + '")'),
      this.ws.query('?PAY_GET_INERTIA("' + name + '")'),
      this.ws.query('?PAY_GET_LX("' + name + '")'),
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
        this.ws.query('?PAY_GET_LX("'+name+'")'),
      ];*/
    Promise.all(promises).then((results: MCQueryResponse[]) => {
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
      this.selectedPayload.Lx = Number(results[2].result);
      this.ctrlLx.setValue(this.selectedPayload.Lx);
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
      if (ret.result === '0')
        this.snack.open('Changes Saved', '', { duration: 1500 });
    });
  }

  onMassChange(e: any) {
    const newVal = e.target.value;
    const oldVal = this.selectedPayload.mass;
    const cmd =
      '?PAY_SET_MASS("' + this.selectedPayload.name + '",' + newVal + ')';
    this.selectedPayload.mass = newVal;
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) this.selectedPayload.mass = oldVal;
      else this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  onInertiaChange(e: any) {
    const newVal = e.target.value;
    const oldVal = this.selectedPayload.inertia;
    const cmd =
      '?PAY_SET_INERTIA("' + this.selectedPayload.name + '",' + newVal + ')';
    this.selectedPayload.inertia = newVal;
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) this.selectedPayload.inertia = oldVal;
      else this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  onXOffsetChange(e: any) {
    const newVal = e.target.value;
    const oldVal = this.selectedPayload.Lx;
    const cmd =
      '?PAY_SET_LX("' + this.selectedPayload.name + '",' + newVal + ')';
    this.selectedPayload.Lx = newVal;
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) this.selectedPayload.Lx = oldVal;
      else this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  onMaxPosChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_max : pay.j6_max;
    const cmd = '?PAY_SET_IDENT_MAXPOS(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0')
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  onMinPosChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_min : pay.j6_min;
    const cmd = '?PAY_SET_IDENT_MINPOS(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0')
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  onVelChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_ident_vel : pay.j6_ident_vel;
    const cmd = '?PAY_SET_IDENT_OVRDVEL(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0')
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  onTimeChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_ident_time : pay.j6_ident_time;
    const cmd = '?PAY_SET_IDENT_TIME(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result === '0')
        this.snack.open(this.words['changeOK'], '', { duration: 1500 });
    });
  }

  ident(axis: number) {
    this.ws.query('call tp_identification(' + axis + ')');
  }
}
