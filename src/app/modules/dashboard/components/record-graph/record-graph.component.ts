import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

declare var Plotly;

@Component({
  selector: 'app-record-graph',
  templateUrl: './record-graph.component.html',
  styleUrls: ['./record-graph.component.css']
})
export class RecordGraphComponent implements OnInit {
  
  @ViewChild('graph') graph : ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
  }
  
  ngAfterViewInit() {
    let layout = {
      title:'Recorded Data'
    };
    Plotly.newPlot(this.graph.nativeElement,this.data,layout);
  }
}