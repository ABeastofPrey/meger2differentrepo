import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  WebsocketService,
  CoordinatesService,
  DataService,
  MCQueryResponse,
} from '../../../core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-frame',
  templateUrl: './add-frame.component.html',
  styleUrls: ['./add-frame.component.css'],
})
export class AddFrameComponent implements OnInit {
  name: FormControl = new FormControl('', [Validators.required, Validators.maxLength(32), Validators.pattern('[a-zA-Z]+(\\w*)$')]);
  values: Array<string | number>;
  isArray = false;
  arrSize = 1;

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

  get validateValues() : boolean {
    if (this.isArray) return true;
    return !this.values.some(v=>v.toString().trim() === '');
  }

  add() {
    const name = this.isArray
      ? this.name.value + '[' + this.arrSize + ']'
      : this.name.value;
    let value = '';
    if (!this.isArray) {
      value = this.values.slice(0, this.coos.joints.length).join(',');
    }
    let cmd = '?TP_ADD_FRAME("';
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
      default:
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
