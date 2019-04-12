import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { MatTable, MatTableDataSource, MatRow } from '@angular/material';

import { CustomIOType, IoTableColumn } from '../../../services/io.service.enum';
import { CustomIO, IoService, CustomIOPort } from '../../../services/io.service';


@Component({
  selector: 'app-custom-io',
  templateUrl: './custom-io.component.html',
  styleUrls: ['./custom-io.component.css']
})
/**
 * This class describes the logics to custom io view.
 */
export class CustomIOComponent implements OnInit, AfterViewInit {

  @Input() tableIndex: number;

  /**
   * The custom io table columns.
   */
  customDisplayedColumns: IoTableColumn[] = [
    IoTableColumn.Type,
    IoTableColumn.Port,
    IoTableColumn.Value,
    IoTableColumn.Label
  ];


  /**
   * The IoFormatOption enum object reference.
   */
  //IoFormatOptionsReference = IoFormatOptions;

  /**
   * The CustomIOType enum object reference.
   */
  CustomIOTypeReference = CustomIOType;

  /**
   * The IoTableColumn enum object reference.
   */
  IoTableColumnReference = IoTableColumn;

  /**
   * show data in hex for custom view.
   */
  customHex: boolean;

  /**
   * * The flag to show whether the add button is enabled.
   */
  isAddEnable: boolean;

  /**
   * The flag to show whether the delete button is enabled.
   */
  isDeleteEnable: boolean;

  /**
   * The selected row in custom io table.
   */
  selectedRowInCustomTable: MatRow;

  /**
   * The index of the selected row in custom io table.
   */
  selectedIndexInCustomTable: number;

  /**
   * The data source for custom io table.
   */
  customDataSource: MatTableDataSource<CustomIO>;

  /**
   * The custom io table instance.
   */
  @ViewChild('customTable')
  customTable: MatTable<CustomIO>;

  /**
   * The available custom io ports.
   */
  private customIoPorts: CustomIOPort;

  /**
   * The available custom io types.
   */
  private customIOTypes: CustomIOType[] = [];

  /**
   * Constructor.
   * @param ioService The ioService instance.
   */
  constructor(private ioService: IoService) {
    this.tableIndex = 1;
    this.customDataSource = new MatTableDataSource([]);
    this.changeSelectRow(null, -1);
    this.enableButtonsInCustomTab(true, false);
    this.customHex = false;
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.ioService.queryCustomIoPorts().then(() => {
      this.customIoPorts = this.ioService.getCustomIoPorts();
      this.checkCustomIoTypes();
    }).then(() => {
      if (this.customIOTypes.length) {
        this.ioService.queryCustomIos(this.tableIndex, this.customHex).then(() => {
          this.customDataSource.data = this.ioService.getCustomIos(this.customIOTypes, this.customIoPorts);
          this.enableButtonsInCustomTab(true, false);
        });
      }
    });

  }

  /**
   * Select one row in the custom IO table.
   * @param row The selected row.
   * @param index The index of selected row.
   */
  selectRowInCustomTable(row, index) {
    this.changeSelectRow(row, index);
    this.enableButtonsInCustomTab(true, true);
  }

  /**
   * Add one row in the custom IO table.
   */
  addRowInCustomTable() {
    let defaultType = this.findDefaultType();

    if (defaultType) {
       let portKey = defaultType.replace(/\s/g, '');

       this.customDataSource.data.push({
        type: this.ioService.getCustomIoTypes(),
        port: this.customIoPorts[portKey],
        selectedType: defaultType,
        selectedPort: this.customIoPorts[portKey][0],
        value: '',
        label: ''
      });

      let newRow = this.customDataSource.data[this.customDataSource.data.length - 1];
      this.ioService
        .addCustomIo(this.tableIndex, newRow.selectedType, newRow.selectedPort, this.customHex)
        .then(() => {
          this.customDataSource.data[this.customDataSource.data.length - 1] = this.ioService
          .getCustomIo(this.customIOTypes, this.customIoPorts);
          this.customTable.renderRows();

          this.changeSelectRow(this.customDataSource.data[this.customDataSource.data.length - 1],
            this.customDataSource.data.length - 1);
          this.enableButtonsInCustomTab(true, true);
        });
    }
  }

  /**
   * Delete one row in the custom IO table.
   */
  deleteRowInCustomTable() {
      let isSelectBottomLine = true;
      if (this.selectedIndexInCustomTable !== this.customDataSource.data.length - 1) {
        isSelectBottomLine = false;
      }

      this.ioService
        .removeCustomIo(this.tableIndex, this.selectedIndexInCustomTable + 1)
        .then(() => {
          this.customDataSource.data.splice(this.selectedIndexInCustomTable, 1);
          this.customTable.renderRows();

          if (isSelectBottomLine) {
            this.changeSelectRow(this.customDataSource.data[this.customDataSource.data.length - 1],
              this.customDataSource.data.length - 1);
              this.enableButtonsInCustomTab(true, true);
          } else {
            this.changeSelectRow(null, -1);
            this.enableButtonsInCustomTab(true, false);
          }
        });
  }

