import { Component, OnInit } from '@angular/core';
import {ProgramEditorService, TASKSTATE_NOTLOADED, TASKSTATE_RUNNING, TASKSTATE_STOPPED, TASKSTATE_ERROR, TASKSTATE_READY, TASKSTATE_KILLED} from '../../services/program-editor.service';
import {DataService, ProjectManagerService} from '../../../core';

@Component({
  selector: 'program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.css']
})
export class ProgramEditorComponent implements OnInit {

  constructor(
    public service : ProgramEditorService,
    public data: DataService,
    public prj: ProjectManagerService
  ) { }

  ngOnInit() {
    this.prj.currProject.subscribe(prj=>{
      if (prj)
        this.prj.getProjectStatus();
    });
  }
  
  ngOnDestroy() {
    this.prj.stopStatusRefresh();
  }
  
  onDragEnd() { this.service.onDragEnd(); }
  
  get isStepDisabled() {
    const code = this.service.status.statusCode;
    return code === this.taskStates[0] || code === this.taskStates[1] ||
          code === this.taskStates[5];
  }
  
  taskStates = [
    TASKSTATE_NOTLOADED,
    TASKSTATE_RUNNING,
    TASKSTATE_STOPPED,
    TASKSTATE_ERROR,
    TASKSTATE_READY,
    TASKSTATE_KILLED
  ];

}
