import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { GraphDerivativeComponent } from '../graph-derivative/graph-derivative.component';

declare var Plotly;

@Component({
  selector: 'app-record-graph',
  templateUrl: './record-graph.component.html',
  styleUrls: ['./record-graph.component.css'],
})
export class RecordGraphComponent implements OnInit {
  @ViewChild('graph', { static: false }) graph: ElementRef;

  private word_title: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private trn: TranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.trn.get('dashboard.record.recorded').subscribe(word => {
      this.word_title = word;
    });
  }

  ngAfterViewInit() {
    let layout = {
      title: this.word_title,
    };
    Plotly.newPlot(this.graph.nativeElement, this.data, layout);
  }

  derivative() {
    this.dialog
      .open(GraphDerivativeComponent, {
        data: this.data,
      })
      .afterClosed()
      .subscribe(ret => {
        const deg = ret[0];
        const dataIndex = ret[1];
        if (isNaN(deg) || isNaN(dataIndex)) return;
        this.addDer(deg, dataIndex);
      });
  }

  private addDer(deg: number, dataIndex: number) {
    let newData = [];
    const graphData = this.data[dataIndex];
    let newY: number[] = [];
    if (graphData.y) {
      for (let i = 0; i < deg; i++) {
        const y: number[] = i === 0 ? graphData.y : newY;
        let tmpY: number[] = [];
        for (let j = 0; j < y.length; j++) {
          if (j === 0 || j === y.length - 1) tmpY[j] = 0;
          else {
            const y0 = y[j - 1];
            const y1 = y[j + 1];
            tmpY[j] = (y1 - y0) / 2; // 2 ms between points
          }
        }
        newY = tmpY;
      }
    }
    newData.push({
      mode: 'lines',
      name: graphData.name + '-DER-' + deg,
      x: graphData.x,
      y: newY,
    });
    let layout = { title: this.word_title };
    Plotly.plot(this.graph.nativeElement, newData, layout);
  }
}
