import { DataService } from './../core/services/data.service';
import { LoginService } from './../core/services/login.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../modules/core/services/utils.service';
import { CommonService } from '../core/services/common.service';
import { ProjectManagerService, TpStatService } from '../core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

const lbnTab = 'lbn', hGTab = 'handguiding';
const TABS = ['jog', lbnTab, hGTab];

@Component({
  selector: 'app-tp',
  templateUrl: './tp.component.html',
  styleUrls: ['./tp.component.css'],
})
export class TpComponent implements OnInit, OnDestroy {
  
  tabs: Tab[] = [];

  private timeout: number = null;
  private unsubscribeEvent = new Subject<void>();

  constructor(
    private trn: TranslateService,
    public utils: UtilsService,
    private cmn: CommonService,
    private prj: ProjectManagerService,
    private router: Router,
    private stat: TpStatService,
    private login: LoginService,
    private data: DataService
  ) {
    this.trn.get('jogScreen.tabs').subscribe(words => {
      const tabs: Tab[] = [];
      for (const t of TABS) {
        tabs.push({
          path: t,
          label: words[t],
        });
      }
      this.tabs = tabs;
    });
  }

  async ngOnInit() {
    if (!this.cmn.isTablet && this.prj.activeProject) {
      this.router.navigateByUrl('/');
    } else if (
      !this.cmn.isTablet &&
      !this.login.isViewer &&
      this.stat.onlineStatus.value &&
      this.stat.mode.charAt(0) !== 'T'
    ) {
      await this.stat.setMode('T1');
    }
    if (this.login.isViewer) return;
    if (this.stat.mode.charAt(0) !== 'T') {
      this.router.navigateByUrl('/');
    } else {
      this.stat.modeChanged
      .pipe(takeUntil(this.unsubscribeEvent))
      .subscribe(mode => {
        if (mode !== 'T1' && mode !== 'T2') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    if (!this.cmn.isTablet && !this.login.isViewer) {
      this.stat.setMode('A');
    }
    this.unsubscribeEvent.next();
    this.unsubscribeEvent.complete();
  }

  /**
   * For lbn tab, if the robot is Scara, then it shouldn't display.
   * For handguiding, it should display only the robot is Scara.
   *
   * @param {string} tabPath
   * @returns {boolean}
   * @memberof TpComponent
   */
  shouldShow(tabPath: string): boolean {
    const isLbn = (_tabPath: string) => (_tabPath === lbnTab ? true : false);
    const isHandGuiding = (_tabPath: string) => (_tabPath === hGTab ? true : false);
    if (isLbn(tabPath)) {
      return !this.utils.IsScara;
    } else if (isHandGuiding(tabPath)) {
      return this.utils.IsScara && this.data.safetyCardRunning ? true : false;
    } else {
      return true;
    }
  }
}

interface Tab {
  path: string;
  label: string;
}
