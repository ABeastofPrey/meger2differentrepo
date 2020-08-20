import { WebsocketService } from './../../../core/services/websocket.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cabinet-update-dialog',
  templateUrl: './cabinet-update-dialog.component.html',
  styleUrls: ['./cabinet-update-dialog.component.css']
})
export class CabinetUpdateDialogComponent implements OnInit {

  constructor(private ws: WebsocketService) { }

  private _interval;
  private _enabled;

  ngOnInit() {
    this._interval = setInterval(async()=>{
      this._enabled = (await this.ws.query('?en')).result === '1';
    },500);
  }

  ngOnDestroy() {
    clearInterval(this._interval);
  }
  

  get isDisabled() {
    return this._enabled;
  }

}
