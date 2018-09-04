import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare var Plotly;

const MAX_GRAPHS = 20;

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  
  @ViewChild('graph') graph : ElementRef;

  constructor() {
    
  }

  ngOnInit() {
    
  }
  
  setData(graphData: GraphData) {
    try {
      if (graphData.Y.length === 0 || graphData.Y.length >= MAX_GRAPHS) {
        console.log('INVALID GRAPH FORAMT:');
        console.log(graphData);
        return; 
      }
      let data = [];
      let layout = null;
      if (graphData.graphType === 'BAR') {
        for (let y of graphData.Y) {
          data.push({
            x: graphData.X,
            y: y.data,
            type: 'bar',
            name: y.name
          });
        }
        layout = {
          xaxis: {title: graphData.XLegend},
          yaxis: {title: graphData.YLegend},
          title: graphData.title
        };
      } else if (graphData.graphType === 'LINE') {
        for (let y of graphData.Y) {
          data.push({
            x: graphData.X,
            y: y,
            type: 'scatter'
          });
        }
        layout = {
          xaxis: {title: graphData.XLegend},
          yaxis: {title: graphData.YLegend},
          title: graphData.title
        };
      }
      Plotly.newPlot(this.graph.nativeElement,data,layout);
    } catch (err) {
      console.log(err);
    }
  }
}

export interface GraphData {
  title: string,
  XLegend: string,
  YLegend: string,
  X: any[],
  Y: any[],
  graphType: string
}
