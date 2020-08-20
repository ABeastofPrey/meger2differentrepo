import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  HostListener,
} from '@angular/core';
import {Graph, RecordTab, ChartType} from '../../modules/core/services/record.service';
import {ScreenManagerService} from '../../modules/core';
import { UtilsService } from '../../modules/core/services/utils.service';

declare var Plotly;

@Component({
  selector: 'app-record-graph',
  templateUrl: './record-graph.component.html',
  styleUrls: ['./record-graph.component.css'],
})
export class RecordGraphComponent implements OnInit {
  
  @ViewChild('graph', { static: false }) graph: ElementRef;
  
  @Input() chartData: RecordTab;

  private isViewLoaded = false;
  private _lastData: Array<Partial<Plotly.PlotData>> = null;
  private _lastType: ChartType = null;

  constructor(
    private mgr: ScreenManagerService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this.mgr.openedControls.subscribe(()=>{
        setTimeout(()=>{
          this.onResize();
        },0);
    });
  }

  ngAfterViewInit() {
    setTimeout(()=>{
      this.isViewLoaded = true;
      this.refreshChart();
    },200);
  }
  
  @HostListener('window:resize')
  onResize() {
    setTimeout(()=>{
      if (this.graph.nativeElement) {
        Plotly.relayout(this.graph.nativeElement, {});
      }
    }, 200);
  }
  @HostListener('resize')
  onHostResize() {
    this.onResize();
  }
  
  private refreshChart() {
    let cachedLayout = null;
    this._lastData = this.chartData.data;
    this._lastType = this.chartData.chartType;
    const additional = this.chartData.additionalData;
    const title = this.chartData.file + (additional ? ' ' + additional.file : '') + '.REC';
    const layout = {
      title,
      autosize: true,
      showlegend: true,
      plot_bgcolor: this.utils.isDarkMode ? '#111' : null,
      paper_bgcolor: this.utils.isDarkMode ? '#111' : null,
      font: {
        family: 'roboto',
        color: this.utils.isDarkMode ? '#fff' : '#000',
      }
    };
    if (this.chartData.chartType === ChartType.Time) {
      layout['xaxis'] = {
        title: 'Time [ms.]',
      };
      cachedLayout = localStorage.getItem('plotRanges_' + this.chartData.file) ?
        JSON.parse(localStorage.getItem('plotRanges_' + this.chartData.file)) : null;
    } else {
      layout['xaxis'] = {
        title: this.chartData.legends[this.chartData.legendX],
      };
      layout['yaxis'] = {
        title: this.chartData.legends[this.chartData.legendY]
      };
      if (this.chartData.chartType === ChartType.Three) {
        layout['zaxis'] = {
          title: this.chartData.legends[this.chartData.legendZ]
        };
      }
    }
    Plotly.newPlot(this.graph.nativeElement, this.chartData.data, layout, {responsive: true});
    const name = this.chartData.file;
    this.graph.nativeElement.on('plotly_relayout',e=>{
      if (this.chartData.chartType === ChartType.Time) {
        localStorage.setItem('plotRanges_' + name,JSON.stringify(e));
      }
    });
    if (cachedLayout) {
      Plotly.relayout(this.graph.nativeElement, cachedLayout);
    }
  }
  
  ngDoCheck() {
    if (this.isViewLoaded) {
      if (this._lastData === this.chartData.data && this._lastType === this.chartData.chartType) {
        return;
      }
      this.refreshChart();
    }
  }
}