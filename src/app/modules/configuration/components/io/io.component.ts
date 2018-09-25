import { Component, OnInit, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { IO, IoService } from '../../services/io.service';

@Component({
  selector: 'app-io',
  templateUrl: './io.component.html',
  styleUrls: ['./io.component.css']
})

/**
 * This class describes the logics to io monitor.
 */
export class IoComponent implements OnInit, AfterViewInit {

  /**
   * The io table columns.
   */
  displayedColumns: string[] = ['index', 'value', 'label'];

  /**
   * The io query options.
   */
  ioOptions: string[] = [];

  /**
   * The io value format options.
   */
  radioButtonOptions: string[] = [];

  /**
   * Whether the io value is in hex format.
   */
  hex: boolean = false;

  /**
   * The selected io option in left table.
   */
  leftSelected = '';

  /**
   * The selected io option in right table.
   */
  rightSelected = '';

  /**
   * The selected io format option in left table.
   */
  leftRadioOptions = '';

  /**
   * The selected io format option in right table.
   */
  rightRadioOptions = '';

  /**
   * The data source for left table.
   */
  leftDataSource: MatTableDataSource<IO>;

  /**
   * The data source for right table.
   */
  rightDataSource: MatTableDataSource<IO>;

  /**
   * The list of matsort directives.
   */
  @ViewChildren(MatSort)
  sorts: QueryList<MatSort>;

  /**
   * Constructor.
   * @param ioService The IoService instance.
   */
  constructor(private ioService: IoService) {

    this.leftDataSource = new MatTableDataSource([]);
    this.rightDataSource = new MatTableDataSource([]);

    this.ioOptions = ioService.getIoOptions();
    this.radioButtonOptions = ioService.getIoFormatOptions();
    this.leftSelected = this.ioOptions[0];
    this.rightSelected = this.ioOptions[1];
    this.leftRadioOptions = this.radioButtonOptions[0];
    this.rightRadioOptions = this.radioButtonOptions[0];

  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.onViewSelectionChange('all');
  }

  /**
   * The handler method if the radio button selection is changed.
   * @param flag The flag to indicate which table needs update.
   */
  onViewSelectionChange(flag) {
    if (flag === 'left') {
      this.updateTable(this.leftSelected, this.leftRadioOptions, this.hex, this.leftDataSource, this.sorts.first);
    }

    if (flag === 'right') {
      this.updateTable(this.rightSelected, this.rightRadioOptions, this.hex, this.rightDataSource, this.sorts.last);
    }

    if (flag === 'all') {
      this.updateTable(this.leftSelected, this.leftRadioOptions, this.hex, this.leftDataSource, this.sorts.first);
      this.updateTable(this.rightSelected, this.rightRadioOptions, this.hex, this.rightDataSource, this.sorts.last);
    }
  }

  /**
   * The handler method if the radio button selection is changed.
   * @param index The selected row index.
   * @param flag The flag to indicate which table needs update.
   */
  onClickRadioButton(index, flag): boolean {
    if (flag === 'right') {
      return this.changeIoValue(index, 'left', this.rightSelected, this.rightDataSource);
    } else {
      return this.changeIoValue(index, 'right', this.leftSelected, this.leftDataSource);
    }
  }

  /**
   * Update the io table.
   * @param ioOption The io query option.
   * @param formatOption The io format option.
   * @param dataSource The table data source.
   * @param sort The MatSort instance.
   */
  private updateTable(ioOption: string, formatOption: string, isHex: boolean, dataSource: MatTableDataSource<IO>, sort: MatSort) {
    this.ioService.query(ioOption, formatOption, isHex).then(() => {
      dataSource.data = this.ioService.getIos();
      dataSource.sort = sort;
    });
  }

  /**
   * Change Io value by the IoService.
   * @param index The selected row index.
   * @param flag The flag to indicate which table needs update
   * @param ioOption The io query option.
   * @param dataSource The table data source.
   */
  private changeIoValue(index: number, flag: string, ioOption: string, dataSource: MatTableDataSource<IO>): boolean {
    if (ioOption === (this.ioOptions[0] || this.ioOptions[2])) {
      return false;
    }

    for (const entry of dataSource.filteredData) {
      if (entry.index === index) {
        if (entry.value === '1') {
          entry.value = '0';
        } else {
          entry.value = '1';
        }
        this.ioService.setIoByBit(entry.index, entry.value);
        this.onViewSelectionChange(flag);
        break;
      }
    }

    return true;
  }
}
