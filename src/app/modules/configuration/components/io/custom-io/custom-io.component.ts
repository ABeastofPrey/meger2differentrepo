import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  EventEmitter
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatTable, MatTableDataSource, MatRow } from '@angular/material';

import {
  CustomIOTypes,
  CustomIOType,
  IoTableColumn,
} from '../../../services/io.service.enum';
import {
  CustomIO,
  IoService,
  CustomIOPort,
} from '../../../services/io.service';
import { fromEvent } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-custom-io',
  templateUrl: './custom-io.component.html',
  styleUrls: ['./custom-io.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * This class describes the logics to custom io view.
 */
export class CustomIOComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tableIndex: number;

  /**
   * The custom io table columns.
   */
  customDisplayedColumns: IoTableColumn[] = [
    IoTableColumn.Type,
    IoTableColumn.Port,
    IoTableColumn.Value,
    IoTableColumn.Label,
  ];

  /**
   * The CustomIOTypes enum object reference.
   */
  // tslint:disable-next-line: variable-name
  CustomIOTypeReference = CustomIOTypes;

  /**
   * The IoTableColumn enum object reference.
   */
  // tslint:disable-next-line: variable-name
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
  @ViewChild('customTable', { static: false })
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
   * The translation words.
   */
  private words: {};

  /**
   *  All the custom IO types.
   */
  private allCustomIoTypes: Array<{ key: CustomIOTypes, value: string }>;

  private stopNoticer: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('addRow', { static: true }) private addRowViewRef: any;
  @ViewChild('deleteRow', { static: true }) private deleteRowViewRef: any;

  /**
   * Constructor.
   * @param ioService The ioService instance.
   */
  constructor(private ioService: IoService,
    private _elementRef: ElementRef,
    private trn: TranslateService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.tableIndex = 1;
    this.customDataSource = new MatTableDataSource([]);
    this.changeSelectRow(null, -1);
    this.enableButtonsInCustomTab(true, false);
    this.customHex = false;

    this.trn.get(['io']).subscribe(words => {
      this.words = words['io'];
      this.allCustomIoTypes = [
        { key: CustomIOTypes.InputBit, value: this.words['inputBit'] },
        { key: CustomIOTypes.InputByte, value: this.words['inputByte'] },
        { key: CustomIOTypes.InputWord, value: this.words['inputWord'] },
        { key: CustomIOTypes.OutputBit, value: this.words['outputBit'] },
        { key: CustomIOTypes.OutputByte, value: this.words['outputByte'] },
        { key: CustomIOTypes.OutputWord, value: this.words['outputWord'] },
      ];
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.stopNoticer.emit(false);
  }

  ngAfterViewInit() {
    this.queryCustomIOPorts();

    fromEvent(this.addRowViewRef._elementRef.nativeElement, 'click')
      .pipe(takeUntil(this.stopNoticer), throttleTime(200))
      .subscribe(() => {
        this.addRowInCustomTable();
      });

    fromEvent(this.deleteRowViewRef._elementRef.nativeElement, 'click')
      .pipe(takeUntil(this.stopNoticer), throttleTime(200))
      .subscribe(() => {
        this.deleteRowInCustomTable();
      });
    this.ioService.refreshCustomIO.pipe(
      takeUntil(this.stopNoticer)
    ).subscribe((selectedTableIndex) => {
      if (selectedTableIndex !== this.tableIndex) return;
      this.refreshTable();
    });
  }

  /**
   * query custom ports
   */
  public queryCustomIOPorts() {
    this.ioService
      .queryCustomIoPorts()
      .then(() => {
        this.customIoPorts = this.ioService.getCustomIoPorts();
        this.checkCustomIoTypes();
      })
      .then(() => {
        this.refreshTable();
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
    const defaultType = this.findDefaultType();

    if (defaultType) {
      const portKey = defaultType.replace(/\s/g, '');

      let typeValue = null;
      for (const type of this.allCustomIoTypes) {
        if (type.key === defaultType) {
          typeValue = type.value;
          break;
        }
      }

      this.customDataSource.data.push({
        type: this.allCustomIoTypes,
        port: this.customIoPorts[portKey],
        selectedType: { key: defaultType, value: typeValue },
        selectedPort: this.customIoPorts[portKey][0],
        value: '',
        label: '',
      });

      const newRow = this.customDataSource.data[
        this.customDataSource.data.length - 1
      ];
      this.ioService
        .addCustomIo(
          this.tableIndex,
          newRow.selectedType,
          newRow.selectedPort,
          this.customHex
        )
        .then(() => {
          this.customDataSource.data[
            this.customDataSource.data.length - 1
          ] = this.ioService.getCustomIo(
            this.customIOTypes,
            this.customIoPorts
          );
          this.customTable.renderRows();

          this.changeSelectRow(
            this.customDataSource.data[this.customDataSource.data.length - 1],
            this.customDataSource.data.length - 1
          );
          this.enableButtonsInCustomTab(true, true);
        });
    }
  }

  /**
   * Delete one row in the custom IO table.
   */
  deleteRowInCustomTable() {
    if (this.selectedIndexInCustomTable === -1) return;
    const isSelectBottomLine = (this.selectedIndexInCustomTable !== this.customDataSource.data.length - 1) ? false : true;
    this.ioService
      .removeCustomIo(this.tableIndex, this.selectedIndexInCustomTable + 1)
      .then(() => {
        this.customDataSource.data.splice(this.selectedIndexInCustomTable, 1);
        this.customTable.renderRows();

        if (isSelectBottomLine) {
          this.changeSelectRow(
            this.customDataSource.data[this.customDataSource.data.length - 1],
            this.customDataSource.data.length - 1
          );
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
    const ports = this.customIoPorts[value.replace(/\s/g, '')];
    const select = ports.find(
      e => e === this.customDataSource.data[index].selectedPort
    );

    if (!select) {
      this.ioService
        .modifyCustomIo(
          this.tableIndex,
          index + 1,
          this.customDataSource.data[index].selectedType,
          ports[0],
          this.customHex
        )
        .then(() => {
          this.customDataSource.data[index] = this.ioService.getCustomIo(
            this.customIOTypes,
            this.customIoPorts
          );
          this.customTable.renderRows();
        });
      return;
    }

    this.ioService
      .modifyCustomIo(
        this.tableIndex,
        index + 1,
        this.customDataSource.data[index].selectedType,
        this.customDataSource.data[index].selectedPort,
        this.customHex
      )
      .then(() => {
        this.customDataSource.data[index] = this.ioService.getCustomIo(
          this.customIOTypes,
          this.customIoPorts
        );
        this.customTable.renderRows();
      });
  }

  /**
   * The method to handle the custom IO port change.
   * @param index The row index.
   * @param value The changed value of the custom IO port.
   */
  portSelectionChange(index, value) {
    this.ioService
      .modifyCustomIo(
        this.tableIndex,
        index + 1,
        this.customDataSource.data[index].selectedType,
        value,
        this.customHex
      )
      .then(() => {
        let rowData = this.ioService.getCustomIo(
          this.customIOTypes,
          this.customIoPorts
        );
        if (rowData) {
          this.customDataSource.data[index] = rowData;
          this.customTable.renderRows();
        }
      });
  }

  /**
   * The handler method if the hex checkbox is changed.
   */
  customHexChanged() {
    this.ioService.queryCustomIos(this.tableIndex, this.customHex).then(() => {
      this.customDataSource.data = this.ioService.getCustomIos(
        this.customIOTypes,
        this.customIoPorts
      );
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

    const entry = this.customDataSource.data[index];
    if (entry.selectedType.key === CustomIOTypes.InputBit) {
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
    this.queryCustomIOPorts();
    return true;
  }

  /**
   * Enable or disable the buttons in the custom IO tab.
   * @param isAddEnable wheter the add button is enabled.
   * @param isDeleteEnable whether the delete button is enabled.
   */
  private enableButtonsInCustomTab(
    isAddEnable: boolean,
    isDeleteEnable: boolean
  ) {
    this.isAddEnable = isAddEnable;
    this.isDeleteEnable = isDeleteEnable;

    if (this.customDataSource.data.length === 0) {
      this.isDeleteEnable = false;
    }

    this.isAddEnable = this.customDataSource.data.length > 99 ? false : true;

    if (!this.customIOTypes.length) {
      this.isAddEnable = false;
    }

    this.changeDetectorRef.markForCheck();
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

    if (this.customIoPorts) {
      for (const type of this.allCustomIoTypes) {
        const key = type.key.replace(/\s/g, '');
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
  private findDefaultType(): CustomIOTypes {
    if (this.customIoPorts) {
      let key = CustomIOTypes.InputBit.replace(/\s/g, '');

      if (this.customIoPorts[key] && this.customIoPorts[key].length) {
        return CustomIOTypes.InputBit;
      }

      key = CustomIOTypes.OutputBit.replace(/\s/g, '');
      if (this.customIoPorts[key] && this.customIoPorts[key].length) {
        return CustomIOTypes.OutputBit;
      }
    }
    return null;
  }

  private refreshTable(): void {
    if (this.customIOTypes.length) {
      this.ioService
        .queryCustomIos(this.tableIndex, this.customHex)
        .then(() => {
          const res = this.ioService.getCustomIos(
            this.customIOTypes,
            this.customIoPorts
          );
          if (this.customDataSource.data.length === 0) {
            this.customDataSource.data = res;
          } else {
            res.forEach((x, i) => {
              this.customDataSource.data[i].selectedType = x.selectedType;
              this.customDataSource.data[i].selectedPort = x.selectedPort;
              this.customDataSource.data[i].label = x.label;
              this.customDataSource.data[i].value = x.value;
              (this.customDataSource.data[i].type.length !== x.type.length) &&
                (this.customDataSource.data[i].type = x.type);
              (this.customDataSource.data[i].port.length = x.port.length) &&
                (this.customDataSource.data[i].port = x.port);
            });
          }

          this.enableButtonsInCustomTab(true, true);
        });
    }
  }
}
