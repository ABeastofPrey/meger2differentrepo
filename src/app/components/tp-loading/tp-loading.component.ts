
import { Component, OnInit, NgZone } from '@angular/core';
import {
  DataService,
  ProjectManagerService,
  TpStatService,
  LoginService,
  WebsocketService,
} from '../../modules/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import {TranslateService} from '@ngx-translate/core';
import {CommonService} from '../../modules/core/services/common.service';
import {UtilsService} from '../../modules/core/services/utils.service';
import { SysLogSnackBarService } from '../../modules/sys-log/services/sys-log-snack-bar.service';

const TIMEOUT = 30000; // 30 SECONDS

@Component({
  selector: 'app-tp-loading',
  templateUrl: './tp-loading.component.html',
  styleUrls: ['./tp-loading.component.css'],
})
export class TpLoadingComponent implements OnInit {
  
  env = environment;

  steps: LoadingStep[] = [
    {
      name: 'Data',
      done: false,
    },
    {
      name: 'Project',
      done: false,
    },
    {
      name: 'TP Status',
      done: false,
    },
  ];

  progressValue = 0;

  private notifier: Subject<boolean> = new Subject();
  private words: {};
  private timeout: number;

  constructor(
    private ref: MatDialogRef<boolean>,
    private data: DataService,
    private prj: ProjectManagerService,
    private stat: TpStatService,
    private trn: TranslateService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    public cmn: CommonService,
    private login: LoginService,
    private _zone: NgZone,
    public utils: UtilsService,
    private ws: WebsocketService,
  ) {}

  ngOnInit() {
    this.trn.get(['dismiss', 'error.tp', 'error.tp_tablet']).subscribe(words=>{
      this.words = words;
    });
    this.data.dataLoaded.pipe(takeUntil(this.notifier)).subscribe(stat => {
      this.steps[0].done = stat;
      this.checkStatus();
    });
    this.prj.currProject.pipe(takeUntil(this.notifier)).subscribe(prj => {
      this.steps[1].done = prj !== null;
      this.checkStatus();
    });
    this.stat.modeChanged.pipe(takeUntil(this.notifier)).subscribe(mode => {
      if (mode !== null) {
        this.steps[2].done = true;
        this.checkStatus();
      }
    });
    this.ws.isConnected.subscribe(stat=>{
      if (!stat) {
        window.clearTimeout(this.timeout);
      }
    });
    window.clearTimeout(this.timeout);
    this.timeout = window.setTimeout(()=>{
      this._zone.run(()=>{
        const notDone = this.steps.some(s=>!s.done);
        if (notDone) {
          console.log(this.steps);
          console.log(this.stat);
          console.log(this.data.dataLoaded.value);
          console.log(this.prj.currProject.value);
          this.ref.close();
          const word = this.cmn.isTablet ? 'error.tp_tablet' : 'error.tp';
          this.snackbarService.openTipSnackBar(word);       
          if (this.cmn.isTablet) {
            this.login.logout();
          }
        }
      });
    },TIMEOUT);
  }

  get firstUnloadedStep(): string {
    const step = this.steps.find(step => {
      return !step.done;
    });
    if (step) return step.name;
    return '';
  }

  checkStatus() {
    if (this.stat.mode) this.steps[2].done = true;
    if (this.data.dataLoaded.value) this.steps[0].done = true;
    if (this.prj.currProject.value) this.steps[1].done = true;
    if (
      this.steps.every(step => {
        return step.done;
      })
    ) {
      this.ref.close(true);
    }
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }
}

interface LoadingStep {
  name: string;
  done: boolean;
}
