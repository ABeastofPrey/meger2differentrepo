import { Component, OnInit } from '@angular/core';
import { DataService, TeachService } from '../../../core';

@Component({
  selector: 'teach-variable-editor',
  templateUrl: './teach-variable-editor.component.html',
  styleUrls: ['./teach-variable-editor.component.css'],
})
export class TeachVariableEditorComponent implements OnInit {
  constructor(public data: DataService, public teach: TeachService) {}

  ngOnInit() {}
}
