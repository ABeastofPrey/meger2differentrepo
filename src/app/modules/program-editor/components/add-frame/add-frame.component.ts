import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  WebsocketService,
  CoordinatesService,
  DataService,
  MCQueryResponse,
} from '../../../core';
import { FormControl, Validators } from '@angular/forms';
import { FrameTypes } from '../../../../modules/core/models/frames';

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
  ) { }

  ngOnInit() {
    this.values = [0, 0, 0, 0, 0, 0];
  }

  closeDialog(result?: { name: string }) {
    this.dialogRef.close(result);
  }

  get validateValues(): boolean {
    if (this.isArray) return true;
    const ret = this.values.some(v => v === null || v.toString().trim().length === 0);
    return !ret;
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
      case FrameTypes.TOOL:
        cmd += 'TOOL';
        break;
      case FrameTypes.BASE:
        cmd += 'BASE';
        break;
      case FrameTypes.MT:
        cmd += 'MT';
        break;
      case FrameTypes.WP:
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
        this.closeDialog({ name: name });
      }
    });
  }

  public change(value: string): void {
      this.name.setValue(value);
      this.name.markAsTouched();
  }
}
