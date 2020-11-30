import { MCProject } from './../models/project/mc-project.model';
import { MatDialog } from '@angular/material/dialog';
import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import * as screenfull from 'screenfull';
import { Screenfull } from 'screenfull';
import { environment } from '../../../../environments/environment';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';
import { TourWelcomeComponent } from '../../tour/tour-welcome/tour-welcome.component';

@Injectable()
export class CommonService {
  themeLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _theme: string = null;
  get theme() {
    return this._theme;
  }

  private env = environment;

  private _fontWidth = 13.2; // FOR MONOSPACE
  get fontWidth() {
    return this._fontWidth;
  }

  constructor(
    private platform: Platform,
    private api: ApiService,
    private overlayContainer: OverlayContainer,
    private dialog: MatDialog
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
    const e: HTMLElement = document.createElement('div');
    e.style.fontFamily = 'monospace';
    e.style.fontSize = '24px';
    e.style.padding = '0';
    e.style.border = '0';
    e.style.outline = '0';
    e.style.position = 'absolute';
    e.style.top = '0';
    e.innerText = 'a';
    document.body.appendChild(e);
    this._fontWidth = e.getBoundingClientRect().width;
    // console.log(this._fontWidth);
    e.remove();
  }

  get isCloud() {
    return location.port !== '1207' && location.port !== '4200';
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
          this.env.useDarkTheme = false;
      }
      const { classList } = this.overlayContainer.getContainerElement();
      for (const platform of Object.keys(this.env.platforms)) {
        const name: string = this.env.platforms[platform].name;
        if (name.toLowerCase() === theme) {
          classList.add(name);
        } else {
          classList.remove(name);
        }
      }
      this._theme = theme;
      this.themeLoaded.next(true);
      // change document title
      document.title =
        theme === environment.platforms.Kuka.name
          ? environment.appName_Kuka
          : environment.appName;
    });
  }

  get isTablet(): boolean {
    const result = this.platform.ANDROID || this.platform.IOS;
    return result;
  }

  goFullScreen() {
    const s = screenfull as Screenfull;
    if (s.enabled) {
      s.request();
    }
  }

  toggleFullScreen() {
    const s = screenfull as Screenfull;
    if (s.enabled) {
      s.toggle();
    }
  }

  showTourDialog(force: boolean, prj: MCProject) {
    if (this.isTablet) return;
    const tourQuestion = localStorage.getItem('tourQuestion');
    if (force || tourQuestion === null || !tourQuestion || this.isCloud) {
      localStorage.setItem('tourQuestion', 'true');
      this.dialog.open(TourWelcomeComponent,{
        maxWidth: '500px',
        data: prj
      });
    }
  }
}
