import { Component } from '@angular/core';
import { fadeAnimation } from './fade.animation';
import { LoginService } from './modules/core';
import { TourService } from 'ngx-tour-md-menu';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './modules/core/services/lang.service';
import { environment } from '../environments/environment';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonService } from './modules/core/services/common.service';

@Component({
  selector: 'control-studio',
  templateUrl: './control-studio.component.html',
  styleUrls: ['./control-studio.component.css'],
  animations: [fadeAnimation],
})
export class ControlStudioComponent {
  env = environment;

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRouteData : '';
  }

  constructor(
    public cmn: CommonService,
    private login: LoginService,
    private tour: TourService,
    private translate: TranslateService,
    private lang: LangService,
    private overlayContainer: OverlayContainer
  ) {
    overlayContainer
      .getContainerElement()
      .classList.add(this.env.platform.name);
    if (this.cmn.isTablet)
      overlayContainer.getContainerElement().classList.add('tablet-ui');
    this.lang.init();
    this.translate
      .get('tour')
      .toPromise()
      .then((tour: TourStep[]) => {
        let steps = [
          {
            anchorId: 'menu',
            title: tour[0].title,
            content: tour[0].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'jog-controls',
            title: tour[1].title,
            content: tour[1].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'watch',
            title: tour[2].title,
            content: tour[2].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'message-log-button',
            title: tour[3].title,
            content: tour[3].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'message-log',
            title: tour[4].title,
            content: tour[4].content,
            enableBackdrop: true,
            route: '/',
          },
          {
            anchorId: 'terminal',
            title: tour[5].title,
            content: tour[5].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'sys-info',
            title: tour[6].title,
            content: tour[6].content,
          },
        ];
        if (window.innerWidth >= 1024) {
          // ADD STEPS THAT WILL BE ONLY SHOWN IN NORMAL SCREEN RESOLUTIONS
          steps = steps.concat([
            {
              anchorId: 'screen-Motion Dashboard',
              title: tour[7].title,
              content: tour[7].content,
              enableBackdrop: true,
            },
          ]);
        }
        steps = steps.concat([
          {
            anchorId: 'dashboard-fab',
            title: tour[8].title,
            content: tour[8].content,
            enableBackdrop: true,
            route: '/dashboard',
          },
          {
            anchorId: 'dashboard-window',
            title: tour[9].title,
            content: tour[9].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'dashboard-enable',
            title: tour[10].title,
            content: tour[10].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'dashboard-expand',
            title: tour[11].title,
            content: tour[11].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'dashboard-move',
            title: tour[12].title,
            content: tour[12].content,
            enableBackdrop: true,
          },
          {
            anchorId: 'dashboard-rec',
            title: tour[13].title,
            content: tour[13].content,
            enableBackdrop: true,
          },
        ]);
        if (window.innerWidth >= 1024) {
          // ADD STEPS THAT WILL BE ONLY SHOWN IN NORMAL SCREEN RESOLUTIONS
          steps = steps.concat([
            {
              anchorId: 'screen-Project Editor',
              title: tour[14].title,
              content: tour[14].content,
              enableBackdrop: true,
              route: '/projects',
            },
          ]);
        }
        steps = steps.concat([
          {
            anchorId: 'project-tree',
            title: tour[15].title,
            content: tour[15].content,
            enableBackdrop: true,
            route: '/projects',
          },
          {
            anchorId: 'project-toolbar-1',
            title: tour[16].title,
            content: tour[16].content,
            enableBackdrop: true,
          },
        ]);
        this.tour.initialize(steps);
      });
  }

  ngOnInit() {
    this.login.populate();
  }
}

interface TourStep {
  title: string;
  content: string;
}
