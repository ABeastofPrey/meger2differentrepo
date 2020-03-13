/*
 * THIS SERVICE HANDLES LANGUAGE CHANGE IN THE APP
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LangService {
  constructor(private translate: TranslateService) {}

  init() {
    if (this.translate.getDefaultLang()) return;
    this.translate.setDefaultLang('en');
    const lang = localStorage.getItem('lang');
    if (lang) this.translate.use(lang);
    else {
      localStorage.setItem('lang', 'en');
      this.translate.use('en');
    }
  }

  setLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }

  public getLang(): string {
    return localStorage.getItem('lang');
  }
}
