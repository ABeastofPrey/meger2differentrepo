import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatSelectChange} from '@angular/material';
import {LangService} from '../../../core/services/lang.service';
import {WebsocketService} from '../../../core';
import {environment, ServotronixTheme, KukaTheme} from '../../../../../environments/environment';

@Component({
  selector: 'app-gui',
  templateUrl: './gui.component.html',
  styleUrls: ['./gui.component.css']
})
export class GuiComponent implements OnInit {
  
  env = environment;

  constructor(
    public trn: TranslateService,
    private lang: LangService,
    private ws: WebsocketService
  ) { }

  ngOnInit() {
    
  }
  
  changeLang(e: MatSelectChange) {
    this.ws.query('?tp_set_language("' + e.value + '")').then(()=>{
      this.lang.setLang(e.value);
    });
  }
  
  /*
   * TEMPORARY FUNCTION, WILL NOT BE IN THE FINAL PRODUCT
   */
  changeTheme(e: MatSelectChange) {
    switch (e.value) {
      case 'stx':
        this.env.theme = ServotronixTheme;
        break;
      case 'kuka-theme':
        this.env.theme = KukaTheme;
        break;
    }
  }

}
