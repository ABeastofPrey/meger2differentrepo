import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { TPVariable } from '../../core/models/tp/tp-variable.model';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { TPVariableType } from '../../core/models/tp/tp-variable-type.model';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './data.service';
import {UtilsService} from '../../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';

@Injectable()
export class TeachService {
  private _selectedTeachVariable: TPVariable;
  private _selectedTeachVariableIndex: number;
  private _value: Array<{ value: number | string }> = [];
  private _legend: string[];
  private _fullName: string;

  private words: {};

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
      if (
        val.isArr &&
        (this._selectedTeachVariableIndex === null ||
          typeof this._selectedTeachVariableIndex === 'undefined')
      ) {
        this._value = [];
        this._fullName = null;
        return;
      }
      const name = val.isArr
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
          let valuesString = ret.result;
          if (valuesString.indexOf('#') === 0) {
            valuesString = valuesString.substr(1);
          }
          if (valuesString.indexOf(',') === -1) {
            this._legend = [this.words['value']];
            this._value = [{ value: valuesString.trim() }];
            return;
          }
          const parts: string[] = valuesString
            .substr(1, valuesString.length - 2)
            .split(';');
          const values = parts[0].split(',');
          const flags = parts[1] ? parts[1].split(',') : [];
          if (this.selectedTeachVariable.varType === TPVariableType.LOCATION) {
            const len = this.data.robotCoordinateType.flags.length;
            for (let i = flags.length; i < len; i++) {
              flags[i] = '0';
            }
          }
          const total = values.concat(flags);
          let newLegend: string[] = [];
          for (let i = 0; i < total.length; i++) {
            this._value[i] = { value: total[i].trim() };
            if (this.selectedTeachVariable.varType === TPVariableType.JOINT) {
              newLegend.push('J' + (i + 1));
            }
          }
          if (newLegend.length === 0) {
            switch (this.selectedTeachVariable.varType) {
              case TPVariableType.LOCATION:
                newLegend = this.data.robotCoordinateType.all;
                break;
              default:
                break;
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
    const cmdTeach = `?tp_teach("${this.fullName}","${this._selectedTeachVariable.typeStr}")`;
    this.ws.query(cmdTeach).then(ret => {
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
    private snackbarService: SysLogSnackBarService,
    private trn: TranslateService,
    private data: DataService,
    private utils: UtilsService,
  ) {
    this.trn.get(['changeOK']).subscribe(words => {
      this.words = words;
    });
    this.data.teachServiceNeedsReset.subscribe(() => {
      this.reset();
    });
  }

  onKeyboardClose() {
    try {
      const fullname = this._fullName;
      const val = this._value as Array<{ value: number }>;
      const size = Math.min(
        val.length,
        this.data.robotCoordinateType.legends.length
      );
      let value = val
        .slice(0, size)
        .map(v => {
          return v.value;
        })
        .join();
      if (this._selectedTeachVariable.varType === TPVariableType.LOCATION) {
        value +=
          ';' +
          val
            .slice(size)
            .map(v => {
              return v.value;
            })
            .join();
      }
      const cmd = '?TP_EDITVAR("' + fullname + '","' + value + '")';
      this.ws.query(cmd).then((ret: MCQueryResponse) => {
        console.log(cmd);
        this.selectedTeachVariable = this.selectedTeachVariable;
        if (ret.result === '0') {
            // this.snackBar.open(this.words['changeOK'], null, { duration: 2000 });
            this.snackbarService.openTipSnackBar("changeOK");
        }
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
