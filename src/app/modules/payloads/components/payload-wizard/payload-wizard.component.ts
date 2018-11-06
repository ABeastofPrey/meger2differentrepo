import { Component, OnInit } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewPayloadDialogComponent} from '../new-payload-dialog/new-payload-dialog.component';
import {DataService, WebsocketService, MCQueryResponse} from '../../../core';
import {Payload, position} from '../../../core/models/payload.model';

@Component({
  selector: 'app-payload-wizard',
  templateUrl: './payload-wizard.component.html',
  styleUrls: ['./payload-wizard.component.css']
})
export class PayloadWizardComponent implements OnInit {
  
  selectedPayload: Payload = null;

  constructor(
    public data: DataService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
  }
  
  newPayload() {
    let ref = this.dialog.open(NewPayloadDialogComponent);
    ref.afterClosed().subscribe((name:string)=>{
      name = name.toUpperCase();
      if (name) {
        this.ws.query('?PAY_ASSIGN_PAYLOAD("' + name + '")')
        .then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.data.refreshPayloads().then(()=>{
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
    this.ws.query('?pay_reset_payload("' + this.selectedPayload.name + '")')
    .then((ret: MCQueryResponse)=>{
      if (ret.result === '0') {
        this.selectedPayload = null;
        this.data.refreshPayloads();
      }
    });
  }
  
  onPayloadChange() {
    let name = this.selectedPayload.name;
    /* GET PAYLOAD INFO */
    const promises : Promise<any>[] = [
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
    ];
    Promise.all(promises).then((results: MCQueryResponse[])=>{
      // PARSE REF POS
      const refString = results[0].result.substring(1, results[0].result.length-1);
      let refPos : position[] = [];
      for (let pos of refString.split(',')) {
        refPos.push({value: Number(pos)});
      }
      this.selectedPayload.refPos = refPos;
      this.selectedPayload.mass = Number(results[1].result);
      this.selectedPayload.j5_max = Number(results[2].result);
      this.selectedPayload.j6_max = Number(results[3].result);
      this.selectedPayload.j5_min = Number(results[4].result);
      this.selectedPayload.j6_min = Number(results[5].result);
      this.selectedPayload.j5_ident_vel = Number(results[6].result);
      this.selectedPayload.j6_ident_vel = Number(results[7].result);
      this.selectedPayload.j5_ident_time = Number(results[8].result);
      this.selectedPayload.j6_ident_time = Number(results[9].result);
    });
  }
  
  onRefPosChange() {
    const cmd = '?PAY_SET_REF_POSITION("' + this.selectedPayload.name + '","{' + 
      this.selectedPayload.refPos.map(p=>{return p.value;}).join(',') + '}")';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result === '0')
        this.snack.open('Changes Saved','',{duration:1500});
    });
  }
  
  onMassChange() {
    const cmd = '?PAY_SET_MASS("' + this.selectedPayload.name + '",' +
                this.selectedPayload.mass + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result === '0')
        this.snack.open('Changes Saved','',{duration:1500});
    });
  }
  
  onMaxPosChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_max : pay.j6_max;
    const cmd = '?PAY_SET_IDENT_MAXPOS(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result === '0')
        this.snack.open('Changes Saved','',{duration:1500});
    });
  }
  
  onMinPosChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_min : pay.j6_min;
    const cmd = '?PAY_SET_IDENT_MINPOS(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result === '0')
        this.snack.open('Changes Saved','',{duration:1500});
    });
  }
  
  onVelChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_ident_vel : pay.j6_ident_vel;
    const cmd = '?PAY_SET_IDENT_OVRDVEL(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result === '0')
        this.snack.open('Changes Saved','',{duration:1500});
    });
  }
  
  onTimeChange(i: number) {
    const pay = this.selectedPayload;
    const val = i === 5 ? pay.j5_ident_time : pay.j6_ident_time;
    const cmd = '?PAY_SET_IDENT_TIME(' + i + ',' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      if (ret.result === '0')
        this.snack.open('Changes Saved','',{duration:1500});
    });
  }
  
  ident(axis: number) {
    this.ws.query('call tp_identification('+axis+')');
  }

}
