import { Component, OnInit } from '@angular/core';
import {
  ProgramEditorService,
  TASKSTATE_NOTLOADED,
  TASKSTATE_RUNNING,
  TASKSTATE_STOPPED,
  TASKSTATE_ERROR,
  TASKSTATE_READY,
  TASKSTATE_KILLED,
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

@Component({
  selector: 'program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.scss'],
})
export class ProgramEditorComponent implements OnInit {
  pPoints = projectPoints;
  appDescEditMode: boolean = false;

  constructor(
    public service: ProgramEditorService,
    public data: DataService,
    public prj: ProjectManagerService,
    public login: LoginService,
    public cmn: CommonService,
    private ws: WebsocketService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.service.mode = 'editor';
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
      code !== TASKSTATE_READY
    );
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
