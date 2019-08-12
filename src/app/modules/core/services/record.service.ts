import { Injectable } from '@angular/core';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { DataService } from './data.service';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private timeout: any;
  private _isRecording: boolean = false;

  get recording() {
    return this._isRecording;
  }

  constructor(
    private ws: WebsocketService,
    private data: DataService,
    private snack: MatSnackBar
  ) {}

  toggle() {
    if (this._isRecording) {
      this.ws.query('RecordClose').then(() => {
        this.snack.open('Motion Recording finished!', null, { duration: 1500 });
      });
      clearTimeout(this.timeout);
      this._isRecording = false;
      return;
    }
    this.ws.query('?TP_GET_MOTION_ELEMENT_AXES_NAMES').then((ret: MCQueryResponse)=>{
      const axes = ret.result.split(',').map(a=>{
        return a + '.PFB'
      }).join();
      const cmd = 'Record CSRECORD.rec 120000 Gap=1 RecData=' + axes;
      this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
        this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
          if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
          this._isRecording = true;
          clearTimeout(this.timeout);
          this.timeout = setTimeout(() => {
            this._isRecording = false;
            this.snack.open('Motion Recording finished!', null, {
              duration: 1500,
            });
          }, 120000);
        });
      });
    });
  }
}
