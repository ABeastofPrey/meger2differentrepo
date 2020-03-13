import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchSettingService } from '../../../services/arch-setting.service';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { TerminalService } from '../../../../home-screen/services/terminal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

export interface ArchElement {
  index: number;
  depart: number;
  approach: number;
}

const columns = ['archCol', 'departZCol', 'approachZCol'];

@Component({
  selector: 'app-arch-setting',
  templateUrl: 'arch-setting.component.html',
  styleUrls: ['arch-setting.component.css'],
})
export class ArchSettingComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = columns;
  dataSource: ArchElement[] = null;

  private previousValue: string;
  private currentValue: string;
  private words: {};
  private notifier: Subject<boolean> = new Subject();

  constructor(
    private asService: ArchSettingService,
    private terminalService: TerminalService,
    public snackBar: MatSnackBar,
    private trn: TranslateService
  ) {
    this.terminalService.sentCommandEmitter
      .pipe(takeUntil(this.notifier))
      .subscribe(cmd => {
        this.getTableData();
      });
  }

  ngOnInit() {
    this.getTableData();
    this.trn.get(['projectSettings.arch']).subscribe(words => {
      this.words = words['projectSettings.arch'];
    });
  }

  ngOnDestroy(): void {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  onFocus(event: FocusEvent | { target: { value: string | number }}): void {
    this.previousValue = (event.target as HTMLInputElement).value;
  }

  async onBlur(
    event: FocusEvent | { target: { value: string | number }},
    index: string,
    changedValue: string,
    departOrApproach: '1' | '2'
  ): Promise<void> {
    if (this.previousValue === (event.target as HTMLInputElement).value) {
      return;
    }
    if (!this.validator((event.target as HTMLInputElement).value)) {
      (event.target as HTMLInputElement).value = this.previousValue;
      // this.snackBar.open(this.words['positiveNumTip'], '', { duration: 2000 });
      console.log('Replace snack: ' + this.words['positiveNumTip']);
      return;
    }
    try {
      await this.asService.setArch(
        Number(index),
        Number(departOrApproach) as 1 | 2,
        Number(changedValue)
      );
      // this.snackBar.open(this.words['valChangedTip'], '', { duration: 1500 });
      console.log('Replace snack: ' + this.words['valChangedTip']);
    } catch (err) {
      console.error('Change value failed: ' + err.errString);
    }
  }

  onKeyup(event: KeyboardEvent | { target: { value: string | number }, key?: string }): void {
    if (event.key === 'Enter') {
      (event.target as HTMLElement).blur();
    }
  }

  async onReset(): Promise<void> {
    try {
      await this.asService.resetTable();
    } catch (err) {
      return console.error('Reset failed: ' + err.errString);
    }
    this.getTableData();
  }

  onKeydown(event: KeyboardEvent | { target: { value: string | number }}): void {
    this.currentValue = (event.target as HTMLInputElement).value;
  }

  private async getTableData(): Promise<void> {
    try {
      this.dataSource = (await this.asService.getInitTable()) as ArchElement[];
    } catch (err) {
      console.error(err.errString);
    }
  }

  private validator(currentValue: string): boolean {
    return currentValue === '' ||
      isNaN(Number(currentValue)) ||
      Number(currentValue) < 0
      ? false
      : true;
  }
}
