import { ProgramEditorService, TASKSTATE_NOTLOADED, TASKSTATE_RUNNING } from './modules/program-editor/services/program-editor.service';
import { ScreenManagerService } from './modules/core/services/screen-manager.service';
import { TourService } from 'ngx-tour-md-menu';
import { TranslateService } from '@ngx-translate/core';
import { Component, HostListener } from '@angular/core';
import { fadeAnimation } from './fade.animation';
import { LoginService } from './modules/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LangService } from './modules/core/services/lang.service';
import { environment } from '../environments/environment';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonService } from './modules/core/services/common.service';
import { TourState } from 'ngx-tour-core';

declare var gtag;

@Component({
  selector: 'control-studio',
  templateUrl: './control-studio.component.html',
  styleUrls: ['./control-studio.component.css'],
  animations: [fadeAnimation],
})
export class ControlStudioComponent {
  
  env = environment;
  landscape: boolean;

  getRouterOutletState(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRouteData : '';
  }

  constructor(
    public cmn: CommonService,
    private login: LoginService,
    private lang: LangService,
    private overlayContainer: OverlayContainer,
    private router: Router,
    private trn: TranslateService,
    public tour: TourService,
    private mgr: ScreenManagerService,
    private prg: ProgramEditorService
  ) {
    this.overlayContainer
      .getContainerElement()
      .classList.add(this.env.platform.name);
    if (this.cmn.isTablet) {
      overlayContainer.getContainerElement().classList.add('tablet-ui');
    }
    this.lang.init();
  }

  get currStepIndex() {
    for (let i=0; i<this.tour.steps.length; i++) {
      if (this.tour.steps[i] === this.tour.currentStep) {
        return i+1;
      }
    }
    return 0;
  }

  @HostListener('click')
  onclick() {
    const isTourActive = this.tour.getStatus() === TourState.ON;
    if (!isTourActive) return;
    const step = this.tour.currentStep;
    setTimeout(()=>{
      if (this.tour.currentStep !== step) return;
      const disableNext = step['disableNext'];
      if (!disableNext) return;
      if (!disableNext() && this.tour.hasNext(step)) {
        this.tour.next();
      }
    },400);
  }

  initTour() {
    this.trn.get('tour').toPromise().then((tour: TourStep[]) => {
      const steps = [
        {
          anchorId: 'main-content',
          title: tour[0].title,
          content: tour[0].content,
          enableBackdrop: false
        },
        {
          anchorId: 'screen-editor',
          title: tour[1].title,
          content: tour[1].content,
          enableBackdrop: true,
          disableNext: ()=>{
            return this.mgr.screen.name !== 'editor';
          }
        },
        {
          anchorId: 'menuToggle',
          title: tour[2].title,
          content: tour[2].content,
          enableBackdrop: true,
          disableNext: ()=>{
            return this.mgr.menuExpanded;
          }
        },
        {
          anchorId: 'main-content',
          title: tour[3].title,
          content: tour[3].content,
          enableBackdrop: false,
          route: '/projects',
        },
        {
          anchorId: 'project-tree',
          title: tour[4].title,
          content: tour[4].content,
          enableBackdrop: true,
          route: '/projects',
        },
        {
          anchorId: 'Apps',
          title: tour[5].title,
          content: tour[5].content,
          enableBackdrop: true,
          route: '/projects',
        },
        {
          anchorId: 'Apps-App-CIRCLE',
          title: tour[6].title,
          content: tour[6].content,
          enableBackdrop: true,
          route: '/projects',
        },
        {
          anchorId: 'program-editor-ace',
          title: tour[7].title,
          content: tour[7].content,
          enableBackdrop: true,
          route: '/projects',
        },
        {
          anchorId: 'saveAndLoad',
          title: tour[8].title,
          content: tour[8].content,
          enableBackdrop: true,
          route: '/projects',
          disableNext: ()=>{
            return this.prg.status && this.prg.status.statusCode === TASKSTATE_NOTLOADED;
          }
        },
        {
          anchorId: 'programStatus',
          title: tour[9].title,
          content: tour[9].content,
          enableBackdrop: true,
          route: '/projects',
        },
        {
          anchorId: 'programRun',
          title: tour[10].title,
          content: tour[10].content,
          enableBackdrop: true,
          route: '/projects',
          disableNext: ()=>{
            return this.prg.status && this.prg.status.statusCode !== TASKSTATE_RUNNING;
          }
        },
        {
          anchorId: 'program-editor-ace',
          title: tour[11].title,
          content: tour[11].content,
          enableBackdrop: false,
          route: '/projects',
        },
        {
          anchorId: 'program-editor-ace',
          title: tour[12].title,
          content: tour[12].content,
          enableBackdrop: true,
          route: '/projects',
        },
        {
          anchorId: 'simWindow',
          title: tour[13].title,
          content: tour[13].content,
          enableBackdrop: true
        },
        {
          anchorId: 'btnToggleSimulator',
          title: tour[14].title,
          content: tour[14].content,
          enableBackdrop: true
        },
        {
          anchorId: 'main-content',
          title: tour[15].title,
          content: tour[15].content,
          enableBackdrop: false,
          endBtnTitle: 'END DEMO'
        }
      ];
      this.tour.initialize(steps);
    });
  }
  
  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event) {
    this.getOrientation();
  }
  
  private getOrientation() {
    const s = screen as {
      msOrientation?: string,
      mozOrientation?: string,
      orientation?: {
        type?: string
      }
    };
    const orientation: string = s.msOrientation || s.mozOrientation || (s.orientation || {}).type;
    console.log(orientation);
    this.landscape = !this.cmn.isTablet || orientation.startsWith('landscape');
  }
  
  
  ngOnInit() {
    this.initTour();
    this.getOrientation();
    this.login.populate();
    // capture router events and forward them to Google Analytics
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'UA-157702087-1', {
          'page_title': '/rs' + event.urlAfterRedirects,
          'page_path': '/rs' + event.urlAfterRedirects
        });
      }
    });
  }
  
  ngOnDestroy() {
    this.landscape = true;
  }
}

interface TourStep {
  title: string;
  content: string;
}