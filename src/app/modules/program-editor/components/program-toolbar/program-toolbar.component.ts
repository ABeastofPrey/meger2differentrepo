import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'program-toolbar',
  templateUrl: './program-toolbar.component.html',
  styleUrls: ['./program-toolbar.component.css']
})
export class ProgramToolbarComponent implements OnInit {
  
  onFocus: boolean = false;
  currMenu: number = -1;
  
  toggleFocus() {
    this.onFocus = !this.onFocus;
  }

  constructor() { }

  ngOnInit() {
  }

}
