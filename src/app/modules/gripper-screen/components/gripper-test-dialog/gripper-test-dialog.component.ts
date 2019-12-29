import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DataService, WebsocketService, MCQueryResponse } from '../../../core';

@Component({
  selector: 'app-gripper-test-dialog',
  templateUrl: './gripper-test-dialog.component.html',
  styleUrls: ['./gripper-test-dialog.component.css'],
})
export class GripperTestDialogComponent implements OnInit {
  
  private interval: number = null;
  
  time = 5;
  duty = 50;
  status = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      dOut: number,
      ef: string,
      grp: string
    },
    public dataService: DataService,
    private ws: WebsocketService
  ) {}

  ngOnInit() {
    const time = localStorage.getItem('gripperCycleTime');
    if (time) {
      this.time = Number(time);
    }
    this.interval = window.setInterval(() => {
      this.ws
        .query('?sys.dout.dout::' + this.data.dOut)
        .then((ret: MCQueryResponse) => {
          this.status = ret.result === '1';
        });
    }, 200);
  }
  
  ngOnDestroy() {
    clearInterval(this.interval);
    this.interval = null;
  }

  open() {
    this.ws.query(
      'GRP_OPEN_GRIPPER("' + this.data.ef + '","' + this.data.grp + '")'
    );
  }

  close() {
    this.ws.query(
      'GRP_CLOSE_GRIPPER("' + this.data.ef + '","' + this.data.grp + '")'
    );
  }

  cycle() {
    const cmd =
      'GRP_RUN_CYCLE_TEST(' +
      this.time +
      ',"' +
      this.data.ef +
      '","' +
      this.data.grp +
      '")';
    this.ws.query(cmd);
  }

  onCycleChange() {
    localStorage.setItem('gripperCycleTime', '' + this.time);
  }
}
