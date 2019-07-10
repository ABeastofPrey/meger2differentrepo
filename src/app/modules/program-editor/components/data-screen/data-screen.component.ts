import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
  MatTableDataSource,
  MatSort,
  MatSnackBar,
  MatDialog,
} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TPVariable } from '../../../core/models/tp/tp-variable.model';
import {
  DataService,
  WebsocketService,
  LoginService,
  MCQueryResponse,
} from '../../../core';
import { TPVariableType } from '../../../core/models/tp/tp-variable-type.model';
import {
  FOUR_AXES_LOCATION,
  SIX_AXES_LOCATION,
} from '../../../core/models/tp/location-format.model';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { AddVarComponent } from '../add-var/add-var.component';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/internal/operators/take';

const BASE_COLS = ['select', 'name', 'typeStr', 'arrIndex'];
const SUFFIX_COLS = ['actions'];

@Component({
  selector: 'data-screen',
  templateUrl: './data-screen.component.html',
  styleUrls: ['./data-screen.component.css'],
})
export class DataScreenComponent implements OnInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input() useAsProjectPoints: boolean = false;
  
  selectedVar: TPVariable = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  selection: SelectionModel<TPVariable> = new SelectionModel<TPVariable>(
    true,
    []
  );

  colsToDisplay: string[] = BASE_COLS;

  private _showJoints: boolean;
  private _showLocations: boolean;
  private _showLongs: boolean;
  private _showDoubles: boolean;
  private _showStrings: boolean;
  private _legend: string[] = [];
  private _value: any[] = [];
  private _varRefreshing: boolean = false;
  private words: any;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  get legend() {
    return this._legend;
  }

  get value() {
    return this._value;
  }

  set showJoints(val) {
    this._showJoints = val;
    this.filterData();
  }

  set showLocations(val) {
    this._showLocations = val;
    this.filterData();
  }

  set showLongs(val) {
    this._showLongs = val;
    this.filterData();
  }

  set showDoubles(val) {
    this._showDoubles = val;
    this.filterData();
  }

  set showStrings(val) {
    this._showStrings = val;
    this.filterData();
  }

  // GETTERS
  get showJoints() {
    return this._showJoints;
  }
  get showLocations() {
    return this._showLocations;
  }
  get showLongs() {
    return this._showLongs;
  }
  get showDoubles() {
    return this._showDoubles;
  }
  get showStrings() {
    return this._showStrings;
  }

  constructor(
    public data: DataService,
    private ws: WebsocketService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public login: LoginService,
    private trn: TranslateService
  ) {
    this.trn
      .get([
        'value',
        'dataScreen.delete.msg',
        'button.delete',
        'button.cancel',
        'success',
        'changeOK',
      ])
      .subscribe(words => {
        this.words = words;
      });
  }

  teach(element: TPVariable) {
    let fullname = element.name;
    if (element.isArr) fullname += '[' + element.selectedIndex + ']';
    let cmd_teach = '?tp_teach("' + fullname + '","' + element.typeStr + '")';
	if (this.useAsProjectPoints) {
      cmd_teach = '?tp_teach_project_points("' + fullname + '","' + element.typeStr + '")';
    }
    this.ws.query(cmd_teach).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.rowClick(element, true); // REFRESH SELECTED VAR DATA
      }
    });
  }

  filterData() {
    if (this.data.domainIsFrame) {
      this.dataSource.data = this.data.locations;
      this.selection.clear();
      return;
    }
    let data = [];
    if (this.useAsProjectPoints && this._showJoints) {
        data = data.concat(this.data.pJoints);
    } else {
      if (this._showJoints)
        data = data.concat(this.data.joints);
      if (this._showLocations)
        data = data.concat(this.data.locations);
      if (this._showLongs)
        data = data.concat(this.data.longs);
      if (this._showDoubles)
        data = data.concat(this.data.doubles);
      if (this._showStrings)
        data = data.concat(this.data.strings);
    }
    this.dataSource.data = data;
    this.selection.clear();
  }

  ngOnInit() {
    this._showLongs = true;
    this._showDoubles = true;
    this._showStrings = true;
    if (this.data.isRobotType) {
      this._showJoints = true;
      this._showLocations = true;
    }
    this.data.dataRefreshed.subscribe(stat => {
      if (!this.data.isRobotType) {
        this._showJoints = false;
        this._showLocations = false;
      }
      this.filterData();
      if (this.dataSource.data[0]) this.rowClick(this.dataSource.data[0], true);
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: TPVariable) =>
          this.selection.select(row)
        );
  }

  rowClick(element: TPVariable, forceRefresh) {
    if (
      !forceRefresh &&
      this.selectedVar &&
      this.selectedVar.name === element.name
    )
      return;
    this._varRefreshing = true;
    this.selectedVar = element;
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr)
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    const api = this.useAsProjectPoints ? `?tp_get_project_value_namespace("${fullname}")` : '?tp_get_value_namespace("' + fullname + '")';
    this.ws.query(api)
      .then((ret: MCQueryResponse) => {
        if (ret.err) {
          this._varRefreshing = false;
          return;
        }
        let valuesString = ret.result;
        if (valuesString.indexOf('#') === 0)
          valuesString = valuesString.substr(1);
        if (valuesString.indexOf(',') === -1) {
          this._legend = [this.words['value']];
          this._varRefreshing = false;
          this._value = [{ value: valuesString.trim() }];
          this.colsToDisplay = BASE_COLS.concat(this._legend).concat(
            SUFFIX_COLS
          );
          return;
        }
        let values: string[] = valuesString
          .substr(1, valuesString.length - 2)
          .split(',');
        let newLegend: string[] = [];
        for (let i = 0; i < values.length; i++) {
          this._value[i] = { value: values[i].trim() };
          if (this.selectedVar.varType === TPVariableType.JOINT)
            newLegend.push('J' + (i + 1));
        }
        if (newLegend.length === 0) {
          switch (this.selectedVar.varType) {
            case TPVariableType.LOCATION:
              newLegend =
                values.length === 4 ? FOUR_AXES_LOCATION : SIX_AXES_LOCATION;
              break;
          }
        }
        this._legend = newLegend;
        this.colsToDisplay = BASE_COLS.concat(this._legend).concat(SUFFIX_COLS);
        this._varRefreshing = false;
      });
  }

  showAddDialog() {
    this.dialog.open(AddVarComponent, {
      data: {
        useAsProjectPoints: this.useAsProjectPoints,
        canUseArray: this.useAsProjectPoints ? false : true
      }
    });
  }
  
  onDomainChange() {
    this.selectedVar = null;
    this.filterData();
  }

  deleteSelected(element: TPVariable) {
    this.trn
      .get('dataScreen.delete.title', { name: element.name })
      .subscribe(word => {
        this.dialog
          .open(YesNoDialogComponent, {
            data: {
              title: word,
              msg: this.words['dataScreen.delete.msg'],
              yes: this.words['button.delete'],
              no: this.words['button.cancel'],
            },
          })
          .afterClosed()
          .subscribe(ret => {
            if (ret) {
          let cmd = '?TP_DELETEVAR("' + element.name + '")';
          if (this.useAsProjectPoints) {
            cmd = '?TP_DELETE_Project_points("' + element.name + '")';
          }
          this.ws.query(cmd).then((ret: MCQueryResponse)=>{
                if (ret.result === '0') {
                  this.data.refreshVariables();
                  if (this.selectedVar === element) this.selectedVar = null;
                  this.snackBar.open(this.words['success'], '', {
                    duration: 2000,
                  });
                }
              });
            }
          });
      });
  }

  deleteChecked() {
    this.trn
      .get('dataScreen.delete.title_multi', {
        num: this.selection.selected.length,
      })
      .subscribe(word => {
        this.dialog
          .open(YesNoDialogComponent, {
            data: {
              title: word,
              msg: this.words['dataScreen.delete.msg'],
              yes: this.words['button.delete'],
              no: this.words['button.cancel'],
            },
          })
          .afterClosed()
          .subscribe(ret => {
            if (ret) {
              let queries: Promise<any>[] = [];
          for (let v of this.selection.selected) {
            let cmd = '?TP_DELETEVAR("' + v.name + '")';
            if (this.useAsProjectPoints) {
              cmd = '?TP_DELETE_project_points("' + v.name + '")';
            }
            queries.push(this.ws.query(cmd));
          }
              Promise.all(queries).then(() => {
                this.selectedVar = null;
                this.snackBar.open(this.words['success'], '', {
                  duration: 2000,
                });
                var dataQueries = [
                  this.data.refreshBases(),
                  this.data.refreshTools(),
                ];
                Promise.all(dataQueries).then(() => {
                  this.data.refreshVariables();
                });
              });
            }
          });
      });
  }

  onKeyboardClose() {
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr)
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    let value = '';
    for (var i = 0; i < this._value.length; i++) {
      value += this._value[i].value;
      if (i < this._value.length - 1) value += ',';
    }
    let cmd = '?TP_EDITVAR("' + fullname + '","' + value + '")';
    if (this.useAsProjectPoints) {
      cmd = '?TP_EDIT_project_points("' + fullname + '","' + value + '")';
    }
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.rowClick(this.selectedVar, true); // REFRESH DATA
      if (ret.result === '0')
        this.snackBar.open(this.words['changeOK'], null, { duration: 2000 });
      else console.log(ret.cmd + '>>>' + ret.result);
    });
  }
}
