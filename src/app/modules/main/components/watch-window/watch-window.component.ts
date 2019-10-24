import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WatchService } from '../../../../modules/core/services/watch.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SingleInputDialogComponent } from '../../../../components/single-input-dialog/single-input-dialog.component';
import { WebsocketService, MCQueryResponse, ApiService } from '../../../core';
import { RecordGraphComponent } from '../../../../components/record-graph/record-graph.component';

@Component({
  selector: 'watch-window',
  templateUrl: './watch-window.component.html',
  styleUrls: ['./watch-window.component.css'],
})
export class WatchWindowComponent implements OnInit {
  @ViewChild('context', { static: false }) context: ElementRef;
  isRecording: boolean = false;
  recPercentage: number = 0;

  private lastChartData: any;

  constructor(
    public watch: WatchService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private snack: MatSnackBar,
    private api: ApiService
  ) {}

  ngOnInit() {}

  get enableRecord(): boolean {
    return this.watch.vars.some(v => {
      return v.record;
    });
  }

  record() {
    const params = this.watch.vars
      .filter(v => {
        return v.record && v.name.trim().length;
      })
      .map(v => {
        if (v.context.endsWith('_DATA'))
          return v.context.slice(0, -5) + '::' + v.name;
        return v.name;
      });
    this.dialog
      .open(SingleInputDialogComponent, {
        data: {
          type: 'number',
          title: 'Record',
          suffix: 'ms.',
          placeholder: 'Duration',
          accept: 'RECORD',
        },
      })
      .afterClosed()
      .subscribe(recTime => {
        if (!recTime) return;
        this.startRecording(params, recTime);
      });
  }

  private startRecording(params: string[], duration: number) {
    let cmd =
      'Record CSRECORD.rec ' +
      Math.ceil(duration) +
      ' Gap=1 RecData=' +
      params.join();
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
      this.ws.query('RecordOn').then((ret: MCQueryResponse) => {
        if (ret.err) return this.snack.open(ret.err.errMsg, 'DISMISS');
        this.isRecording = true;
        let time = 0;
        const interval = setInterval(() => {
          time += 200;
          this.recPercentage = (time / duration) * 100;
          if (this.recPercentage >= 100 || !this.isRecording) {
            clearInterval(interval);
            this.onRecordFinish();
          }
        }, 200);
      });
    });
  }

  private onRecordFinish() {
    this.ws.query('recordclose').then(() => {
      this.recPercentage = 0;
      this.isRecording = false;
      setTimeout(() => {
        // ALLOW TIME FOR RECORDING TO CLOSE FILE
        this.showGraphDialog();
      }, 400);
    });
  }

  onBlur(v, e?: KeyboardEvent) {
    if (e) {
      (<HTMLElement>e.target).blur();
      return;
    }
    if (this.watch.addBlankIfNeeded(v)) {
      setTimeout(() => {
        const e = document.getElementById(
          'var-' + (this.watch.vars.length - 1)
        );
        if (e) e.focus();
      }, 0);
    }
  }

  showGraphDialog() {
    this.getRecordingData().then((ret: boolean) => {
      if (!ret) return;
      this.dialog.open(RecordGraphComponent, {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        data: this.lastChartData,
        autoFocus: false,
      });
    });
  }

  private getRecordingData() {
    return this.api.getRecordingCSV(null).then((csv: string) => {
      if (csv === null) {
        /*this.snack.open(
              this.words['dashboard.err_file'],
              this.words['dismiss']
            );*/
        return false;
      }
      this.lastChartData = this.csvToGraphs(csv);
      return true;
    });
  }

  /*
   * Returns TRACES array for PlotlyJS
   */
  private csvToGraphs(csv: string): Graph[] {
    let newData: Graph[] = [];
    // parse CSR
    let recLines = csv.split('\n');
    let legends = recLines[1].split(',');
    for (let legend of legends) {
      newData.push({
        mode: 'lines',
        name: legend,
        x: [],
        y: [],
      });
    }
    for (let i = 2; i < recLines.length; i++) {
      if (recLines[i] !== '') {
        let vals = recLines[i].slice(0, -1).split(',');
        vals.forEach((val, index) => {
          newData[index].x.push(i * 2);
          newData[index].y.push(Number(val));
        });
      }
    }
    return newData;
  }
}

interface Graph {
  mode: string;
  name: string;
  x: number[];
  y: number[];
}
