import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Pallet } from '../../../../core/models/pallet.model';
import {
  WebsocketService,
  DataService,
  MCQueryResponse,
} from '../../../../core';
import { ProgramEditorService } from '../../../services/program-editor.service';

@Component({
  selector: 'app-pallet-picker-dialog',
  templateUrl: './pallet-picker-dialog.component.html',
  styleUrls: ['./pallet-picker-dialog.component.css'],
})
export class PalletPickerDialogComponent implements OnInit {
  robot: string = null;
  robots: string[];

  private _pallet: Pallet = null;

  get pallet() {
    return this._pallet;
  }
  set pallet(val: Pallet) {
    this._pallet = val;
    this.prg.lastPallet = val;
  }

  constructor(
    private ws: WebsocketService,
    public dialogRef: MatDialogRef<PalletPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      pickRobot: boolean
    },
    public dataService: DataService,
    private prg: ProgramEditorService
  ) {
    if (this.prg.lastPallet) this._pallet = this.prg.lastPallet;
    else if (this.dataService.pallets.length === 1) {
      this.pallet = this.dataService.pallets[0];
 }
  }

  ngOnInit() {
    this.ws.query('?TP_GET_ROBOT_LIST').then((ret: MCQueryResponse) => {
      if (ret.err || ret.result.length === 0) return;
      this.robots = ret.result.split(',');
      if (this.robots.length === 1) this.robot = this.robots[0];
    });
  }

  insert() {
    this.dialogRef.close({
      robot: this.robot,
      pallet: this.pallet.name,
    });
  }
}
