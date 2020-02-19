import { ScreenManagerService } from './../../../core/services/screen-manager.service';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';

declare var Plotly;

const MAX_GRAPHS = 20;

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})
export class GraphComponent implements OnInit {
  @ViewChild('graph', { static: true }) graph: ElementRef;

  constructor(private mgr: ScreenManagerService) {}

  ngOnInit() {
    this.mgr.openedControls.subscribe(()=>{
      window.dispatchEvent(new Event("resize"));
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.graph) {
      Plotly.Plots.resize(this.graph.nativeElement);
    }
  }

  setData(graphData: GraphData) {
    try {
      if (graphData.Y.length === 0 || graphData.Y.length >= MAX_GRAPHS) {
        console.log('INVALID GRAPH FORAMT:');
        console.log(graphData);
        return;
      }
      const data = [];
      let layout = null;
      if (graphData.graphType === 'BAR') {
        for (const y of graphData.Y) {
          data.push({
            x: graphData.X,
            y: y.data,
            type: 'bar',
            name: y.name,
          });
        }
        layout = {
          xaxis: { title: graphData.XLegend },
          yaxis: { title: graphData.YLegend },
          title: graphData.title,
        };
      } else if (graphData.graphType === 'LINE') {
        for (const y of graphData.Y) {
          data.push({
            x: graphData.X,
            y,
            type: 'scatter',
          });
        }
        layout = {
          xaxis: { title: graphData.XLegend },
          yaxis: { title: graphData.YLegend },
          title: graphData.title,
        };
      }
      Plotly.newPlot(this.graph.nativeElement, data, layout, {
        responsive: true
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export interface GraphData {
  title: string;
  XLegend: string;
  YLegend: string;
  // tslint:disable-next-line: no-any
  X: any[];
  // tslint:disable-next-line: no-any
  Y: any[];
  graphType: string;
}
