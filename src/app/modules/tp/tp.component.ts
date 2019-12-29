import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../modules/core/services/utils.service';
import { CommonService } from '../core/services/common.service';
import { ProjectManagerService, TpStatService } from '../core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

const lbnTab = 'lbn',
  hGTab = 'handguiding';
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
    private stat: TpStatService
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

  ngOnInit() {
    if (!this.cmn.isTablet && this.prj.activeProject) {
      this.router.navigateByUrl('/');
    } else if (
      !this.cmn.isTablet &&
      this.stat.onlineStatus.value &&
      this.stat.mode.charAt(0) !== 'T'
    ) {
      this.stat.mode = 'T1';
    }
    this.stat.modeChanged
      .pipe(takeUntil(this.unsubscribeEvent))
      .subscribe(mode => {
        if (mode !== 'T1' && mode !== 'T2') {
          this.router.navigateByUrl('/');
        }
      });
    this.timeout = window.setTimeout(()=>{
      if (this.stat.mode !== 'T1' && this.stat.mode !== 'T2') {
        this.router.navigateByUrl('/');
      }
    },1000);
  }

  ngOnDestroy() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    if (!this.cmn.isTablet) {
      this.stat.mode = 'A';
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
    const isHandGuiding = 
        (_tabPath: string) => (_tabPath === hGTab ? true : false);
    if (isLbn(tabPath)) {
      return this.utils.IsScara ? false : true;
    } else if (isHandGuiding(tabPath)) {
      return this.utils.IsScara ? true : false;
    } else {
      return true;
    }
  }
}

interface Tab {
  path: string;
  label: string;
}
