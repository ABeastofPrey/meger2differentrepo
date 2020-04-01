import { ProjectManagerService } from './../core/services/project-manager.service';
import { CommonService } from './../core/services/common.service';
import { Component, OnInit } from '@angular/core';
import { TpStatService } from '../core';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material';
import { ShortcutsComponent } from './components/shortcuts/shortcuts.component';
import { UtilsService } from '../core/services/utils.service';
import { ActivationComponent } from './components/activation/activation.component';
import { ActivationService } from './components/activation/activation.service';
import { Either, IO } from 'ramda-fantasy';
import { then, compose, identity, or, useWith, equals, ifElse } from 'ramda';
import { isNilOrEmpty } from 'ramda-adjunct';
import { MD5 } from 'crypto-js';
import { BugReportComponent } from './components/bug-report/bug-report.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'help-screen',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
})
export class HelpComponent implements OnInit {
  online = false;
  env = environment;
  isActivated = false;

  private notifier: Subject<boolean> = new Subject();

  constructor(
    private stat: TpStatService,
    private dialog: MatDialog,
    private actService: ActivationService,
    public utils: UtilsService,
    public cmn: CommonService,
    private prj: ProjectManagerService
  ) {}

  get isNotKuka(): boolean {
    return !this.utils.IsKuka;
  }

  startTour() {
    this.cmn.showTourDialog(true, this.prj.currProject.value);
  }

  ngOnInit() {
    this.stat.onlineStatus.pipe(takeUntil(this.notifier)).subscribe(stat => {
      this.online = stat;

      // Check activation status for kuka platform.
      if (this.utils.IsKuka) {
        this.checkActivationStatus();
      }
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  showShortcuts() {
    this.dialog.open(ShortcutsComponent);
  }

  activation(): void {
    this.dialog
      .open(ActivationComponent, { disableClose: true, width: '250px' })
      .afterClosed()
      .subscribe(machineId => {
        if (machineId) {
          this.saveHashKey(machineId);
        }
      });
  }

  private async checkActivationStatus(): Promise<void> {
    const [id, key] = await this.getIdAndKey();
    this.checkStatus(id, key);
  }

  private async getIdAndKey(): Promise<string[]> {
    const getId = this.actService.getMachineId.bind(this.actService);
    const getKey = this.actService.getKey.bind(this.actService);
    const logErrIO = err => IO(() => console.warn(err));
    const runErrIO = compose(
      IO.runIO,
      logErrIO
    );
    const logOrID = Either.either(runErrIO, identity);
    const logOrKey = Either.either(runErrIO, identity);
    const fetchID = compose(
      then(logOrID),
      getId
    );
    const fetchKey = compose(
      then(logOrKey),
      getKey
    );
    return Promise.all([fetchID(), fetchKey()]);
  }

  private checkStatus(machineId: string, key: string): void {
    const hasIllegalValue = useWith(or, [isNilOrEmpty, isNilOrEmpty])(
      machineId,
      key
    );
    if (hasIllegalValue) {
      return;
    }
    const hashCode = MD5(machineId).toString();
    const equal2SavedKey = equals(key);
    const nothing = () => {};
    const setActivate = () => (this.isActivated = true);
    const doCheck = ifElse(equal2SavedKey, setActivate, nothing);
    doCheck(hashCode);
  }

  private async saveHashKey(machineId: string): Promise<void> {
    const hashCode = MD5(machineId).toString();
    const logErrIO = err => IO(() => console.warn(err));
    const runErrIO = compose(
      IO.runIO,
      logErrIO
    );
    const activate = () => (this.isActivated = true);
    const logOrActivate = Either.either(runErrIO, activate);
    const saveKey = this.actService.setKey.bind(this.actService);
    const doIt = compose(
      then(logOrActivate),
      saveKey
    );
    doIt(hashCode);
  }

  bugReport() {
    this.dialog.open(BugReportComponent);
  }
}
