import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

const TABS = ['jog','lbn'];

@Component({
  selector: 'app-tp',
  templateUrl: './tp.component.html',
  styleUrls: ['./tp.component.css']
})
export class TpComponent implements OnInit {
  
  tabs : Tab[];

  constructor(private trn: TranslateService) {
    this.trn.get('jogScreen.tabs').subscribe(words=>{
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

}

interface Tab {
  path: string;
  label: string;
}
