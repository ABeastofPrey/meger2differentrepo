import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

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
    private trn: TranslateService
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
}
