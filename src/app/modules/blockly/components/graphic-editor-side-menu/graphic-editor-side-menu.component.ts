import { Component, OnInit } from '@angular/core';
import {BlocklyService} from '../../services/blockly.service';

@Component({
  selector: 'graphic-editor-side-menu',
  templateUrl: './graphic-editor-side-menu.component.html',
  styleUrls: ['./graphic-editor-side-menu.component.css']
})
export class GraphicEditorSideMenuComponent implements OnInit {

  constructor(public service : BlocklyService) { }

  ngOnInit() {
  }

}
