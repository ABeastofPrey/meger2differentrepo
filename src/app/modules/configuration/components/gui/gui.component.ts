import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material';
import { LangService } from '../../../core/services/lang.service';
import { WebsocketService, LoginService, ApiService } from '../../../core';
import { environment } from '../../../../../environments/environment';
import { CommonService } from '../../../core/services/common.service';
import { UtilsService } from '../../../core/services/utils.service';

@Component({
  selector: 'app-gui',
  templateUrl: './gui.component.html',
  styleUrls: ['./gui.component.css'],
})
export class GuiComponent implements OnInit {
  env = environment;

  constructor(
    public trn: TranslateService,
    private lang: LangService,
    private ws: WebsocketService,
    public login: LoginService,
    private cmn: CommonService,
    private api: ApiService,
    public utils: UtilsService
  ) {}

  ngOnInit() {}

  changeLang(e: MatSelectChange) {
    this.ws.query('?tp_set_language("' + e.value + '")').then(() => {
      this.lang.setLang(e.value);
    });
  }

  changeTheme(e: MatSelectChange) {
    const newVal: string = e.value;
    // change document title
    document.title =
      e.value === 'kuka' ? environment.appName_Kuka : environment.appName;
    this.api.setTheme(newVal.toLowerCase()).then(() => {
      // check if it worked
      return this.cmn.refreshTheme();
    });
  }
}
