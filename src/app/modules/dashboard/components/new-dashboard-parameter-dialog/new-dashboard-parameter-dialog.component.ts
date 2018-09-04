import { Component, OnInit } from '@angular/core';
import {MatDialogRef, MatAutocompleteSelectedEvent} from '@angular/material';
import {FormControl} from '@angular/forms';
import {DashboardParam} from '../../services/dashboard.service';
import {ApiService} from '../../../../modules/core/services/api.service';

@Component({
  selector: 'app-new-dashboard-parameter-dialog',
  templateUrl: './new-dashboard-parameter-dialog.component.html',
  styleUrls: ['./new-dashboard-parameter-dialog.component.css']
})
export class NewDashboardParameterDialogComponent implements OnInit {
  
  newParam: DashboardParam = new DashboardParam();
  ctrl: FormControl = new FormControl();
  filteredOptions: MCCommand[];
  
  private _params : MCCommand[];
  get params() {
    return this._params;
  }

  constructor(private api: ApiService, public ref : MatDialogRef<any>) {
    this.api.getMCProperties().then((ret: MCCommand[])=>{
      this._params = ret;
      this.ctrl.valueChanges.subscribe((ret)=>{
        this.filteredOptions = this.filter(ret);
      });
    });
  }
  
  onSelect(e:MatAutocompleteSelectedEvent) {
    this.newParam.name = e.option.value;
  }
  
  filter(name: string): MCCommand[] {
    return this._params.filter(option =>
      option.text.toLowerCase().indexOf(name.toLowerCase()) > -1);
  }

  ngOnInit() {
  }
  
  add() {
    this.ref.close(this.newParam);
  }

}

interface MCCommand {
  text : string;
  value : string;
}
