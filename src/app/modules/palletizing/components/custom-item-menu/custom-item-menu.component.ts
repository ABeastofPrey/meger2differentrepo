import { CustomPalletItem } from './../pallet-level-designer/pallet-level-designer.component';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-custom-item-menu',
  templateUrl: './custom-item-menu.component.html',
  styleUrls: ['./custom-item-menu.component.css'],
})
export class CustomItemMenuComponent implements OnInit {
  constructor(
    private ref: MatDialogRef<number>,
    @Inject(MAT_DIALOG_DATA) public data: {
      order: number,
      items: CustomPalletItem[]
    }
  ) {}

  delete() {
    this.ref.close({
      action: 1,
    });
  }

  orderChange(e: MatSelectChange) {
    this.ref.close({
      action: 2,
      newVal: e.value,
    });
  }

  ngOnInit() {}
}
