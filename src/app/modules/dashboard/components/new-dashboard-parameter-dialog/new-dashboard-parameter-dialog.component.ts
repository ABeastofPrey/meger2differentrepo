import { DOCS } from './../../../core/defs/docs.constants';
import { Component, OnInit, Inject } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { DashboardParam } from '../../services/dashboard.service';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-new-dashboard-parameter-dialog',
  templateUrl: './new-dashboard-parameter-dialog.component.html',
  styleUrls: ['./new-dashboard-parameter-dialog.component.css'],
})
export class NewDashboardParameterDialogComponent implements OnInit {
  newParam: DashboardParam = new DashboardParam();
  ctrl: FormControl = new FormControl();
  filteredOptions: string[];

  private _params: string[];
  get params() {
    return this._params;
  }

  constructor(
    public ref: MatDialogRef<DashboardParam>,
    public cmn: CommonService,
    @Inject(MAT_DIALOG_DATA) private data: {isGroup: boolean }
  ) {
    let list = DOCS.element.map(el=>{
      return el.short || el.name;
    });
    if (this.data.isGroup) {
      list = list.concat(DOCS.group.map(g=>{
        return g.short || g.name;
      }));
    } else {
      list = list.concat(DOCS.axis.map(a=>{
        return a.short || a.name;
      }));
    }
    this._params = list.sort();
    this.ctrl.valueChanges.subscribe(ret => {
      this.filteredOptions = this.filter(ret);
    });
  }

  onSelect(e: MatAutocompleteSelectedEvent) {
    this.newParam.name = e.option.value;
  }

  filter(name: string): string[] {
    return this._params.filter(option => {
      return option.toLowerCase().indexOf(name.toLowerCase()) > -1;
    });
  }

  verifyOption(name: string) {
    if (!this.cmn.isTablet) return true;
    return (
      this._params.filter(option => {
        return option.toLowerCase() === name.toLowerCase();
      }).length > 0
    );
  }

  ngOnInit() {}

  add() {
    this.ref.close(this.newParam);
  }

  get invalidSlider() {
    const min = this.newParam.sliderMin;
    const max = this.newParam.sliderMax;
    return min === null || max === null || min > max;
  }
}
