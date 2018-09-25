import { Component, OnInit, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { IO, IoService } from '../../services/io.service';

@Component({
  selector: 'app-io',
  templateUrl: './io.component.html',
  styleUrls: ['./io.component.css']
})

export class IoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['index', 'value', 'label'];
  ioOptions: string[] = [];

  radioButtonOptions: string[] = [];
  command: string;
  hex: boolean = false;

  leftSelected = '';
  rightSelected = '';
  leftRadioOptions = '';
  rightRadioOptions = '';
  leftDataSource: MatTableDataSource<IO>;
  rightDataSource: MatTableDataSource<IO>;

  @ViewChildren(MatSort)
  sorts: QueryList<MatSort>;

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

  onViewSelectionChange(flag) {
    switch (flag) {
      case 'left':
        this.updateTable(this.leftSelected, this.leftRadioOptions, this.hex, this.leftDataSource, this.sorts.first);
        break;
      case 'right':
        this.updateTable(this.rightSelected, this.rightRadioOptions, this.hex, this.rightDataSource, this.sorts.last);
        break;
      case 'all':
        this.updateTable(this.leftSelected, this.leftRadioOptions, this.hex, this.leftDataSource, this.sorts.first);
        this.updateTable(this.rightSelected, this.rightRadioOptions, this.hex, this.rightDataSource, this.sorts.last);
        break;
      default:
    }
  }

  onClickRadioButton(index, flag): boolean {
    if (flag === 'right') {
      return this.changeIoValue(index, 'left', this.rightSelected, this.rightDataSource);
    } else {
      return this.changeIoValue(index, 'right', this.leftSelected, this.leftDataSource);
    }
  }

  private updateTable(ioOption: string, formatOption: string, isHex: boolean, dataSource: MatTableDataSource<IO>, sort: MatSort) {
    this.ioService.query(ioOption, formatOption, isHex).then(() => {
      dataSource.data = this.ioService.getIos();
      dataSource.sort = sort;
    });
  }

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
