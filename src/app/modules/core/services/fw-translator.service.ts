import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SystemLog } from '../../sys-log/enums/sys-log.model';
import DATA from '../../../../assets/i18-fw/trn.json';

const MOTION = {
  en: ['in group ', 'in axis '],
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
    if (!trn || !this.trn.currentLang) return msg;
    const data = (trn[this.trn.currentLang] || trn['msg']) as string;
    // HANDLE SPECIAL CASES
    if (code >= 19000 && code <= 19999) {
      const match = msg.match(new RegExp('(?:Axis |轴)(\w) '));
      if (!match) return data;
      return data.replace('0',match[1]);
    }
    if (code >= 7000 && code <= 8000) {
      const match = msg.match(new RegExp('(?:Token :|牌：)(.*)$'));
      if (!match) return data;
      return data + match[1];
    }
    if (trn.module === 'Motion' || trn.module === 'Robot') {
      let prefix = '';
      const groupRegex = Object.keys(MOTION).map(key=>MOTION[key][0]).join('|');
      const axisRegex = Object.keys(MOTION).map(key=>MOTION[key][1]).join('|');
      const regex1 = new RegExp(`(?:${groupRegex})` + ':? ?(\\w+)','i');
      const regex2 = new RegExp(`(?:${axisRegex})` + '(\\w+)','i');
      let match = msg.match(regex1);
      if (match) {
        prefix += MOTION[this.trn.currentLang][0] + match[1];
      }
      match = msg.match(regex2);
      if (match) {
        prefix += MOTION[this.trn.currentLang][1] + match[1];
      }
      if (this.trn.currentLang !== 'cmn') prefix += ' ';
      return prefix + data;
    }
    return data;
  }

    
}