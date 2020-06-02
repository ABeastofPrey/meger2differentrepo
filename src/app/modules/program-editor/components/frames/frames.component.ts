import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService, WebsocketService, MCQueryResponse } from '../../../core';
import { TPVariable } from '../../../core/models/tp/tp-variable.model';
import { MatTableDataSource, MatDialog, MatSnackBar, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TPVariableType } from '../../../core/models/tp/tp-variable-type.model';
import { AddFrameComponent } from '../add-frame/add-frame.component';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { ComponentType } from '@angular/cdk/portal';
import { ToolCalibrationDialogComponent } from '../tool-calibration-dialog/tool-calibration-dialog.component';
import { FrameCalibrationDialogComponent } from '../frame-calibration-dialog/frame-calibration-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';

@Component({
  selector: 'frames',
  templateUrl: './frames.component.html',
  styleUrls: ['./frames.component.css'],
})
export class FramesComponent implements OnInit {
  currTabIndex = 0;
  selectedVar: TPVariable = null;
  dataSource: MatTableDataSource<TPVariable> = new MatTableDataSource();
  selection: SelectionModel<TPVariable> = new SelectionModel<TPVariable>(
    true,
    []
  );

  // To sort the table
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  private _legend: string[] = [];
  private _value: Array<{ value: number | string }> = [];
  private currFrameType = 'tool';
  private _calibrationDialogShowing = false;
  private words: {};

  busy = false;

