import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatSelectChange} from '@angular/material';
import {LangService} from '../../../core/services/lang.service';
import {WebsocketService, LoginService} from '../../../core';
import {environment} from '../../../../../environments/environment';
import {OverlayContainer} from '@angular/cdk/overlay';
import { UtilsService } from '../../../core/services/utils.service';

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
    private ws: WebsocketService,
    private overlayContainer: OverlayContainer,
    private utils: UtilsService,
    public login: LoginService
  ) { }

  ngOnInit() {
    
  }
  
  changeLang(e: MatSelectChange) {
    this.ws.query('?tp_set_language("' + e.value + '")').then(()=>{
      this.lang.setLang(e.value);
    });
  }
  
  /**
   * TEMPORARY FUNCTION, WILL NOT BE IN THE FINAL PRODUCT
   * Remove unselected themes witch defined in environment from global style,
   * and add current selected theme to global.
   *
   * @param {MatSelectChange} {value: selectedTheme}
   * @memberof GuiComponent
   */
  changeTheme({value: selectedTheme}: MatSelectChange) {
    const gui = this;
    const { classList } = this.overlayContainer.getContainerElement();
    this.utils.PlatformList.forEach(platform => {
      if (platform.name === selectedTheme) {
        gui.env.platform = platform;
        classList.add(platform.name);
      } else {
        classList.remove(platform.name);
      }
    });
  }
}
