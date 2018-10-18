import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {DataService, WebsocketService} from '../../../core';

@Component({
  selector: 'app-gripper-test-dialog',
  templateUrl: './gripper-test-dialog.component.html',
  styleUrls: ['./gripper-test-dialog.component.css']
})
export class GripperTestDialogComponent implements OnInit {
  
  time : number = 5;
  duty : number = 50;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService : DataService,
    private ws: WebsocketService
  ) { }

  ngOnInit() {
  }
  
  open() {
    this.ws.query('?GRP_OPEN_GRIPPER("'+this.data.ef+'","'+this.data.grp+'")');
  }
  
  close() {
    this.ws.query('?GRP_CLOSE_GRIPPER("'+this.data.ef+'","'+this.data.grp+'")');
  }
  
  cycle() {
    const cmd = '?GRP_RUN_CYCLE_TEST(' + this.time + ',"' +
                this.data.ef + '","' + this.data.grp + '")';
    this.ws.query(cmd);
  }

}
