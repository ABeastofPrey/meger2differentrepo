import { Component, OnInit, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { MatSort, MatTableDataSource, MatTabChangeEvent, MatDialog } from '@angular/material';

import { FormControl, Validators } from '@angular/forms';

import { IO, IoService } from '../../services/io.service';
import { IoOption, IoFormatOption, IoTableColumn } from '../../services/io.service.enum';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';

import { CustomIOComponent } from './custom-io/custom-io.component';

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
  displayedColumns: IoTableColumn[] = [IoTableColumn.Port, IoTableColumn.Value, IoTableColumn.Label];

  /**
   * The io query options.
   */
  ioOptions: IoOption[] = [];

  /**
   * The io value format options.
   */
  radioButtonOptions: IoFormatOption[] = [];

  /**
   * Whether the io value is in hex format.
   */
  hex: boolean = false;

  /**
   * The selected io option in left table.
   */
  leftSelected: IoOption;

  /**
   * The selected io option in right table.
   */
  rightSelected: IoOption;

  /**
   * The selected io format option in left table.
   */
  leftRadioOptions: IoFormatOption;

  /**
   * The selected io format option in right table.
   */
  rightRadioOptions: IoFormatOption;

  /**
   * The IoFormatOption enum object reference.
   */
  ioFormatOptionReference = IoFormatOption;

  /**
   * The IoTableColumn enum object reference.
   */
  IoTableColumnReference = IoTableColumn;

  /**
   * The data source for left table.
   */
  leftDataSource: MatTableDataSource<IO>;

  /**
   * The data source for right table.
   */
  rightDataSource: MatTableDataSource<IO>;

  /**
   * The tabs used for custom view display.
   */
  tabs: Array<string> = [];
  tabsInLib: Array<string> = [];
  tabsTemp: Array<string> = [];

  /**
   * Current selected tab view.
   */
  selected = new FormControl(0);

  /**
   * Tab index used for tab count and search.
   */
  customTabAddIndex = 1;
  customTabDeleteIndex = 0;
  customEmptyIndex: Array<number> = [0, 0, 0];

  /**
   * Created formControl for at most 3 custom tab view.
   */
  customViewFormControl: Array<FormControl> = [];

  /**
   * The list of matsort directives.
   */
  @ViewChildren(MatSort) sorts: QueryList<MatSort>;

  /**
   * The list of custom io views.
   */
  @ViewChildren(CustomIOComponent) customIos: QueryList<CustomIOComponent>;

  /**
   * Constructor.
   * @param ioService The IoService instance.
   */
  constructor(private ioService: IoService, private dialog: MatDialog) {

    this.leftDataSource = new MatTableDataSource([]);
    this.rightDataSource = new MatTableDataSource([]);

    this.ioOptions = ioService.getIoOptions();
    this.radioButtonOptions = ioService.getIoFormatOptions();
    this.leftSelected = IoOption.AllInputs;
    this.rightSelected = IoOption.AllOutputs;
    this.leftRadioOptions = IoFormatOption.Bit;
    this.rightRadioOptions = IoFormatOption.Bit;
  }

  ngOnInit() {
    this.ioService.queryCustomTabs().then(() => {
      this.tabsTemp = this.ioService.getCustomTabs();
      this.tabsInLib = this.tabsTemp;
      this.tabs = this.tabsTemp.filter(x => x !== ' ');

      let i = 0;
      for (i = 0; i < this.tabsInLib.length; i++) {
        if (this.tabsInLib[i] === ' ') {
          this.customEmptyIndex[i] = 0;
        } else {
          this.customEmptyIndex[i] = 1;
        }
      }

    for (i = 0; i < this.tabs.length; i++) {
      this.customViewFormControl[i] = new FormControl(this.tabs[i], [
        Validators.required,
      ]);
    }

    });
  }

  ngAfterViewInit() {
    this.onViewSelectionChange('all');
    this.customTabDeleteIndex = 0;
  }

  /**
   * Add at most three custom tab view.
   */
  addCustomTab() {
    if (this.customEmptyIndex.indexOf(0) < 0) {
      return;
    }

    this.customTabAddIndex = this.customEmptyIndex.indexOf(0) + 1;
    let tabName = 'Custom View ' + this.customTabAddIndex;
    let newCustomViewFormControl = new FormControl(tabName, [
      Validators.required,
    ]);

    if (this.customTabAddIndex > this.tabs.length) {
      this.customViewFormControl.push(newCustomViewFormControl);
      this.tabs.push(tabName);
    } else {
      this.customViewFormControl.splice(this.customTabAddIndex - 1, 0, newCustomViewFormControl);
      this.tabs.splice(this.customTabAddIndex - 1, 0, tabName);
    }

    this.ioService.setCustomTabName(this.customTabAddIndex, tabName);
    this.customEmptyIndex[this.customTabAddIndex - 1] = 1;

    setTimeout(() => {this.selected.setValue(this.customTabAddIndex - 1); }, 0);
    setTimeout(() => {this.selected.setValue(this.customTabAddIndex); }, 0);
  }

  /**
   * delete current selected custom tab view.
   */
  deleteCustomTab() {
    let ref = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: 'Are you sure?',
        msg: 'The selected custom view will be deleted permanently.',
        yes: 'DELETE',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret => {
      if (ret) {
        if (this.tabs.length === 1) {
          this.customViewFormControl.splice(0, 1);
          this.tabs.splice(0, 1);
        } else {
          this.customViewFormControl.splice(this.customTabDeleteIndex - 1, 1);
          this.tabs.splice(this.customTabDeleteIndex - 1, 1);
        }

        if (this.customTabDeleteIndex < this.customEmptyIndex.indexOf(1, this.customTabDeleteIndex - 1) + 1) {
          this.customTabDeleteIndex = this.customEmptyIndex.indexOf(1, this.customTabDeleteIndex - 1) + 1;
        }
        this.ioService.setCustomTabName(this.customTabDeleteIndex, ' ');
        this.ioService.clearCustomTab(this.customTabDeleteIndex);
        this.customEmptyIndex[this.customTabDeleteIndex - 1] = 0;

        this.refreshCustomIoTab(this.selected.value);
      }
    });
  }

  /**
   * The handler method if the selected tab view is changed.
   * @param event MatTabChangeEvent.
   */
  onSelectedTabChange(event: MatTabChangeEvent) {
    this.customTabDeleteIndex = event.index;

    this.refreshCustomIoTab(event.index);

    if (event.index === 0) {
      this.onViewSelectionChange('all');
    }
  }

  /**
   * The method to update the IO table.
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
   * The method to handle if the radio button is clicked in IO table.
   * @param port The IO port.
   * @param flag The flag to indicate which table needs update.
   * @returns If it is output, return true.
   */
  onClickRadioButtonInIO(port: number, flag: string): boolean {
    if (flag === 'right') {
      return this.changeIoValue(port, 'left', this.rightSelected, this.rightDataSource);
    } else {
      return this.changeIoValue(port, 'right', this.leftSelected, this.leftDataSource);
    }
  }

  /**
   * The handler method if the tab label is changed.
   */
  tabLabelChange(event) {
    event.stopPropagation();
  }

  /**
   * The handler method for tab label name is changed.
   * @param index the index of the tab. 1 for the first custom tab.
   * @param name the new name for the tab.
   */
  tabLabelNameChange(index: number, name: string) {
    this.ioService.setCustomTabName(index + 1, name);
  }

  /**
   * Calculate the custom io tab index in the io library.
   * @param selectedIndex current selected tab index.
   * @return the custom io tab index.
   */
  calculateCustomIoTabIndex(selectedIndex: number): number {
    let count = 0;
    for (let i = 0; i < this.customEmptyIndex.length; i++) {
      if (this.customEmptyIndex[i] !== 0) {
        count = count + 1;
        if (count === selectedIndex) {
          return i + 1;
        }
      }
    }
    return selectedIndex;
  }

  /**
   * Refresh the custom io tab.
   * @param index The index of the selected custom io tab.
   */
  private refreshCustomIoTab(index: number) {
    let selectedIndex = this.calculateCustomIoTabIndex(index);

    let customIo = this.customIos.find(item => item.tableIndex === selectedIndex);
    if (customIo) {
      customIo.ngAfterViewInit();
    }
  }

  /**
   * Update the io table.
   * @param ioOption The io query option.
   * @param formatOption The io format option.
   * @param dataSource The table data source.
   * @param sort The MatSort instance.
   */
  private updateTable(ioOption: IoOption, formatOption: string, isHex: boolean, dataSource: MatTableDataSource<IO>, sort: MatSort) {
    this.ioService.queryIos(ioOption, formatOption, isHex).then(() => {
      dataSource.data = this.ioService.getIos();
      dataSource.sort = sort;
    });
  }

  /**
   * Change Io value by the IoService.
   * @param port The IO port.
   * @param flag The flag to indicate which table needs update
   * @param ioOption The io query option.
   * @param dataSource The table data source.
   * @returns if it is output, return true.
   */
  private changeIoValue(port: number, flag: string, ioOption: string, dataSource: MatTableDataSource<IO>): boolean {
    if ((ioOption === IoOption.AllInputs) || (ioOption === IoOption.DriveIoInputs) || (ioOption === IoOption.UserIoInputs)) {
      return false;
    }

    for (const entry of dataSource.filteredData) {
      if (entry.port === port) {
        if (entry.value === '1') {
          entry.value = '0';
        } else {
          entry.value = '1';
        }
        this.ioService.setIoByBit(entry.port, entry.value);
        this.onViewSelectionChange(flag);
        break;
      }
    }

    return true;
  }
}
