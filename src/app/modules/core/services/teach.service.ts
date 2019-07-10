import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { TPVariable } from '../../core/models/tp/tp-variable.model';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { TPVariableType } from '../../core/models/tp/tp-variable-type.model';
import {
  FOUR_AXES_LOCATION,
  SIX_AXES_LOCATION,
} from '../../core/models/tp/location-format.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TeachService {
  private _selectedTeachVariable: TPVariable;
  private _selectedTeachVariableIndex: number;
  private _value: any = [];
  private _legend: string[];
  private _fullName: string;

  private words: any;

  get legend() {
    return this._legend;
  }
  get fullName() {
    return this._fullName;
  }

  set value(val) {
    this._value = val;
  }
  get value() {
    return this._value;
  }

  get selectedTeachVariable() {
    return this._selectedTeachVariable;
  }
  set selectedTeachVariable(val) {
    if (val) {
      if (
        this._selectedTeachVariable &&
        val.name !== this._selectedTeachVariable.name
      ) {
        this._selectedTeachVariableIndex = null;
      }
      this._selectedTeachVariable = val;
      if (val.isArr && this._selectedTeachVariableIndex === null) {
        this._value = [];
        this._fullName = null;
        return;
      }
      var name = val.isArr
        ? val.name + '[' + this._selectedTeachVariableIndex + ']'
        : val.name;
      if (this._fullName !== name) {
        this._value = [];
        this._fullName = name;
      }
      this.ws
        .query('?tp_get_value_namespace("' + this._fullName + '")')
        .then((ret: MCQueryResponse) => {
          if (ret.err) {
            return;
          }
          var valuesString = ret.result;
          if (valuesString.indexOf('#') === 0)
            valuesString = valuesString.substr(1);
          if (valuesString.indexOf(',') === -1) {
            this._legend = ['value'];
            this._value = [{ value: valuesString.trim() }];
            return;
          }
          var values = valuesString
            .substr(1, valuesString.length - 2)
            .split(',');
          var newLegend = [];
          for (var i = 0; i < values.length; i++) {
            this.value[i] = { value: values[i].trim() };
            if (val.varType === TPVariableType.JOINT)
              newLegend.push('J' + (i + 1));
          }
          if (newLegend.length === 0) {
            switch (val.varType) {
              case TPVariableType.LOCATION:
                newLegend =
                  values.length === 4 ? FOUR_AXES_LOCATION : SIX_AXES_LOCATION;
                break;
              default:
                newLegend.push('value');
            }
          }
          this._legend = newLegend;
        });
    } else {
      this._fullName = null;
      this.value = [];
    }
  }
  get selectedTeachVariableIndex() {
    return this._selectedTeachVariableIndex;
  }
  set selectedTeachVariableIndex(val) {
    this._selectedTeachVariableIndex = val;
    this.selectedTeachVariable = this.selectedTeachVariable;
  }

  reset() {
    this._selectedTeachVariable = null;
    this._selectedTeachVariableIndex = null;
    this.value = [];
    this._fullName = null;
    this._legend = [];
  }

  teach() {
    if (this.fullName == null) return;
    var cmd_teach =
      '?tp_teach("' +
      this.fullName +
      '","' +
      this._selectedTeachVariable.typeStr +
      '")';
    this.ws.query(cmd_teach).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        setTimeout(() => {
          this.selectedTeachVariableIndex = this.selectedTeachVariableIndex;
        }, 200);
      }
    });
  }

  constructor(
    private ws: WebsocketService,
    private snackBar: MatSnackBar,
    private trn: TranslateService
  ) {
    this.trn.get(['changeOK']).subscribe(words => {
      this.words = words;
    });
  }

  onKeyboardClose() {
    try {
      var position = '';
      for (var i = 0; i < this.value.length; i++) {
        position += this.value[i].value;
        if (i < this.value.length - 1) position += ',';
      }
      var cmd_set =
        '?tp_setpnt("' +
        this._fullName +
        '","' +
        this._selectedTeachVariable.typeStr +
        '","' +
        position +
        '")';
      this.ws.query(cmd_set).then((ret: MCQueryResponse) => {
        this.selectedTeachVariable = this.selectedTeachVariable;
        if (ret.result === '0')
          this.snackBar.open(this.words['changeOK'], null, { duration: 2000 });
        else console.log(ret.cmd + '>>>' + ret.result);
      });
    } catch (err) {
      console.log(err);
    }
  }

  move(straight: boolean) {
    if (this.fullName == null) return;
    if (straight) this.ws.send('?tp_moves("' + this.fullName + '")', true);
    else this.ws.send('?tp_move("' + this.fullName + '")', true);
  }

  stop() {
    this.ws.send('?tp_stop', true);
  }
}
