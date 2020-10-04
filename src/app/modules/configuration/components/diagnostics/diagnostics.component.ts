import { ScreenManagerService } from './../../../core/services/screen-manager.service';
import { TranslateService } from '@ngx-translate/core';
import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
} from '@angular/core';
import { WebsocketService, MCQueryResponse } from '../../../core';
import { GraphComponent, GraphData } from '../graph/graph.component';
import { Subscription, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { TopologyComponent } from '../topology/topology.component';

declare var Plotly;
const MAXVAL = 3000;

@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.css'],
})
export class DiagnosticsComponent implements OnInit {

  content: string;
  state = '1';
  isRefreshing = false;
  interval: number;
  env = environment;
  @ViewChild('container', { read: ViewContainerRef, static: false })
  ref: ViewContainerRef;

  private words: {};
  private notifier: Subject<boolean> = new Subject();

  // MCU
  private mcuThreshold = 0;
  private mcuInterval: number | undefined;
  mcuConnected = false;

  @ViewChild('topology', {static: false}) topology: TopologyComponent;

  constructor(
    private ws: WebsocketService,
    private resolver: ComponentFactoryResolver,
    private trn: TranslateService,
    private mgr: ScreenManagerService
  ) {}

  ngOnInit() {
    this.trn.get(['connected', 'disconnected']).subscribe(words=>{
      this.words = words;
    })
    this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(stat => {
      if (stat) this.refresh();
    });
    this.mgr.openedControls.pipe(takeUntil(this.notifier)).subscribe(()=>{
      try {
        Plotly.plots.resize('mcu');
      } catch (err) {
        
      }
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
    clearInterval(this.mcuInterval);
  }

  private getGraphsFromText() {
    this.ref.clear();
    let text = this.content;
    const graphs: GraphData[] = [];
    let index: number = text.indexOf('<GRAPH');
    try {
      while (index > -1) {
        const index2 = text.indexOf('</GRAPH>');
        let graphText = text.substring(index + 7, index2); //X='' Y='' TITLE='' type=''>DATA

        // PARSE TITLE
        let index3 = graphText.indexOf('Title="');
        let tmp = graphText.substring(index3 + 7);
        let index4 = tmp.indexOf('"');
        const title = tmp.substring(0, index4);

        // PARSE TYPE
        index3 = graphText.indexOf('type=');
        tmp = graphText.substring(index3 + 5);
        index4 = Math.min(tmp.indexOf(' '), tmp.indexOf('>'));
        const graphType = tmp.substring(0, index4);

        // PARSE X
        index3 = graphText.indexOf('X="');
        tmp = graphText.substring(index3 + 3);
        index4 = tmp.indexOf('"');
        const xLegend = tmp.substring(0, index4);

        // PARSE Y
        index3 = graphText.indexOf('Y="');
        tmp = graphText.substring(index3 + 3);
        index4 = tmp.indexOf('"');
        const yLegend = tmp.substring(0, index4);

        index3 = graphText.indexOf('>');
        graphText = graphText.substring(index3 + 1); // DATA
        const json = JSON.parse('{' + graphText + '}');
        json['XLegend'] = xLegend;
        json['YLegend'] = yLegend;
        json['title'] = title;
        json['graphType'] = graphType;
        graphs.push(json);
        text = text.substring(0, index) + text.substring(index2 + 8);
        index = text.indexOf('<GRAPH');
      }
      if (this.env.useDarkTheme) {
        text = text.replace(/<table/g,'<table bgcolor="#424242" ');
        text = text.replace(/#eee/g,'#333');
      }
      this.content = text;
      const factory = this.resolver.resolveComponentFactory(GraphComponent);
      let ref: ComponentRef<GraphComponent>;
      for (const graph of graphs) {
        ref = this.ref.createComponent(factory);
        ref.instance.setData(graph);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  initMCU() {
    this.ws.query('?MCU_GET_CONNECTION_STATUS').then((ret: MCQueryResponse)=>{
      this.mcuConnected = ret.result === '1';
    }).then(()=>{
      if (!this.mcuConnected) {
        this.mcuThreshold = 0;
        this.generateMcuChart(0);
        this.isRefreshing = false;
        return;
      }
      this.ws.query('?MCU_GET_FAN_THRESHOLD').then((ret: MCQueryResponse) => {
        this.mcuThreshold = Number(ret.result);
        this.mcuInterval = window.setInterval(()=>{
        this.ws.query('?MCU_GET_FAN_SPEED')
          .then((ret: MCQueryResponse) => {
            if (ret.err) {
              this.generateMcuChart(0);
              this.isRefreshing = false;
              return clearInterval(this.mcuInterval);
            }
            const val = Number(ret.result);
            if (val === -1 && !isNaN(val)) {
              clearInterval(this.mcuInterval);
              this.generateMcuChart(0);
              this.isRefreshing = false;
              return;
            }
            this.generateMcuChart(val);
            this.isRefreshing = false;
          });
        },2000);
      });
    });
  }

  private generateMcuChart(val: number) {
    const el = document.getElementById('mcu');
    if (el === null) return;
    const color = val <= this.mcuThreshold ? '#ff0000' : '#00ff00';
    const mcuStatus = 
        this.mcuConnected ? this.words['connected'] : this.words['disconnected'];
    const trace1 = {
      x: ['Fan'],
      y: [val],
      name: 'Fan Level',
      type: 'bar',
      marker: { color: [color] },
    };
    const trace2 = {
      x: ['Fan'],
      y: [MAXVAL - val],
      hoverinfo: 'skip',
      type: 'bar',
      marker: { color: ['#cccccc'] },
    };
    const data = [trace1, trace2];
    const layout = {
      barmode: 'stack',
      showlegend: false,
      title: 'Fan (' + mcuStatus + ')',
      yaxis: {fixedrange: true},
      xaxis : {fixedrange: true},
      annotations: [
        {
          x: 0,
          y: this.mcuThreshold,
          xref: 'x',
          yref: 'y',
          text: 'Threshold',
          showarrow: true,
          arrowhead: 7,
          ax: 70,
          ay: 0,
        },
      ],
    };
    Plotly.newPlot('mcu', data as Array<Partial<Plotly.PlotData>>, layout as Partial<Plotly.Annotations>, {
      responsive: true,
      displayModeBar: false,
      displaylogo: false
    });
  }

  clearAllDriveFaults(): void {
    this.ws.query('?TP_CLRFAULT').then(() => {
      this.ws.query('call TP_CONFIRM_ERROR');
    });
  }

  refresh() {
    if (this.interval) clearInterval(this.interval);
    if (this.mcuInterval) clearInterval(this.mcuInterval);
    if (this.ref) this.ref.clear();
    if (this.state === '4') {
      if (this.topology) {
        this.topology.refresh();
      }
      return;
    }
    this.isRefreshing = true;
    this.content = null;
    if (this.state === '3') {
      this.initMCU();
      return;
    }
    const cmd =
      this.state === '1'
        ? '?TP_GET_MOTION_DEVICES_STATE'
        : '?TP_GET_MOTION_MASTER_STATE';
    this.ws
      .query(cmd + '(1)')
      .then(() => {
        return this.ws.query(cmd + '(2)');
      })
      .then((ret: MCQueryResponse) => {
        if (ret.err) {
          this.content = 'diagnostics.no-data';
          this.isRefreshing = false;
          return;
        }
        if (ret.result !== 'Not Ready') {
          this.content = ret.result;
          this.getGraphsFromText();
          this.isRefreshing = false;
          return;
        }
        this.interval = window.setInterval(() => {
          this.ws.query(cmd + '(2)').then((ret: MCQueryResponse) => {
            if (ret.result !== 'Not Ready') {
              clearInterval(this.interval);
              this.content = ret.result;
              this.getGraphsFromText();
              this.isRefreshing = false;
              return;
            }
          });
        }, 1000);
      });
  }
}
