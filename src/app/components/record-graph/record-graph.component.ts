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
    private mgr: ScreenManagerService
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
    console.log('resize');
    if (this.graph.nativeElement) {
      Plotly.relayout(this.graph.nativeElement, {});
    }
  }
  @HostListener('resize')
  onHostResize() {
    console.log('host resize');
    this.onResize();
  }
  
  private refreshChart() {
    this._lastData = this.chartData.data;
    this._lastType = this.chartData.chartType;
    const layout = {
      title: this.chartData.file + '.REC',
      autosize: true,
      showlegend: true
    };
    if (this.chartData.chartType === ChartType.Time) {
      layout['xaxis'] = {
        title: 'Time [ms.]',
      };
    } else {
      layout['xaxis'] = {
        title: this.chartData.legends[this.chartData.legendX]
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