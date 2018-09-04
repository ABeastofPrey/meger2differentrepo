import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tp',
  templateUrl: './tp.component.html',
  styleUrls: ['./tp.component.css']
})
export class TpComponent implements OnInit {
  
  tabs = [
    {path: 'jog', label: 'Jog'},
    {path: 'lbn', label: 'Lead By Nose'}
  ];

  constructor() { }

  ngOnInit() {
  }

}
