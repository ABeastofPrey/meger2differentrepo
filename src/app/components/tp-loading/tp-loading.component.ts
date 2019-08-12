
import { Component, OnInit } from '@angular/core';
import {
  DataService,
  ProjectManagerService,
  TpStatService,
} from '../../modules/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import {TranslateService} from '@ngx-translate/core';

const PROGRESS_TIME = 8; // 8 SECONDS
const TIMEOUT = 15000; // 15 SECONDS

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

  progressValue: number = 0;

  private notifier: Subject<boolean> = new Subject();
  private words: any;

  constructor(
    private ref: MatDialogRef<void>,
    private data: DataService,
    private prj: ProjectManagerService,
    private stat: TpStatService,
    private trn: TranslateService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.trn.get(['dismiss', 'error.tp']).subscribe(words=>{
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
      this.steps[2].done = true;
      this.checkStatus();
    });
    const interval = setInterval(() => {
      this.progressValue += 98 / PROGRESS_TIME;
      if (this.progressValue >= 98) {
        clearInterval(interval);
      }
    }, 1000);
    setTimeout(()=>{
      const notDone = this.steps.some(s=>{return !s.done;});
      if (notDone) {
        this.ref.close();
        this.snack.open(this.words['error.tp'],this.words['dismiss']);
      }
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
      this.ref.close();
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
