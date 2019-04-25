import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { UtilsService } from '../../modules/core/services/utils.service';

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
      const TABS = ['jog', 'lbn', 'handguiding'];
      let tabs: Tab[] = [];
      if (utils.IsScara) {
        TABS.splice(1, 1);
      } else {
        TABS.splice(2, 1);
      }
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

}

interface Tab {
  path: string;
  label: string;
}
