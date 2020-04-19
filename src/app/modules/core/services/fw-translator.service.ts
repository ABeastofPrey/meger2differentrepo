import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SystemLog } from '../../sys-log/enums/sys-log.model';
import DATA from '../../../../assets/i18-fw/trn.json';

const MOTION = {
  cmn: ['在组中', '轴中']
};

@Injectable({
  providedIn: 'root'
})
export class FwTranslatorService {

  private _data: {} = {};

  constructor(private trn: TranslateService) {
    DATA.forEach(o=>{
      this._data[o.code] = {
        module: o.module,
        msg: o.msg,
        cmn: o.cmn
      };
    });
  }

  getTranslation(code: number, msg: string) {
    const trn = this._data[code];
    if (!trn || this.trn.currentLang === 'en' || !trn[this.trn.currentLang]) return msg;
    const data = trn[this.trn.currentLang];
    // HANDLE SPECIAL CASES
    let prefix = '';
    if (trn.module === 'Motion' || trn.module === 'Robot') {
      const regex1 = new RegExp('in group:? (\\w+)','i');
      const regex2 = new RegExp('at axis (\\w+)','i');
      let match = msg.match(regex1);
      if (match) {
        prefix += MOTION[this.trn.currentLang][0] + match[1];
      }
      match = msg.match(regex2);
      if (match) {
        prefix += MOTION[this.trn.currentLang][1] + match[1];
      }
    }
    return prefix + trn[this.trn.currentLang];
  }

    
}