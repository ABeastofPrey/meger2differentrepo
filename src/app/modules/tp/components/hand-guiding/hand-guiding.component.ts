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
  j1 = false;
  j2 = false;

  constructor(
    private ws: WebsocketService
  ) {}

  async ngOnInit() {
    const ret = await this.ws.query('?TP_GET_SFREE_MODE');
    this.mode = ret.result === '1';
    this.refreshBreakes();
  }

  private async refreshBreakes() {
    const ret = await this.ws.query('?TP_GET_SFREE_BRAKE');
    switch (ret.result) {
      case '0':
        this.j1 = false;
        this.j2 = false;
        break;
      case '1':
        this.j1 = true;
        this.j2 = false;
        break;
      case '2':
        this.j1 = false;
        this.j2 = true;
        break;
      case '3':
        this.j1 = true;
        this.j2 = true;
        break;
      default:
        break;
    }
  }

  async onSfreeChange(mode: MatSlideToggleChange) {
    const cmd = mode.checked ? '?TP_SET_SFREE_MODE' : '?TP_RESET_SFREE_MODE';
    this.mode = mode.checked;
    const ret = await this.ws.query(cmd);
    if (ret.result !== '0') {
      this.mode = !mode.checked;
    }
    await this.refreshBreakes();
  }

  async onChange(axis: number, mode: MatSlideToggleChange) {
    const cmd = `call TP_SET_SFREE_BRAKE(${axis},${mode.checked ? 1 : 0})`;
    if (axis === 1) {
      this.j1 = mode.checked;
    } else if (axis === 2) {
      this.j2 = mode.checked;
    }
    await this.ws.query(cmd);
  }

}
