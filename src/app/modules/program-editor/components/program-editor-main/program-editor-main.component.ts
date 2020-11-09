import { ProjectManagerService } from './../../../core/services/project-manager.service';
import { WebsocketService } from './../../../core/services/websocket.service';
import { LoginService } from './../../../core/services/login.service';
import { ProgramEditorService, ProgramStatus, TASKSTATE_STOPPED, TASKSTATE_ERROR, TASKSTATE_INTERRUPTED, TASKSTATE_READY, TASKSTATE_NOTLOADED, TASKSTATE_RUNNING, TASKSTATE_KILLED } from './../../services/program-editor.service';
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UtilsService } from '../../../core';

@Component({
  selector: 'app-program-editor-main',
  templateUrl: './program-editor-main.component.html',
  styleUrls: ['./program-editor-main.component.scss']
})
export class ProgramEditorMainComponent implements OnInit {

  status: ProgramStatus = null;
  appDescEditMode = false;

  private notifier: Subject<boolean> = new Subject();

  constructor(
    public service: ProgramEditorService,
    public login: LoginService,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.service.statusChange.pipe(takeUntil(this.notifier)).subscribe(stat=>{
      setTimeout(()=>{this.status = stat;},0);
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  get isStepDisabled() {
    if (this.status === null) return true;
    const code = this.status.statusCode;
    return (
      code !== TASKSTATE_STOPPED &&
      code !== TASKSTATE_ERROR &&
      code !== TASKSTATE_INTERRUPTED &&
      code !== TASKSTATE_READY
    );
  }

  onAppDescSave() {
    this.appDescEditMode = !this.appDescEditMode;
    if (!this.appDescEditMode) {
      const app = this.service.fileRef.name;
      const prj = this.prj.currProject.value.name;
      const desc = this.service.fileRef.desc;
      const cmd = '?PRJ_SET_APP_DESCRIPTION("' + prj + '","' + app + '",`' + desc + '`)';
      this.ws.query(cmd).then(ret => {
        console.log(ret);
        if (ret.err || ret.result !== '0') {
          this.service.fileRef.desc = 'N/A';
        }
      });
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