  /**
   * Remove the select row background on port or type change.
   * @param event Onclick event on the row.
   */
  removeSelectionOnPortOrTypeChange(event) {
    event.stopPropagation();
    this.changeSelectRow(null, -1);
    this.enableButtonsInCustomTab(true, false);
  }

  /**
   * The method to handle the custom IO type change.
   * @param index The row index.
   * @param value The changed value of the custom IO type.
   */
  typeSelectionChange(index, value) {
    let ports = this.customIoPorts[value.replace(/\s/g, '')];
    let select = ports.find(
      e => e === this.customDataSource.data[index].selectedPort
    );

    if (!select) {
      this.ioService
        .modifyCustomIo(this.tableIndex, index + 1, value, ports[0], this.customHex)
        .then(() => {
          this.customDataSource.data[index] = this.ioService.getCustomIo(this.customIOTypes, this.customIoPorts);
          this.customTable.renderRows();
        });
      return;
    }

    this.ioService.modifyCustomIo(this.tableIndex, index + 1, value,
        this.customDataSource.data[index].selectedPort,
        this.customHex
      ).then(() => {
        this.customDataSource.data[index] = this.ioService.getCustomIo(this.customIOTypes, this.customIoPorts);
        this.customTable.renderRows();
      });
  }

  /**
   * The method to handle the custom IO port change.
   * @param index The row index.
   * @param value The changed value of the custom IO port.
   */
   portSelectionChange(index, value) {
    this.ioService.modifyCustomIo(this.tableIndex, index + 1, this.customDataSource.data[index].selectedType,
        value, this.customHex
      ).then(() => {
        this.customDataSource.data[index] = this.ioService.getCustomIo(this.customIOTypes, this.customIoPorts);
        this.customTable.renderRows();
      });
  }

  /**
   * The handler method if the hex checkbox is changed.
   */
   customHexChanged() {
    this.ioService.queryCustomIos(this.tableIndex, this.customHex).then(() => {
      this.customDataSource.data = this.ioService.getCustomIos(this.customIOTypes, this.customIoPorts);
    });
  }

  /**
   * The method to handle radio button click in custom IO table.
   * @param index The selected row index.
   * @param event Onclick event on the row.
   * @returns if it is output, return true.
   */
   onClickRadioButtonInCustomIO(index, event) {
    event.stopPropagation();
    this.changeSelectRow(null, -1);
    this.enableButtonsInCustomTab(true, false);

    let entry = this.customDataSource.data[index];
    if (entry.selectedType === CustomIOType.InputBit) {
      return false;
    }

    if (entry.value === '1') {
      entry.value = '0';
    } else {
      entry.value = '1';
    }
    this.ioService.setIoByBit(entry.selectedPort, entry.value).then(() => {
      this.customTable.renderRows();
    });

    return true;
  }

  /**
   * Enable or disable the buttons in the custom IO tab.
   * @param isAddEnable wheter the add button is enabled.
   * @param isDeleteEnable whether the delete button is enabled.
   */
  private enableButtonsInCustomTab(isAddEnable: boolean, isDeleteEnable: boolean) {
    this.isAddEnable = isAddEnable;
    this.isDeleteEnable = isDeleteEnable;

    if (this.customDataSource.data.length === 0) {
      this.isDeleteEnable = false;
    }

    this.isAddEnable = this.customDataSource.data.length > 99 ? false : true;

    if (!this.customIOTypes.length) {
      this.isAddEnable = false;
    }
  }

  /**
   * Change the selected row.
   * @param row The selected row.
   * @param index The index of the selected row.
   */
  private changeSelectRow(row, index) {
    this.selectedRowInCustomTable = row;
    this.selectedIndexInCustomTable = index;
  }

  /**
   * Check the available custom io types.
   */
  private checkCustomIoTypes() {
    this.customIOTypes = [];

    let allCustomIoTypes = this.ioService.getCustomIoTypes();
    if (this.customIoPorts) {
      for (let type of allCustomIoTypes) {
        let key = type.replace(/\s/g, '');
        if (this.customIoPorts[key] && this.customIoPorts[key].length) {
          this.customIOTypes.push(type);
        }
      }
    }
  }

  /**
   * Find the default custom io type.
   * @returns the default custom io type.
   */
  private findDefaultType(): CustomIOType {

    if (this.customIoPorts) {
      let key = CustomIOType.InputBit.replace(/\s/g, '');

      if (this.customIoPorts[key] && this.customIoPorts[key].length) {
        return CustomIOType.InputBit;
      }

      key = CustomIOType.OutputBit.replace(/\s/g, '');
      if (this.customIoPorts[key] && this.customIoPorts[key].length) {
        return CustomIOType.OutputBit;
      }
    }
    return null;
  }
}
