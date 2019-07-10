import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import * as screenfull from 'screenfull';
import { Screenfull } from 'screenfull';
import { environment } from '../../../../environments/environment';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApiService } from './api.service';

@Injectable()
export class CommonService {
  
  private env = environment;
  
  private _fontWidth: number = 13.2; // FOR MONOSPACE
  get fontWidth() {
    return this._fontWidth;
  }
  

  constructor(
    private platform: Platform,
    private api: ApiService,
    private overlayContainer: OverlayContainer
  ) {
    const cachedTheme = localStorage.getItem('theme');
    switch (cachedTheme) {
      case 'stx':
        this.env.platform = this.env.platforms.Servotronix;
        break;
      default:
        this.env.platform = this.env.platforms.Kuka;
    }
    this.refreshTheme();
    // calculate font width
    let e: HTMLInputElement = document.createElement('input');
    e.size = 1;
    e.style.fontFamily = 'monospace';
    e.style.fontSize = '24px';
    e.style.padding = '0';
    e.style.border = '0';
    e.style.outline = '0';
    document.body.appendChild(e);
    this._fontWidth = e.getBoundingClientRect().width / 2;
    if (this.isTablet)
      this._fontWidth = this._fontWidth * 1.5; // because of screen scaling
    e.remove();
  }

  refreshTheme() {
    return this.api.getTheme().then(theme => {
      localStorage.setItem('theme', theme);
      switch (theme) {
        case 'stx':
          this.env.platform = this.env.platforms.Servotronix;
          break;
        default:
          this.env.platform = this.env.platforms.Kuka;
      }
      const { classList } = this.overlayContainer.getContainerElement();
      for (let platform in this.env.platforms) {
        const name: string = this.env.platforms[platform].name;
        if (name.toLowerCase() === theme) {
          classList.add(name);
        } else {
          classList.remove(name);
        }
      }
    });
  }

  get isTablet(): boolean {
    const result = this.platform.ANDROID || this.platform.IOS;
    return result;
  }

  goFullScreen() {
    const s = <Screenfull>screenfull;
    if (s.enabled) {
      s.request();
    }
  }
}
