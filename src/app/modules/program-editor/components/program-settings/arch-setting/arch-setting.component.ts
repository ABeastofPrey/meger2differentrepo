import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchSettingService } from '../../../services/arch-setting.service';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { TerminalService } from '../../../../home-screen/services/terminal.service';

export interface ArchElement {
  index: number;
  depart: number;
  approach: number;
}

const columns = ['archCol', 'departZCol', 'approachZCol'];

@Component({
  selector: 'app-arch-setting',
  templateUrl: 'arch-setting.component.html',
  styleUrls: ['arch-setting.component.css']
})
export class ArchSettingComponent implements OnInit, OnDestroy {
  public displayedColumns: string[] = columns;
  public dataSource: ArchElement[] = null;

  private previousValue: string;
  private currentValue: string;
  private subscription: any;
  private words: any;

  constructor(
    private asService: ArchSettingService,
    private terminalService: TerminalService,
    public snackBar: MatSnackBar,
    private trn: TranslateService) {
      this.subscription = this.terminalService.sentCommandEmitter.subscribe(cmd => {
        this.getTableData();
      });
    }

  ngOnInit() {
    this.getTableData();
    this.trn.get(['projectSettings.arch']).subscribe(words => {
      this.words = words['projectSettings.arch'];
    });
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  public onFocus(event: any): void {
    this.previousValue = event.target.value;
  }

  public async onBlur(event: any, index: string, changedValue: string, departOrApproach: '1' | '2'): Promise<void> {
    if (this.previousValue === event.target.value) { return; }
    if (!this.validator(event.target.value)) {
      event.target.value = this.previousValue;
      this.snackBar.open(this.words['positiveNumTip'], '', { duration: 2000, });
      return;
    }
    try {
      await this.asService.setArch(Number(index), Number(departOrApproach) as 1 | 2, Number(changedValue));
      this.snackBar.open(this.words['valChangedTip'], '', { duration: 1500, });
    } catch (err) {
      console.error('Change value failed: ' + err.errString);
    }
  }

  public onKeyup(event: any): void {
    if (event.keyCode === 13) {
      event.target.blur();
     }
  }

  public async onReset(event: any): Promise<void> {
    try {
      await this.asService.resetTable();
    } catch (err) {
      return console.error('Reset failed: ' + err.errString);
    }
    this.getTableData();
  }

  public onKeydown(event: any): void {
    this.currentValue = event.target.value;
  }

  private async getTableData(): Promise<void> {
    try {
      this.dataSource = await this.asService.getInitTable() as ArchElement[];
    } catch (err) {
      console.error(err.errString);
    }
  }

  private validator(currentValue: string): boolean {
    return (isNaN(Number(currentValue)) || Number(currentValue) < 0) ? false : true;
  }
}
