import { Component, OnInit } from '@angular/core';
import {BlocklyService} from '../../services/blockly.service';
import {TASKSTATE_NOTLOADED, TASKSTATE_RUNNING, TASKSTATE_STOPPED, TASKSTATE_ERROR, TASKSTATE_READY, TASKSTATE_KILLED} from '../../../program-editor/services/program-editor.service';

@Component({
  selector: 'graphic-editor',
  templateUrl: './graphic-editor.component.html',
  styleUrls: ['./graphic-editor.component.css']
})
export class GraphicEditorComponent implements OnInit {

  constructor(public service : BlocklyService) { }

  ngOnInit() {
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
