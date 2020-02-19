import { UtilsService } from './../../../core/services/utils.service';
import { NotificationService } from './../../../core/services/notification.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ProgramEditorService,
  TASKSTATE_NOTLOADED,
  TASKSTATE_RUNNING,
  TASKSTATE_STOPPED,
  TASKSTATE_ERROR,
  TASKSTATE_READY,
  TASKSTATE_KILLED,
  TASKSTATE_INTERRUPTED
} from '../../services/program-editor.service';
import {
  DataService,
  ProjectManagerService,
  LoginService,
  WebsocketService,
  MCQueryResponse,
} from '../../../core';
import { CommonService } from '../../../core/services/common.service';
import { projectPoints } from '../program-editor-side-menu/program-editor-side-menu.component';
import {environment} from '../../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SplitAreaDirective } from 'angular-split';

@Component({
  selector: 'program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.scss'],
})
export class ProgramEditorComponent implements OnInit {

  // GUTTER VISIBLITY
  showGutterLeft = true;
  showGutterRight = true;
  
  pPoints = projectPoints;
  appDescEditMode = false;
  env = environment;
  selectedTab = 0;

  private notifier: Subject<boolean> = new Subject();

  constructor(
    public service: ProgramEditorService,
    public data: DataService,
    public prj: ProjectManagerService,
    public login: LoginService,
    public cmn: CommonService,
    private ws: WebsocketService,
    public notification: NotificationService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    // when errors happen jump to first tab
    this.service.errLinesChange.pipe(takeUntil(this.notifier)).subscribe(lines => {
      this.selectedTab = 0;
    });
  }

  ngOnDestroy() {
    this.service.mode = 'editor';
    if (this.notification.messagesShowing) {
      this.notification.toggleMessagesShowing(false);
    }
  }

  toggleGutter(i: number) {
    if (i === 1) {
      this.showGutterLeft = !this.showGutterLeft;
    } else if (i === 2) {
      this.showGutterRight = !this.showGutterRight;
    }
  }

  onDragEnd() {
    this.service.onDragEnd();
  }

  onAppDescSave() {
    this.appDescEditMode = !this.appDescEditMode;
    if (!this.appDescEditMode) {
      const app = this.service.fileRef.name;
      const prj = this.prj.currProject.value.name;
      const desc = this.service.fileRef.desc;
      const cmd =
        '?PRJ_SET_APP_DESCRIPTION("' + prj + '","' + app + '","' + desc + '")';
      this.ws.query(cmd).then((ret: MCQueryResponse) => {
        console.log(ret);
      });
    }
  }

  get isStepDisabled() {
    const code = this.service.status.statusCode;
    return (
      code !== TASKSTATE_STOPPED &&
      code !== TASKSTATE_ERROR &&
      code !== TASKSTATE_INTERRUPTED &&
      code !== TASKSTATE_READY
    );
  }

  onTabChange(i: number) {
    this.selectedTab = i;
    if (i === 1 && this.notification.windowOpen) {
      this.notification.toggleWindow();
    }
    if (
      (i === 1 && !this.notification.messagesShowing) ||
      (i !== 1 && this.notification.messagesShowing && !this.notification.windowOpen)
    ) {
        this.notification.toggleMessagesShowing(true);
      }
  }

  taskStates = [
    TASKSTATE_NOTLOADED,
    TASKSTATE_RUNNING,
    TASKSTATE_STOPPED,
    TASKSTATE_ERROR,
    TASKSTATE_READY,
    TASKSTATE_KILLED,
  ];
}
