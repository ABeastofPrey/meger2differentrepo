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
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { AddVarComponent } from '../add-var/add-var.component';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';

const BASE_COLS = ['select', 'name', 'arrIndex'];
const SUFFIX_COLS = ['actions'];

@Component({
  selector: 'data-screen',
  templateUrl: './data-screen.component.html',
  styleUrls: ['./data-screen.component.css'],
})
export class DataScreenComponent implements OnInit {
  // To sort the table
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  // To display GUI for project points
  @Input() useAsProjectPoints: boolean = false;

  displayVarType: string;

  selectedVar: TPVariable = null;
  dataSource: MatTableDataSource<TPVariable> = new MatTableDataSource();
  selection: SelectionModel<TPVariable> = new SelectionModel<TPVariable>(
    true,
    []
  );

  colsToDisplay: string[] = BASE_COLS;

  private _legend: string[] = [];
  private _value: any[] = [];
  private _varRefreshing: boolean = false;
  private words: any;
  private notifier: Subject<boolean> = new Subject();

  get isRefreshing() {
    return this._varRefreshing;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  get legend() {
    return this._legend;
  }

  get value() {
    return this._value;
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
      cmd_teach =
        '?tp_teach_project_points("' +
        fullname +
        '","' +
        element.typeStr +
        '")';
    }
    this.ws.query(cmd_teach).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.refreshVariable(element);
      }
    });
  }

  // filterData() {
  //   if (this.data.domainIsFrame) {
  //     this.dataSource.data = this.data.locations;
  //     this.selection.clear();
  //     return;
  //   }
  //   let data = [];
  //   if (this.useAsProjectPoints) {
  //     data = data.concat(this.data.pJoints);
  //   }
  //   this.dataSource.data = data;
  //   this.selection.clear();
  // }

  ngOnInit() {
    this.displayVarType = this.data.isRobotType ? 'joints' : 'longs';
    this.data.dataRefreshed.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat) this.updateDataType();
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  /*
   * called after the data type has changed, and also on data screen init.
   */
  updateDataType() {
    switch (this.displayVarType) {
      case 'joints':
        this._legend = this.data.robotCoordinateType.legends.map((l, i) => {
          return 'J' + (i + 1);
        });
        if (this.useAsProjectPoints) {
          this.dataSource.data = this.data.pJoints;
        } else {
          this.dataSource.data = this.data.joints;
        }
        break;
      case 'locations':
        this._legend = this.data.robotCoordinateType.all;
        this.dataSource.data = this.data.locations;
        break;
      case 'strings':
        this._legend = [this.words['value']];
        this.dataSource.data = this.data.strings;
        break;
      case 'doubles':
        this._legend = [this.words['value']];
        this.dataSource.data = this.data.doubles;
        break;
      case 'longs':
        this._legend = [this.words['value']];
        this.dataSource.data = this.data.longs;
        break;
    }
    this.colsToDisplay = BASE_COLS.concat(this._legend).concat(SUFFIX_COLS);
    this.refreshValues();
  }

  private refreshVariable(v: TPVariable): Promise<any> {
    let fullname = v.name;
    if (v.isArr) fullname += '[' + v.selectedIndex + ']';
    let api: string;
    if (this.useAsProjectPoints)
      api = `?tp_get_project_value_namespace("${fullname}")`;
    else api = `?tp_get_value_namespace("${fullname}")`;
    return this.ws.query(api).then((ret: MCQueryResponse) => {
      if (ret.err) return;
      let valuesString = ret.result;
      if (valuesString.indexOf('#') === 0)
        valuesString = valuesString.substr(1);
      if (valuesString.indexOf(',') === -1) {
        const val = [{ value: valuesString.trim() }];
        if (v.isArr) (v.value[v.selectedIndex] as TPVariable).value = val;
        else v.value = val;
        return;
      }
      const val = [];
      const parts: string[] = valuesString
        .substr(1, valuesString.length - 2)
        .split(';');
      const values = parts[0].split(',');
      let flags = parts[1] ? parts[1].split(',') : [];
      if (v.varType === TPVariableType.LOCATION) {
        const len = this.data.robotCoordinateType.flags.length;
        // SET ALL OTHER FLAGS TO ZERO
        for (let i = flags.length; i < len; i++) {
          flags[i] = '0';
        }
      }
      const total = values.concat(flags);
      for (let i = 0; i < total.length; i++) {
        val[i] = { value: total[i].trim() };
      }
      if (v.isArr) (v.value[v.selectedIndex] as TPVariable).value = val;
      else v.value = val;
    });
  }

  private refreshValues() {
    this._varRefreshing = true;
    let queries: Promise<any>[] = [];
    for (let v of this.dataSource.data) {
      if (!v.isArr && v.value) continue;
      if (v.isArr) {
        const selectedChild = v.value[v.selectedIndex] as TPVariable;
        if (selectedChild.value) continue;
      }
      queries.push(this.refreshVariable(v));
    }
    return Promise.all(queries).then(results => {
      this._varRefreshing = false;
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
    if (1 > 0) return;
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
    let api: string;
    if (this.useAsProjectPoints)
      api = `?tp_get_project_value_namespace("${fullname}")`;
    else api = `?tp_get_value_namespace("${fullname}")`;
    this.ws.query(api).then((ret: MCQueryResponse) => {
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
        this.colsToDisplay = BASE_COLS.concat(this._legend).concat(SUFFIX_COLS);
        return;
      }
      const parts: string[] = valuesString
        .substr(1, valuesString.length - 2)
        .split(';');
      const values = parts[0].split(',');
      let flags = parts[1] ? parts[1].split(',') : [];
      if (this.selectedVar.varType === TPVariableType.LOCATION) {
        const len = this.data.robotCoordinateType.flags.length;
        // SET ALL OTHER FLAGS TO ZERO
        for (let i = flags.length; i < len; i++) {
          flags[i] = '0';
        }
      }
      const total = values.concat(flags);
      let newLegend: string[] = [];
      for (let i = 0; i < total.length; i++) {
        this._value[i] = { value: total[i].trim() };
        if (this.selectedVar.varType === TPVariableType.JOINT)
          newLegend.push('J' + (i + 1));
      }
      if (newLegend.length === 0) {
        switch (this.selectedVar.varType) {
          case TPVariableType.LOCATION:
            newLegend = this.data.robotCoordinateType.all;
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
      disableClose: true,
      data: {
        useAsProjectPoints: this.useAsProjectPoints,
        canUseArray: this.useAsProjectPoints ? false : true,
        varType: this.displayVarType.slice(0, -1).toUpperCase(),
      },
    });
  }

  // onDomainChange() {
  //   this.selectedVar = null;
  //   this.filterData();
  // }

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
              this.ws.query(cmd).then((ret: MCQueryResponse) => {
                if (ret.result === '0') {
                  this.data.refreshVariables();
                  if (this.selectedVar === element) this.selectedVar = null;
                  this.snackBar.open(this.words['success'], '', {
                    duration: 2000,
                  });
                  this.selection.clear();
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

  onKeyboardClose(v: TPVariable) {
    let fullname = v.name;
    let parent = null;
    if (v.isArr) {
      fullname += '[' + v.selectedIndex + ']';
      parent = v;
      v = v.value[v.selectedIndex];
    }
    const size = Math.min(
      v.value.length,
      this.data.robotCoordinateType.legends.length
    );
    let value = (v.value as [{ value: string }])
      .slice(0, size)
      .map(v => {
        return v.value;
      })
      .join();
    if (v.varType === TPVariableType.LOCATION) {
      value +=
        ';' +
        (v.value as [{ value: string }])
          .slice(size)
          .map(v => {
            return v.value;
          })
          .join();
    }
    let cmd = '?TP_EDITVAR("' + fullname + '","' + value + '")';
    if (this.useAsProjectPoints) {
      cmd = '?TP_EDIT_project_points("' + fullname + '","' + value + '")';
    }
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.refreshVariable(parent || v);
      if (ret.result === '0')
        this.snackBar.open(this.words['changeOK'], null, { duration: 2000 });
      else console.log(ret.cmd + '>>>' + ret.result);
    });
  }
}
