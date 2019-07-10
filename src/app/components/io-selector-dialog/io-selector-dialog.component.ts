import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { WebsocketService, MCQueryResponse } from '../../modules/core';

@Component({
  selector: 'app-io-selector-dialog',
  templateUrl: './io-selector-dialog.component.html',
  styleUrls: ['./io-selector-dialog.component.css'],
})
export class IoSelectorDialogComponent implements OnInit {
  list: string[] = [];
  io: string = null;

  constructor(
    private ws: WebsocketService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    const cmd = this.data.inputs
      ? '?IOMAP_GET_All_SYS_IOS(1)'
      : '?IOMAP_GET_All_SYS_IOS(0)';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err) {
        return;
      }
      this.list = ret.result.length > 0 ? ret.result.split(',') : [];
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  insert() {
    if (this.io) this.dialogRef.close(this.io);
  }
}
