import { Component, OnInit } from '@angular/core';
import {DataService, WebsocketService, MCQueryResponse} from '../../../core';
import {TPVariable} from '../../../core/models/tp/tp-variable.model';
import {MatTableDataSource, MatDialog, MatSnackBar} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {TPVariableType} from '../../../core/models/tp/tp-variable-type.model';
import {AddFrameComponent} from '../add-frame/add-frame.component';
import {FOUR_AXES_LOCATION, SIX_AXES_LOCATION} from '../../../core/models/tp/location-format.model';
import {YesNoDialogComponent} from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import {ComponentType} from '@angular/cdk/portal';
import {ToolCalibrationDialogComponent} from '../tool-calibration-dialog/tool-calibration-dialog.component';
import {FrameCalibrationDialogComponent} from '../frame-calibration-dialog/frame-calibration-dialog.component';

@Component({
  selector: 'frames',
  templateUrl: './frames.component.html',
  styleUrls: ['./frames.component.css']
})
export class FramesComponent implements OnInit {
  
  currTabIndex: number = 0;
  selectedVar: TPVariable = null;
  dataSource: MatTableDataSource<TPVariable> = new MatTableDataSource();
  selection:SelectionModel<TPVariable>=new SelectionModel<TPVariable>(true,[]);
  
  private _legend : string[] = [];
  private _value : any[] = [];
  private currFrameType: string = 'tool';

  constructor(
    private data: DataService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar
  ) { }
  ngOnInit() {
    this.dataSource.data = this.getData();
  }
  
  private getData() : TPVariable[] {
    let data: string[] = null;
    let result: TPVariable[] = [];
    switch (this.currTabIndex) {
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
    if (data === null)
      return null;
    for (let frame of data) {
      result.push(new TPVariable(TPVariableType.LOCATION,frame));
    }
    return result;
  }
  
  onTabChange(newTab:number) {
    this.selectedVar = null;
    this.currTabIndex = newTab;
    this.dataSource.data = this.getData();
    this.selection.clear();
  }
  
  onKeyboardClose() {
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr)
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    let value = '';
    for (var i=0; i<this._value.length; i++) {
      value += this._value[i].value;
      if (i<this._value.length-1)
        value += ',';
    }
    const cmd = '?TP_EDIT_FRAME("' + this.currFrameType + '","' + fullname +
                '","' + value + '")';
    this.ws.query(cmd).then((ret: MCQueryResponse)=>{
      this.rowClick(this.selectedVar,true); // REFRESH DATA
      if (ret.result === '0')
        this.snack.open('Changes saved',null,{duration: 2000});
      else
        console.log(ret.cmd + '>>>' + ret.result);
    });
  }
  
  isElementCurrent(name : string) {
    let currElement = null;
    switch (this.currTabIndex) {
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
    if (currElement === null)
      return false;
    const i = currElement.indexOf('[');
    if (i > 0)
      currElement = currElement.substring(0,i);
    return name === currElement;
  }
  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
      this.dataSource.data.forEach((row : TPVariable) => this.selection.select(row));
  }
  
  rowClick(element: TPVariable, forceRefresh) {
    if (!forceRefresh && this.selectedVar && this.selectedVar.name === element.name)
      return;
    this.selectedVar = element;
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr)
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    const cmd = '?tp_get_frame_value("'+fullname+'","'+this.currFrameType+'")';
    this.ws.query(cmd).then((ret:MCQueryResponse)=>{
      this._value = [];
      this._legend = [];
      if (ret.err) {
        return;
      }
      var valuesString = ret.result;
      if (valuesString.indexOf("#") === 0)
        valuesString = valuesString.substr(1);
      if (valuesString.indexOf(",") === -1) {
        this._legend = ['Value'];
        this._value = [{value:valuesString.trim()}];
        return;
      }
      var values = valuesString.substr(1,valuesString.length-2).split(",");
      var newLegend = [];
      for (var i=0; i<values.length; i++) {
        this._value[i] = {value:values[i].trim()};
        if (this.selectedVar.varType === TPVariableType.JOINT)
          newLegend.push('J' + (i+1));
      }
      if (newLegend.length === 0) {
        switch (this.selectedVar.varType) {
          case TPVariableType.LOCATION:
            newLegend = (values.length === 4) ? 
              FOUR_AXES_LOCATION : SIX_AXES_LOCATION;
            break;
        }
      }
      this._legend = newLegend;
    });
  }
  
  create() {
    this.dialog.open(AddFrameComponent,{
      data: this.currTabIndex
    }).afterClosed().subscribe(ret=>{
      if (ret) {
        var queries = [
          this.data.refreshBases(),
          this.data.refreshTools(),
          this.data.refreshMachineTables(),
          this.data.refreshWorkPieces()
        ];
        Promise.all(queries).then(()=>{
          this.dataSource.data = this.getData();
        });
      }
    });
  }
  
  setAsCurrent() {
    let fullname = this.selectedVar.name;
    if (this.selectedVar.isArr)
      fullname += '[' + this.selectedVar.selectedIndex + ']';
    switch (this.currTabIndex) {
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
  }
  
  deleteSelected() {
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Delete ' + this.selectedVar.name + '?',
        msg: 'This cannot be undone.',
        yes: 'DELETE',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        let cmd = '?TP_REMOVE_FRAME("' + this.currFrameType + '","' + 
                  this.selectedVar.name + '")';
        this.ws.query(cmd).then((ret: MCQueryResponse)=>{
          if (ret.result === '0') {
            this.selectedVar = null;
            var queries = [
              this.data.refreshBases(),
              this.data.refreshTools(),
              this.data.refreshMachineTables(),
              this.data.refreshWorkPieces()
            ];
            Promise.all(queries).then(()=>{
              this.dataSource.data = this.getData();
            });
          }
        });
      }
    });
  }
  
  deleteChecked() {
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Delete' + this.selection.selected.length + ' variables ?',
        msg: 'This cannot be undone.',
        yes: 'DELETE',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        let queries : Promise<any>[] = [];
        for (let v of this.selection.selected)
          queries.push(this.ws.query('?TP_DELETEVAR("' + v.name + '")'));
        Promise.all(queries).then(()=>{
          this.selectedVar = null;
          var dataQueries = [
            this.data.refreshBases(),
            this.data.refreshTools()
          ];
          Promise.all(dataQueries).then(()=>{
            this.data.refreshVariables();
          });
        });
      }
    });
  }
  
  showCalibrationDialog() {
    let dialog: ComponentType<any> = this.currTabIndex === 0 ? 
      ToolCalibrationDialogComponent : FrameCalibrationDialogComponent;
    let ref = this.dialog.open(dialog,{
      width: '450px',
      data: {
        variable: this.selectedVar,
        frameType: this.currFrameType
      },
      hasBackdrop: false
    });
    ref.afterClosed().subscribe(()=>{
      this.rowClick(this.selectedVar,true); // REFRESH SELECTED VAR DATA
    });
  }

}