import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Pallet } from '../../../../core/models/pallet.model';
import { DataService } from '../../../../core';
import { ProgramEditorService } from '../../../services/program-editor.service';

@Component({
  selector: 'app-pallet-index-dialog',
  templateUrl: './pallet-index-dialog.component.html',
  styleUrls: ['./pallet-index-dialog.component.css'],
})
export class PalletIndexDialogComponent implements OnInit {
  option: string = null;

  private _pallet: Pallet = null;

  get pallet() {
    return this._pallet;
  }
  set pallet(val: Pallet) {
    this._pallet = val;
    this.prg.lastPallet = val;
  }

  constructor(
    public dialogRef: MatDialogRef<any>,
    public dataService: DataService,
    private prg: ProgramEditorService
  ) {
    if (this.prg.lastPallet) this._pallet = this.prg.lastPallet;
    else if (this.dataService.pallets.length === 1)
      this.pallet = this.dataService.pallets[0];
  }

  ngOnInit() {}

  isNumberInvalid(num: number): boolean {
    return isNaN(num) || num.toString().length === 0;
  }

  insert() {
    let cmd: string = null;
    switch (this.option) {
      case 'custom':
        cmd =
          'PLT_SET_INDEX_STATUS("' +
          this.pallet.name +
          '",' +
          this.pallet.index +
          ')';
        break;
      case 'full':
        cmd = 'PLT_SET_INDEX_STATUS_FULL("' + this.pallet.name + '")';
        break;
      case 'empty':
        cmd = 'PLT_SET_INDEX_STATUS_EMPTY("' + this.pallet.name + '")';
        break;
    }
    this.dialogRef.close(cmd);
  }
}
