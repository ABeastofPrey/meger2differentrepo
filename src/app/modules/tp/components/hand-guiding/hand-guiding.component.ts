import { MatSlideToggleChange } from '@angular/material';
import { WebsocketService } from './../../../core/services/websocket.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hand-guiding',
  templateUrl: './hand-guiding.component.html',
  styleUrls: ['./hand-guiding.component.scss'],
})
export class HandGuidingComponent implements OnInit {

  mode = false;
  j3j4 = false;

  constructor(
    private ws: WebsocketService
  ) {}

  async ngOnInit() {
    let ret = await this.ws.query('?TP_GET_SFREE_MODE');
    this.mode = ret.result === '1';
    ret = await this.ws.query('?TP_GET_SFREE_BRAKE');
    this.j3j4 = ret.result === '1';
  }

  async onSfreeChange(mode: MatSlideToggleChange) {
    const cmd = mode.checked ? '?TP_SET_SFREE_MODE' : '?TP_RESET_SFREE_MODE';
    this.mode = mode.checked;
    const ret = await this.ws.query(cmd);
    if (ret.result !== '0') {
      this.mode = !mode.checked;
    }
  }

  async onJ3J4Change(mode: MatSlideToggleChange) {
    const cmd = `call TP_SET_SFREE_BRAKE(${mode.checked ? 1 : 0})`;
    this.j3j4 = mode.checked;
    await this.ws.query(cmd);
  }

}
