import { CommonService } from './../../../core/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  ErrorFrame,
} from '../../../core';
import { TPVariableType } from '../../../core/models/tp/tp-variable-type.model';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { AddVarComponent } from '../add-var/add-var.component';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject, throwError } from 'rxjs';
import { UtilsService } from '../../../core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { resolve } from 'dns';
// import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

const BASE_COLS = ['select', 'name', 'arrIndex'];
const SUFFIX_COLS = ['actions'];

const commanddLen: number = 80;//every command need in "" should less than 80, and total should less 80 * 20



@Component({
  selector: 'data-screen',
  templateUrl: './data-screen.component.html',
  styleUrls: ['./data-screen.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataScreenComponent implements OnInit {
  // To sort the table
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayVarType: TPVariableType;

  selectedVar: TPVariable = null;
  dataSource: MatTableDataSource<TPVariable> = new MatTableDataSource();
  selection: SelectionModel<TPVariable> = new SelectionModel<TPVariable>(
    true,
    []
  );

  varTypes: TPVariableType[] = [TPVariableType.JOINT, TPVariableType.LOCATION, TPVariableType.LONG, TPVariableType.DOUBLE, TPVariableType.STRING];
  colsToDisplay: string[] = BASE_COLS;

  private _legend: string[] = [];
  private _value = [];
  private _varRefreshing = false;
  private words: {};
  private notifier: Subject<boolean> = new Subject();
  private _deleteInterval: number;

  private setTimeOutRefreshVarId: any;

  /*
    weather or not to display the mat-table element
  */
  get shouldDisplayTable() {
    return this.useAsProjectPoints ||
      (
        !!this.displayVarType &&
        !!this.dataSource.data &&
        this.dataSource.data.length > 0
      );
  }

  get isRefreshing() {
    // return this._varRefreshing;
    return false;
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

  // To display GUI for project points
  private _useAsProjectPoints = false;
  get useAsProjectPoints() {
    return this._useAsProjectPoints;
  }

  constructor(
    public data: DataService,
    private ws: WebsocketService,
    private snackbarService: SysLogSnackBarService,
    private dialog: MatDialog,
    public login: LoginService,
    private trn: TranslateService,
    private route: ActivatedRoute,
    public cmn: CommonService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.route.data.subscribe(data => {
      if (data) {
        this._useAsProjectPoints = data.useAsProjectPoints;
      }
    });
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

    let cmdTeach = this.useAsProjectPoints ? `?tp_teach_project_points("${fullname}","${element.typeStr}")` : `?tp_teach("${fullname}","${element.typeStr}")`;

    this.ws.query(cmdTeach).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.refreshVariable(element);
      }
    });
  }


  ngOnInit() {
    if (this.useAsProjectPoints) {
      this.varTypes = [TPVariableType.JOINT];
    }
    this.displayVarType = this.data.isRobotType ? TPVariableType.JOINT : TPVariableType.LONG;
    this.data.dataRefreshed.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat && !this.data.varRefreshInProgress) {
        this.setTimeOutRefreshVarId && clearTimeout(this.setTimeOutRefreshVarId);
        this.setTimeOutRefreshVarId = setTimeout(()=>{
          this.updateDataType();
        },500);
      }
    });
  }

  ngOnDestroy() {
    window.clearInterval(this._deleteInterval);
    this.notifier.next(true);
    this.notifier.unsubscribe();
    this.setTimeOutRefreshVarId && clearTimeout(this.setTimeOutRefreshVarId);
  }

  /*
   * called after the data type has changed, and also on data screen init.
   */

  updateDataType() {
    let data = [];
    switch (this.displayVarType) {
      default:
        break;
      case TPVariableType.JOINT:
        this._legend = this.data.robotCoordinateType.legends.map((l, i) => {
          return 'J' + (i + 1);
        });
        data = this.useAsProjectPoints ? this.data.pJoints : this.data.joints;
        break;
      case TPVariableType.LOCATION:
        this._legend = this.data.robotCoordinateType.all;
        data = this.data.locations;
        break;
      case TPVariableType.STRING:
        this._legend = [this.words['value']];
        data = this.data.strings;
        break;
      case TPVariableType.DOUBLE:
        this._legend = [this.words['value']];
        data = this.data.doubles;
        break;
      case TPVariableType.LONG:
        this._legend = [this.words['value']];
        data = this.data.longs;
        break;
    }

    this.dataSource.data = data;

    this.colsToDisplay = BASE_COLS.concat(this._legend).concat(SUFFIX_COLS);
    this.refreshValues();
    this.selection.clear();
    this.changeDetectorRef.detectChanges();
  }

  getValue(element: TPVariable, i: number) {
    if (element.isArr) {
      const idx = element.selectedIndex - 1;
      return element.value[idx].value[i].value;
    }
    return element.value[i].value;
  }

  public refreshVariable(v: TPVariable) {
    const fullname = this.data.buildFullName(v);
    let api: string;
    if (this.useAsProjectPoints) {
      api = `?tp_get_project_value_namespace("${fullname}")`;
    }
    else api = `?tp_get_value_namespace("${fullname}")`;
    return this.ws.query(api).then((ret: MCQueryResponse) => {
      if (ret.err) return;
      this.buildVariable(v, ret.result);
      this.changeDetectorRef.detectChanges();
    });
  }

  private buildVariable(v: TPVariable, valuesString: string): void {
    if (valuesString.indexOf('#') === 0) {
      valuesString = valuesString.substr(1);
    }
    if (valuesString.indexOf(',') === -1) {
      const val = [{ value: valuesString.trim() }];
      if (v.isArr) {
        let selected = null;
        if (v.isTwoDimension) {
          selected = v.value[v.selectedIndex - 1][v.selectedSecondIndex - 1] as TPVariable;
        }
        else {
          selected = v.value[v.selectedIndex - 1] as TPVariable;
        }
        if (!selected.dataLoaded) {
          selected.value = val;
          selected.dataLoaded = true;
        } else {
          selected.value[0].value = val[0].value;
        }
      } else if (!v.dataLoaded) {
        v.value = val;
        v.dataLoaded = true;
      } else {
        v.value[0].value = val[0].value;
      }
      return;
    }
    const val = [];
    const parts: string[] = valuesString
      .substr(1, valuesString.length - 2)
      .split(';');
    const values = parts[0].split(',');
    const flags = parts[1] ? parts[1].split(',') : [];
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
    if (v.isArr) {
      const selected = v.value[v.selectedIndex - 1] as TPVariable;
      if (!selected.dataLoaded) {
        selected.value = val;
        selected.dataLoaded = true;
      } else {
        for (let i = 0; i < val.length; i++) {
          selected.value[i].value = val[i].value;
        }
      }
    }
    else if (!v.dataLoaded) {
      v.value = val;
      v.dataLoaded = true;
    } else {
      for (let i = 0; i < val.length; i++) {
        v.value[i].value = val[i].value;
      }
    }

  }

  private async refreshValues() {

    if (!this.dataSource.data || this.dataSource.data.length < 1) {
      this._varRefreshing = false;
      this.changeDetectorRef.detectChanges();
      return;
    }

    this._varRefreshing = true;
    let displayVarType = this.displayVarType;

    let cmd;
    if (this.useAsProjectPoints) {
      cmd = '?VAR_GET_PROJECT_POINTS';
    } else {
      await this.ws.query("CALl VAR_CLEAR_NAMES");
      let res = await this.postNameInfoTolib(this.dataSource.data);//should store names for lib use
      if (!res) {
        return;
      }
      cmd = `?VAR_GET_APP_POINTS("${displayVarType}")`;
    }

    this.ws.simpleQuery(cmd)
      .pipe(takeUntil(this.notifier), catchError(() => throwError('get values error')))
      .subscribe((res: string | ErrorFrame) => {
        this._varRefreshing = false;
        if (!res || typeof res !== 'string') {
          this.dataSource.data = [];
          this.changeDetectorRef.detectChanges();
          return;
        }

        let dataNameMap: Map<string, any> = new Map();

        const newData = JSON.parse(res);
        for (let node of newData) {
          dataNameMap.set(node.name, node.value);
        }
        for (const v of this.dataSource.data) {
          const key = this.data.buildFullName(v);
          if (dataNameMap.has(key)) {
            this.buildVariable(v, dataNameMap.get(key))
          }
        }

        this.changeDetectorRef.detectChanges();

      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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
    ) {
      return;
    }
    this._varRefreshing = true;
    this.selectedVar = element;
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr) {
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    }
    let api: string;
    if (this.useAsProjectPoints) {
      api = `?tp_get_project_value_namespace("${fullname}")`;
    }
    else api = `?tp_get_value_namespace("${fullname}")`;
    this.ws.query(api).then((ret: MCQueryResponse) => {
      if (ret.err) {
        this._varRefreshing = false;
        return;
      }
      let valuesString = ret.result;
      if (valuesString.indexOf('#') === 0) {
        valuesString = valuesString.substr(1);
      }
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
      const flags = parts[1] ? parts[1].split(',') : [];
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
        if (this.selectedVar.varType === TPVariableType.JOINT) {
          newLegend.push('J' + (i + 1));
        }
      }
      if (newLegend.length === 0) {
        switch (this.selectedVar.varType) {
          default:
            break;
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
        varType: this.displayVarType.toUpperCase(),
      }
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
              let cmd = this.useAsProjectPoints ? `?TP_DELETE_Project_points("${element.name}")` : `?TP_DELETEVAR("${element.name}")`;

              this.ws.query(cmd).then((ret: MCQueryResponse) => {
                if (ret.result === '0') {
                  this.data.refreshVariables();
                  if (this.selectedVar === element) {
                    this.selectedVar = null;
                  }
                  this.snackbarService.openTipSnackBar("success");
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
          .subscribe(async ret => {
            if (ret) {
              const delCmd = this.useAsProjectPoints ? '?TP_DELETE_PROJECT_POINTS' : '?TP_DELETEVAR';
              this._varRefreshing = true;
              // divide into 80-char queries...
              const list = this.selection.selected.map(s => s.name);
              let tmpArr = [];
              let count = 0;
              let ret1, ret2;
              while (list.length) {
                const str = list.pop();
                const len = str.length + 1;
                if (count + len < commanddLen) {
                  tmpArr.push(str);
                  count += len;
                } else {
                  const delComdOfNames = `${delCmd}("${tmpArr.join()},")`;
                  ret1 = await this.ws.query(delComdOfNames);
                  ret2 = await this.waitForDeletionToFinish();
                  count = len;
                  tmpArr = [str];
                }
              }
              const delComdOfNames = `${delCmd}("${tmpArr.join()},")`;
              ret1 = await this.ws.query(delComdOfNames);
              ret2 = await this.waitForDeletionToFinish();

              if (this.useAsProjectPoints) {
                this.selectedVar = null;
              }
              this.data.refreshVariables();
            }
          });
      });
  }

  private waitForDeletionToFinish() {
    return new Promise(resolve => {
      let done = false;
      this._deleteInterval = window.setInterval(async () => {
        if (done) {
          window.clearInterval(this._deleteInterval);
          resolve(true);
          return;
        };
        const cmd = this.useAsProjectPoints ? '?TP_GETDELETEPNTSTATUS' : '?TP_GETDELETEVARSTATUS';
        const ret = await this.ws.query(cmd);
        if (ret.result === '0' || ret.result === '-1') {
          done = true;
          window.clearInterval(this._deleteInterval);
          this.selectedVar = null;
          if (ret.result === '0') {
            this.snackbarService.openTipSnackBar("success");
          }
          resolve(true);
        }
      }, 500);
    });
  }

  onKeyboardClose(v: TPVariable) {
    const fullname = this.data.buildFullName(v);
    let parent = null;
    if (v.isArr) {
      parent = v;
      if (v.isTwoDimension) {
        v = v.value[v.selectedIndex - 1][v.selectedSecondIndex - 1];
      }
      else {
        v = v.value[v.selectedIndex - 1];
      }

    }
    if (!Array.isArray(v.value)) return;
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
    let cmd = this.useAsProjectPoints ? `?TP_EDIT_project_points("${fullname}","${value}")` : `?TP_EDITVAR("${fullname}","${value}")`;

    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.refreshVariable(parent || v);
      if (ret.result === '0') {
        // this.snackBar.open(this.words['changeOK'], null, { duration: 2000 });
        this.snackbarService.openTipSnackBar("changeOK");
      }
      else console.log(ret.cmd + '>>>' + ret.result);
    });
  }


  private async postNameInfoTolib(data: TPVariable[]): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      if (!data || data.length < 1) {
        return resolve(true);
      }
      try {

        let charts: string[] = [];
        let comdStr: string = '';

        for (let i = 0; i < data.length; i++) {
          const fullName = this.data.buildFullName(data[i]);
          const nextComd = comdStr ? `${comdStr}${fullName},` : `${comdStr}${fullName},`;
          if (nextComd.length < commanddLen) {
            comdStr = nextComd;
          } else {
            charts.push(comdStr);
            comdStr = `${fullName},`;
          }
        }

        charts.push(comdStr);
        // 80 * 19 approximately equal to < 80 * 20
        for (let j = 0; j < charts.length;) {
          let command = '';
          for (let k = 0; k < 19; k++) {
            if (j < charts.length) {
              command = command ? `${command}+"${charts[j]}"` : `"${charts[j]}"`;
              j++;
            } else {
              break;
            }
          }
          await this.ws.query(`CALL VAR_STORE_NAMES(${command})`);
        }
        resolve(true);
      } catch{
        reject(false)
      }
    });

  }



}
