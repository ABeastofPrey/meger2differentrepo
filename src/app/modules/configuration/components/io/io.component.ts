import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  AfterViewInit,
  QueryList,
} from '@angular/core';
import {
  MatSort,
  MatTableDataSource,
  MatTabChangeEvent,
  MatDialog, MatTab
} from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { IO, IoService } from '../../services/io.service';
import {
  IoOption,
  IoOptions,
  IoFormatOption,
  IoFormatOptions,
  IoTableColumn,
} from '../../services/io.service.enum';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomIOComponent } from './custom-io/custom-io.component';
import { LoginService } from '../../../core';

@Component({
  selector: 'app-io',
  templateUrl: './io.component.html',
  styleUrls: ['./io.component.css'],
})

/**
 * This class describes the logics to io monitor.
 */
export class IoComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * The io table columns.
   */
  displayedColumns: IoTableColumn[] = [
    IoTableColumn.Port,
    IoTableColumn.Value,
    IoTableColumn.Label,
  ];

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
  hex = false;

  /**
   * The selected io option in left table.
   */
  leftSelected: IoOption = {
    key: IoOptions.AllInputs,
    value: IoOptions.AllInputs,
  };

  /**
   * The selected io option in right table.
   */
  rightSelected: IoOption = {
    key: IoOptions.AllOutputs,
    value: IoOptions.AllOutputs,
  };

  /**
   * The selected io format option in left table.
   */
  leftRadioOptions: IoFormatOption = {
    key: IoFormatOptions.Bit,
    value: IoFormatOptions.Bit,
  };

  /**
   * The selected io format option in right table.
   */
  rightRadioOptions: IoFormatOption = {
    key: IoFormatOptions.Bit,
    value: IoFormatOptions.Bit,
  };

  /**
   * The IoTableColumn enum object reference.
   */
  // tslint:disable-next-line: variable-name
  IoTableColumnReference = IoTableColumn;

  /**
   * The IoFormatOptions enum object reference.
   */
  // tslint:disable-next-line: variable-name
  IoFormatOptionsReference = IoFormatOptions;

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
  tabs: string[] = [];
  tabsInLib: string[] = [];
  tabsTemp: string[] = [];

  /**
   * Current selected tab view.
   */
  selected = new FormControl(0);

  /**
   * Tab index used for tab count and search.
   */
  customTabAddIndex = 1;
  customTabDeleteIndex = 0;
  customEmptyIndex: number[] = [0, 0, 0];

  /**
   * Created formControl for at most 3 custom tab view.
   */
  customViewFormControl: FormControl[] = [];

  /**
   * The list of matsort directives.
   */
  @ViewChildren(MatSort) sorts: QueryList<MatSort>;

  /**
   * The list of custom io views.
   */
  @ViewChildren(CustomIOComponent) customIos: QueryList<CustomIOComponent>;

  @ViewChild('standardIOTab', { static: true }) standardIOTab: MatTab;

  private words: {};

  private refreshInterval: any;

  /**
   * Constructor.
   * @param ioService The IoService instance.
   */
  constructor(
    private ioService: IoService,
    private dialog: MatDialog,
    public login: LoginService,
    private trn: TranslateService
  ) {
    this.trn.get(['io']).subscribe(words => {
      this.words = words['io'];
      this.ioOptions = [
        { key: IoOptions.AllInputs, value: this.words['allInputs'] },
        { key: IoOptions.AllOutputs, value: this.words['allOutputs'] },
        { key: IoOptions.DriveIoInputs, value: this.words['driveIoInputs'] },
        { key: IoOptions.DriveIoOutputs, value: this.words['driveIoOutputs'] },
        { key: IoOptions.UserIoInputs, value: this.words['userIoInputs'] },
        { key: IoOptions.UserIoOutputs, value: this.words['userIoOutputs'] },
      ];
      this.radioButtonOptions = [
        { key: IoFormatOptions.Bit, value: this.words['bit'] },
        { key: IoFormatOptions.Byte, value: this.words['byte'] },
        { key: IoFormatOptions.Word, value: this.words['word'] },
      ];
      this.leftSelected.value = this.words['allInputs'];
      this.rightSelected.value = this.words['allInputs'];
      this.leftRadioOptions.value = this.words['bit'];
      this.rightRadioOptions.value = this.words['bit'];
    });
    this.leftDataSource = new MatTableDataSource([]);
    this.rightDataSource = new MatTableDataSource([]);
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

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
  }

  ngAfterViewInit() {
    this.onViewSelectionChange('all');
    this.customTabDeleteIndex = 0;
    this.refreshInterval = setInterval(() => {
      if (this.standardIOTab.isActive) {
        this.onViewSelectionChange('all');
  }
    }, 1000);
  }

  /**
   * Add at most three custom tab view.
   */
  addCustomTab() {
    if (this.customEmptyIndex.indexOf(0) < 0) {
      return;
    }

    this.customTabAddIndex = this.customEmptyIndex.indexOf(0) + 1;
    const tabName = this.words['customView'] + ' ' + this.customTabAddIndex;
    const newCustomViewFormControl = new FormControl(tabName, [
      Validators.required,
    ]);

    if (this.customTabAddIndex > this.tabs.length) {
      this.customViewFormControl.push(newCustomViewFormControl);
      this.tabs.push(tabName);
    } else {
      this.customViewFormControl.splice(
        this.customTabAddIndex - 1,
        0,
        newCustomViewFormControl
      );
      this.tabs.splice(this.customTabAddIndex - 1, 0, tabName);
    }

    this.ioService.setCustomTabName(this.customTabAddIndex, tabName);
    this.customEmptyIndex[this.customTabAddIndex - 1] = 1;

    setTimeout(() => {
      this.selected.setValue(this.customTabAddIndex - 1);
    }, 0);
    setTimeout(() => {
      this.selected.setValue(this.customTabAddIndex);
    }, 0);
  }

  /**
   * delete current selected custom tab view.
   */
  deleteCustomTab() {
    const ref = this.dialog.open(YesNoDialogComponent, {
      disableClose: true,
      data: {
        title: this.words['dialogTitle'],
        msg: this.words['dialogMsg'],
        yes: this.words['dialogYes'],
        no: this.words['dialogNo'],
      },
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

        if (
          this.customTabDeleteIndex <
          this.customEmptyIndex.indexOf(1, this.customTabDeleteIndex - 1) + 1
        ) {
          this.customTabDeleteIndex =
            this.customEmptyIndex.indexOf(1, this.customTabDeleteIndex - 1) + 1;
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
      this.leftRadioOptions.value = this.words[this.leftRadioOptions.key];
      this.updateTable(
        this.leftSelected.key,
        this.leftRadioOptions.key,
        this.hex,
        this.leftDataSource,
        this.sorts.first
      );
    }

    if (flag === 'right') {
      this.rightRadioOptions.value = this.words[this.rightRadioOptions.key];
      this.updateTable(
        this.rightSelected.key,
        this.rightRadioOptions.key,
        this.hex,
        this.rightDataSource,
        this.sorts.last
      );
    }

    if (flag === 'all') {
      this.leftRadioOptions.value = this.words[this.leftRadioOptions.key];
      this.rightRadioOptions.value = this.words[this.rightRadioOptions.key];
      this.updateTable(
        this.leftSelected.key,
        this.leftRadioOptions.key,
        this.hex,
        this.leftDataSource,
        this.sorts.first
      );
      this.updateTable(
        this.rightSelected.key,
        this.rightRadioOptions.key,
        this.hex,
        this.rightDataSource,
        this.sorts.last
      );
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
      return this.changeIoValue(
        port,
        'left',
        this.rightSelected.key,
        this.rightDataSource
      );
    } else {
      return this.changeIoValue(
        port,
        'right',
        this.leftSelected.key,
        this.leftDataSource
      );
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
    const selectedIndex = this.calculateCustomIoTabIndex(index);

    const customIo = this.customIos.find(
      item => item.tableIndex === selectedIndex
    );
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
  private updateTable(
    ioOption: IoOptions,
    formatOption: string,
    isHex: boolean,
    dataSource: MatTableDataSource<IO>,
    sort: MatSort
  ) {
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
  private changeIoValue(
    port: number,
    flag: string,
    ioOption: string,
    dataSource: MatTableDataSource<IO>
  ): boolean {
    if (
      ioOption === IoOptions.AllInputs ||
      ioOption === IoOptions.DriveIoInputs ||
      ioOption === IoOptions.UserIoInputs
    ) {
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
