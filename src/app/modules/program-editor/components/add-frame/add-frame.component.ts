import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  WebsocketService,
  CoordinatesService,
  DataService,
  MCQueryResponse,
} from '../../../core';

@Component({
  selector: 'app-add-frame',
  templateUrl: './add-frame.component.html',
  styleUrls: ['./add-frame.component.css'],
})
export class AddFrameComponent implements OnInit {
  name: string;
  values: any[];
  isArray: boolean = false;
  arrSize: number = 0;

  constructor(
    public dialogRef: MatDialogRef<AddFrameComponent>,
    public coos: CoordinatesService,
    private ws: WebsocketService,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: number
  ) {}

  ngOnInit() {
    this.values = ['0', '0', '0', '0', '0', '0'];
  }

  closeDialog(result?: boolean) {
    this.dialogRef.close(result);
  }

  add() {
    const name = this.isArray
      ? this.name + '[' + this.arrSize + ']'
      : this.name;
    let value: string = '';
    if (!this.isArray) {
      value = this.values.slice(0, this.coos.joints.length).join(',');
    }
    let cmd: string = '?TP_ADD_FRAME("';
    switch (this.data) {
      case 0:
        cmd += 'TOOL';
        break;
      case 1:
        cmd += 'BASE';
        break;
      case 2:
        cmd += 'MT';
        break;
      case 3:
        cmd += 'WP';
        break;
    }
    cmd +=
      '","' +
      name +
      '","' +
      this.dataService.selectedRobot +
      '","' +
      value +
      '")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        console.log(ret);
      } else {
        this.closeDialog(true);
      }
    });
  }
}
