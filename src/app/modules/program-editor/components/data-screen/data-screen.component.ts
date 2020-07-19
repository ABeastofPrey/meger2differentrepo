import { CommonService } from './../../../core/services/common.service';
import { ActivatedRoute } from '@angular/router';
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
import { UtilsService } from '../../../core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

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

  displayVarType: string;

  selectedVar: TPVariable = null;
  dataSource: MatTableDataSource<TPVariable> = new MatTableDataSource();
  selection: SelectionModel<TPVariable> = new SelectionModel<TPVariable>(
    true,
    []
  );
  varTypes = ['joints', 'locations', 'longs', 'doubles', 'strings'];
  colsToDisplay: string[] = BASE_COLS;

  private _legend: string[] = [];
  private _value = [];
  private _varRefreshing = false;
  private words: {};
  private notifier: Subject<boolean> = new Subject();
  private _deleteInterval: number;

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
    public cmn: CommonService
  ) {
    this.route.data.subscribe(data=>{
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
    let cmdTeach = '?tp_teach("' + fullname + '","' + element.typeStr + '")';
    if (this.useAsProjectPoints) {
      cmdTeach =
        '?tp_teach_project_points("' +
        fullname +
        '","' +
        element.typeStr +
        '")';
    }
    this.ws.query(cmdTeach).then((ret: MCQueryResponse) => {
      if (ret.result === '0') {
        this.refreshVariable(element);
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
    if (this.useAsProjectPoints) {
      data = data.concat(this.data.pJoints);
    }
    this.dataSource.data = data;
    this.selection.clear();
  }

  ngOnInit() {
    if (this.useAsProjectPoints) {
      this.varTypes = ['joints'];
    }
    this.displayVarType = this.data.isRobotType ? 'joints' : 'longs';
    this.data.dataRefreshed.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat && !this.data.varRefreshInProgress) this.updateDataType();
    });
  }

  ngOnDestroy() {
    window.clearInterval(this._deleteInterval);
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  /*
   * called after the data type has changed, and also on data screen init.
   */
  updateDataType() {
    switch (this.displayVarType) {
      default:
        break;
      case 'joints':
        this._legend = this.data.robotCoordinateType.legends.map((l, i) => {
          return 'J' + (i + 1);
        });
        this.dataSource.data = this.useAsProjectPoints ? this.data.pJoints : this.data.joints;
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
    this.selection.clear();
  }
  
  getValue(element: TPVariable, i: number) {
    if (element.isArr) {
      const idx = element.selectedIndex - 1;
      return element.value[idx].value[i].value;
    }
    return element.value[i].value;
  }

  private refreshVariable(v: TPVariable) {
    let fullname = v.name;
    if (v.isArr) { 
      fullname += '[' + v.selectedIndex + ']';
    }
    if (v.isTwoDimension) {
        fullname += '[' + v.selectedSecondIndex + ']';
      }
    let api: string;
    if (this.useAsProjectPoints) {
      api = `?tp_get_project_value_namespace("${fullname}")`;
    }
    else api = `?tp_get_value_namespace("${fullname}")`;
    return this.ws.query(api).then((ret: MCQueryResponse) => {
      if (ret.err) return;
      let valuesString = ret.result;
      if (valuesString.indexOf('#') === 0) {
        valuesString = valuesString.substr(1);
      }
      if (valuesString.indexOf(',') === -1) {
        const val = [{ value: valuesString.trim() }];
        if (v.isArr) {
          let selected = null;
          if(v.isTwoDimension)
          {
            selected = v.value[v.selectedIndex - 1][v.selectedSecondIndex - 1] as TPVariable;
          }
          else
          {
            selected = v.value[v.selectedIndex-1] as TPVariable;
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
        const selected = v.value[v.selectedIndex-1] as TPVariable;
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
    });
  }

  private refreshValues() {
    this._varRefreshing = true;
    const queries: Array<Promise<void>> = [];
    for (const v of this.dataSource.data) {
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
        varType: this.displayVarType.slice(0, -1).toUpperCase(),
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
              this.ws.query(cmd).then((ret: MCQueryResponse) => {
                if (ret.result === '0') {
                  this.data.refreshVariables();
                  if (this.selectedVar === element) this.selectedVar = null;
                    // this.snackBar.open(this.words['success'], '', {
                    //   duration: 2000,
                    // });
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
          .subscribe(ret => {
            if (ret) {
              this._varRefreshing = true;
              const queries = [];
              if (!this.useAsProjectPoints) {
                const cmd = '?TP_DELETEVAR("' + this.selection.selected.map(s=>s.name).join() + ',")';
                queries.push(this.ws.query(cmd));
              } else {
                for (const v of this.selection.selected) {
                  const cmd = '?TP_DELETE_project_points("' + v.name + '")';
                  queries.push(this.ws.query(cmd));
                }
              }
              Promise.all(queries).then(ret => {
                if (this.useAsProjectPoints) {
                  this.selectedVar = null;
                  this.data.refreshVariables();
                } else {
                  this.waitForDeletionToFinish();
                }
              });
            }
          });
      });
  }

  private waitForDeletionToFinish() {
    let done = false;
    this._deleteInterval = window.setInterval(async()=>{
      if (done) {
        window.clearInterval(this._deleteInterval);
        return;
      };
      const ret = await this.ws.query('?TP_GETDELETEVARSTATUS');
      if (ret.result === '0') {
        done = true;
        window.clearInterval(this._deleteInterval);
        this.selectedVar = null;
        this.data.refreshVariables();
      }
    }, 500);
  }

  onKeyboardClose(v: TPVariable) {
    let fullname = v.name;
    let parent = null;
    if (v.isArr) {
      fullname += '[' + v.selectedIndex + ']';
      parent = v;

      if (v.isTwoDimension) {
        fullname += '[' + v.selectedSecondIndex + ']';
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
    let cmd = '?TP_EDITVAR("' + fullname + '","' + value + '")';
    if (this.useAsProjectPoints) {
      cmd = '?TP_EDIT_project_points("' + fullname + '","' + value + '")';
    }
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.refreshVariable(parent || v);
      if (ret.result === '0') {
        // this.snackBar.open(this.words['changeOK'], null, { duration: 2000 });
        this.snackbarService.openTipSnackBar("changeOK");
      }
      else console.log(ret.cmd + '>>>' + ret.result);
    });
  }
}
