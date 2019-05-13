import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { UtilsService } from '../../modules/core/services/utils.service';

const lbnTab = 'lbn', hGTab = 'handguiding';
const TABS = ['jog', lbnTab, hGTab];

@Component({
  selector: 'app-tp',
  templateUrl: './tp.component.html',
  styleUrls: ['./tp.component.css']
})
export class TpComponent implements OnInit {
  
  tabs : Tab[];

  constructor(
    private trn: TranslateService,
    public utils: UtilsService
  ) {
    this.trn.get('jogScreen.tabs').subscribe(words => {
      let tabs: Tab[] = [];
      for (let t of TABS) {
        tabs.push({
          path: t,
          label: words[t]
        });
      }
      this.tabs = tabs;
    });
  }

  ngOnInit() {
  }

  /**
   * For lbn tab, if the robot is Scara, then it shouldn't display.
   * For handguiding, it should display only the robot is Scara.
   *
   * @param {string} tabPath
   * @returns {boolean}
   * @memberof TpComponent
   */
  public shouldShow(tabPath: string): boolean {
    const isLbn = _tabPath => (_tabPath === lbnTab) ? true : false;
    const isHandGuiding = _tabPath => ( _tabPath === hGTab) ? true : false;
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
