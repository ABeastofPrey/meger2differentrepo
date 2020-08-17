import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../core';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';
import {
  PluginsService,
  CheckHistoryVersion,
  DependenciesCheck,
  VersionState,
  DependenciesCheckState,
  DuplicationCheckState,
  DuplicationCheck,
  LibResponseRes,
  UnexpectionError,
} from '../plugins.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

export enum PluginStepId {
  HistoryCheck = 'step1',
  DependenciesCheck = 'step2',
  DuplicateCheck = 'step3',
  Installing = 'step4',
}

export enum I18StepTitle {
  HistoryCheck = 'pluginInstall.historyCheck.title',
  DependenciesCheck = 'pluginInstall.dependenciesCheck.title',
  DuplicateCheck = 'pluginInstall.duplicationCheck.title',
  Installing = 'pluginInstall.installing.title',
}

export interface IStep {
  title: I18StepTitle;
  id: PluginStepId; //1
  btnName: string;
  disabled: boolean;
  cancelBtnDisabled: boolean;
}

@Component({
  selector: 'app-install-plugin',
  templateUrl: './install-plugin.component.html',
  styleUrls: ['./install-plugin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallPluginComponent implements OnDestroy, OnInit {
  isBusy: boolean = true; //show loading

  pluginStepId: PluginStepId = PluginStepId.HistoryCheck;
  pluginStepIds = PluginStepId;

  errorTips: UnexpectionError | any = UnexpectionError.fileLoading;

  versionStates = VersionState; // version check
  versionStateInfo: CheckHistoryVersion;

  //dependencies check
  dependenciesCheckInfo: DependenciesCheck;
  dependenciesCheckStates = DependenciesCheckState;
  displayedColumns: string[] = ['name', 'require', 'act'];

  //duplicate file name check
  duplicationStates = DuplicationCheckState;
  duplicationInfo: DuplicationCheck;

  stepInfo: IStep = {
    title: I18StepTitle.HistoryCheck,
    btnName: 'pluginInstall.nextStep',
    id: PluginStepId.HistoryCheck,
    disabled: true,
    cancelBtnDisabled: false,
  };

  cancelBtnDisabled: boolean = false;

  private noticer: Subject<boolean> = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public fileData: File,
    public dialogRef: MatDialogRef<InstallPluginComponent, boolean>,
    private pluginService: PluginsService,
    private snackbarService: SysLogSnackBarService,
    private apiService: ApiService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.versionCheck(); //version check
  }

  ngOnDestroy() {
    this.noticer.next(true);
    this.noticer.unsubscribe();
  }

  // plugin version check
  public versionCheck(): void {
    this.pluginService
      .pluginExistCheck()
      .pipe(takeUntil(this.noticer))
      .subscribe((versionCheckRes: CheckHistoryVersion) => {
        this.isBusy = false;
        if (!versionCheckRes) {
          this.displayErrorInfo(UnexpectionError.versionCheck);
          return;
        }

        this.versionStateInfo = versionCheckRes;
        if (
          versionCheckRes.state === VersionState.NotInstall ||
          versionCheckRes.state === VersionState.DiffVersion
        ) {
          this.stepInfo.disabled = false;
        } else {
          this.stepInfo.disabled = true;
        }
        (this.errorTips = ''), this.changeDetectorRef.detectChanges();
      });
  }

  // stop install
  public onCancel(): void {
    this.stepInfo.cancelBtnDisabled = true;
    this.pluginService
      .cancelPluginInstall()
      .pipe(takeUntil(this.noticer))
      .subscribe(res => {
        this.stepInfo.cancelBtnDisabled = false;
      });
    this.dialogRef.close(false);
  }

  //next step
  public onNext(): void {
    let stepId = this.stepInfo.id;
    this.stepInfo.disabled = true;
    this.errorTips = '';
    this.isBusy = true;
    if (stepId === PluginStepId.HistoryCheck) {
      this.stepInfo.id = PluginStepId.DependenciesCheck;
      this.stepInfo.title = I18StepTitle.DependenciesCheck;
      this.pluginDependenciesCheck();
    } else if (stepId === PluginStepId.DependenciesCheck) {
      this.stepInfo.id = PluginStepId.DuplicateCheck;
      this.stepInfo.title = I18StepTitle.DuplicateCheck;
      this.duplicationCheck();
    } else if (stepId === PluginStepId.DuplicateCheck) {
      this.stepInfo.title = I18StepTitle.Installing;
      this.stepInfo.id = PluginStepId.Installing;
      this.uploadInstallFile();
    }
    this.changeDetectorRef.detectChanges();
  }

  //dependencies check
  private pluginDependenciesCheck(): void {
    this.pluginService
      .pluginDependenciesCheck()
      .pipe(takeUntil(this.noticer))
      .subscribe((res: DependenciesCheck) => {
        this.isBusy = false;
        if (!res) {
          this.displayErrorInfo(UnexpectionError.dependenciesCheck);
          return;
        }

        if (res.state === DependenciesCheckState.satisfied) {
          this.stepInfo.disabled = false;
        } else {
          this.stepInfo.disabled = true;
          let dependencies: DependenciesCheck[] = [];
          let names = res.name || [];
          let requires = res.require || [];
          let acts = res.act || [];
          for (let i = 0; i < names.length; i++) {
            dependencies.push({
              name: names[i],
              require: requires[i],
              act: acts[i],
            });
          }
          res.dependencies = dependencies;
        }
        this.dependenciesCheckInfo = res;
        this.changeDetectorRef.detectChanges();
      });
  }

  //duplate file detection
  private duplicationCheck(): void {
    this.pluginService
      .duplicationCheck()
      .pipe(takeUntil(this.noticer))
      .subscribe((res: DuplicationCheck) => {
        this.isBusy = false;
        if (!res) {
          this.displayErrorInfo(UnexpectionError.duplicationCheck);
          return;
        }

        if (res.state === DuplicationCheckState.HasDuplicateFile) {
          res.filesStr = res.files.join(',');
        }

        this.duplicationInfo = res;
        this.stepInfo.disabled = false;
        this.changeDetectorRef.detectChanges();
      });
  }

  //upload .zip file
  private uploadInstallFile(): void {
    this.apiService
      .uploadIPK(this.fileData)
      .then(uploadRes => {
        this.isBusy = false;
        if (!uploadRes || !uploadRes['success']) {
          this.displayErrorInfo(UnexpectionError.uploadFile);
          return;
        }
        this.pluginService.startInstallPlugin(this.fileData.name);
        this.dialogRef.close(false);
      })
      .catch(error => {
        this.isBusy = false;
        console.log(error);
      });
  }

  //display error info
  private displayErrorInfo(errorInfo: any) {
    this.stepInfo.disabled = true;
    this.errorTips = errorInfo;
    this.snackbarService.openTipSnackBar(errorInfo);
    this.changeDetectorRef.detectChanges();
  }
}