  constructor(
    private data: DataService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private trn: TranslateService,
    private utils: UtilsService
  ) {
    this.trn
      .get([
        'changeOK',
        'value',
        'frames.delete.msg',
        'button.delete',
        'button.cancel',
        'tool',
        'base',
        'mt',
        'wp'
      ])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {
    this.dataSource.data = this.getData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  get frameTypeTranslated() {
    return {
      frameType: this.words[this.currFrameType]
    };
  }

  private getData(): TPVariable[] {
    let data: string[] = null;
    const result: TPVariable[] = [];
    switch (this.currTabIndex) {
      default:
        break;
      case 0: // Tools
        data = this.data.tools;
        this.currFrameType = 'tool';
        break;
      case 1: // Bases
        data = this.data.bases;
        this.currFrameType = 'base';
        break;
      case 2: // Machine Tables
        data = this.data.machineTables;
        this.currFrameType = 'mt';
        break;
      case 3: // Workpieces
        data = this.data.workPieces;
        this.currFrameType = 'wp';
        break;
    }
    if (data === null) return null;
    for (const frame of data) {
      result.push(new TPVariable(TPVariableType.LOCATION, frame));
    }
    return result;
  }

  onTabChange(newTab: number) {
    this.selectedVar = null;
    this.currTabIndex = newTab;
    this.dataSource.data = this.getData();
    this.selection.clear();
  }

  onKeyboardClose() {
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr) {
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    }
    let value = '';
    for (let i = 0; i < this._value.length; i++) {
      value += this._value[i].value;
      if (i < this._value.length - 1) value += ',';
    }
    const cmd =
      '?TP_EDIT_FRAME("' +
      this.currFrameType +
      '","' +
      fullname +
      '","' +
      value +
      '")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this.rowClick(this.selectedVar, true); // REFRESH DATA
      if (ret.result === '0') {
        if(!this.utils.IsKuka)
        {
          this.snack.open(this.words['changeOK'], null, { duration: 2000 });
        }
      }
      else console.log(ret.cmd + '>>>' + ret.result);
    });
  }

  isElementCurrent(name: string) {
    let currElement = null;
    switch (this.currTabIndex) {
      default:
        break;
      case 0:
        currElement = this.data.selectedTool;
        break;
      case 1:
        currElement = this.data.selectedBase;
        break;
      case 2:
        currElement = this.data.selectedMachineTable;
        break;
      case 3:
        currElement = this.data.selectedWorkPiece;
        break;
    }
    if (currElement === null) return false;
    const i = currElement.indexOf('[');
    if (i > 0) currElement = currElement.substring(0, i);
    return name === currElement;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length - 1;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: TPVariable, i: number) => {
        if (row.name !== 'VOID') {
          this.selection.select(row);
        }
      });
  }

  rowClick(element: TPVariable, forceRefresh) {
    if (
      !forceRefresh &&
      this.selectedVar &&
      this.selectedVar.name === element.name
    ) {
      return;
    }
    this.selectedVar = element;
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr) {
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    }
    const cmd =
      '?tp_get_frame_value("' + fullname + '","' + this.currFrameType + '")';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      this._value = [];
      this._legend = [];
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
      const values = valuesString.substr(1, valuesString.length - 2).split(',');
      let newLegend = [];
      for (let i = 0; i < values.length; i++) {
        this._value[i] = { value: values[i].trim() };
        if (this.selectedVar.varType === TPVariableType.JOINT) {
          newLegend.push('J' + (i + 1));
        }
      }
      if (newLegend.length === 0) {
        switch (this.selectedVar.varType) {
          default:
            break;
          case TPVariableType.LOCATION:
            newLegend = this.data.robotCoordinateType.legends;
            break;
        }
      }
      this._legend = newLegend;
    });
  }

  create() {
    this.dialog
      .open(AddFrameComponent, {
        data: this.currTabIndex,
      })
      .afterClosed()
      .subscribe(ret => {
        if (ret) {
          const queries = [
            this.data.refreshBases(),
            this.data.refreshTools(),
            this.data.refreshMachineTables(),
            this.data.refreshWorkPieces(),
          ];
          Promise.all(queries).then(() => {
            this.dataSource.data = this.getData();
          });
        }
      });
  }

  setAsCurrent() {
    if (this.busy) return;
    this.busy = true;
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr) {
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    }
    switch (this.currTabIndex) {
      default:
        break;
      case 0:
        this.data.selectedTool = fullname;
        break;
      case 1:
        this.data.selectedBase = fullname;
        break;
      case 2:
        this.data.selectedMachineTable = fullname;
        break;
      case 3:
        this.data.selectedWorkPiece = fullname;
        break;
    }
    setTimeout(()=>{
      this.busy = false;
    },400);
  }

  deleteSelected() {
    this.trn.get('frames.delete.title', this.selectedVar).subscribe(word => {
      this.dialog
        .open(YesNoDialogComponent, {
          data: {
            title: word,
            msg: this.words['frames.delete.msg'],
            yes: this.words['button.delete'],
            no: this.words['button.cancel'],
          },
        })
        .afterClosed()
        .subscribe(ret => {
          if (ret) {
            const cmd =
              '?TP_REMOVE_FRAME("' +
              this.currFrameType +
              '","' +
              this.selectedVar.name +
              '")';
            this.ws.query(cmd).then((ret: MCQueryResponse) => {
              if (ret.result === '0') {
                this.selectedVar = null;
                const queries = [
                  this.data.refreshBases(),
                  this.data.refreshTools(),
                  this.data.refreshMachineTables(),
                  this.data.refreshWorkPieces(),
                ];
                Promise.all(queries).then(() => {
                  this.dataSource.data = this.getData();
                  this.selection.clear();
                });
              }
            });
          }
        });
    });
  }

  deleteChecked() {
    this.trn
      .get('frames.delete.title_multi', {
        num: this.selection.selected.length,
      })
      .subscribe(word => {
        this.dialog
          .open(YesNoDialogComponent, {
            data: {
              title: word,
              msg: this.words['frames.delete.msg'],
              yes: this.words['button.delete'],
              no: this.words['button.cancel'],
            },
          })
          .afterClosed()
          .subscribe(ret => {
            if (ret) {
              const queries = [];
              for (const v of this.selection.selected) {
                const cmd =
                  '?TP_REMOVE_FRAME("' +
                  this.currFrameType +
                  '","' +
                  v.name +
                  '")';
                queries.push(this.ws.query(cmd));
              }
              Promise.all(queries).then(() => {
                this.selectedVar = null;
                const dataQueries = [
                  this.data.refreshBases(),
                  this.data.refreshTools(),
                  this.data.refreshMachineTables(),
                  this.data.refreshWorkPieces()
                ];
                Promise.all(dataQueries).then(() => {
                  this.data.refreshVariables().then(()=>{
                    this.dataSource.data = this.getData();
                    this.selection.clear();
                  });
                });
              });
            }
          });
      });
  }

  showCalibrationDialog() {
    if (this._calibrationDialogShowing) return;
    this._calibrationDialogShowing = true;
    const dialog: ComponentType<ToolCalibrationDialogComponent | FrameCalibrationDialogComponent> =
      this.currTabIndex === 0
        ? ToolCalibrationDialogComponent
        : FrameCalibrationDialogComponent;
    const ref = this.dialog.open(dialog, {
      width: '450px',
      data: {
        variable: this.selectedVar,
        frameType: this.currFrameType,
      },
      hasBackdrop: false,
    });
    ref.afterClosed().subscribe(() => {
      this._calibrationDialogShowing = false;
      this.rowClick(this.selectedVar, true); // REFRESH SELECTED VAR DATA
    });
  }
}
