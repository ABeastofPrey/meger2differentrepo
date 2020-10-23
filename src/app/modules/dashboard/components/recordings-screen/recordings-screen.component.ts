import { Component, OnInit } from '@angular/core';
import {trigger, transition, style, animate} from '@angular/animations';
import {RecordService, RecordTab} from '../../../core/services/record.service';
import {environment} from '../../../../../environments/environment';
import {MatDialog} from '@angular/material';
import {GraphDerivativeComponent} from '../../../../components/graph-derivative/graph-derivative.component';
import {ApiService} from '../../../core';
import {ExternalGraphDialogComponent} from '../external-graph-dialog/external-graph-dialog.component';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-recordings-screen',
  templateUrl: './recordings-screen.component.html',
  styleUrls: ['./recordings-screen.component.css'],
  animations: [
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('.2s ease-in', style({ transform: 'scale(1)' })),
      ])
    ])
  ]
})
export class RecordingsScreenComponent implements OnInit {
  
  env = environment;

  constructor(
  public service: RecordService,
  private platform: Platform,
  private dialog: MatDialog,
  private api: ApiService,
  ) { }

  get isTablet(): boolean {
    return this.platform.ANDROID || this.platform.IOS;
  }

  ngOnInit() {
    this.service.available.subscribe(stat=>{
      if (stat) {
        this.showTab(this.service.selectedTabIndex);
      }
    });
  }
  
  add() {
    this.dialog.open(ExternalGraphDialogComponent).afterClosed().subscribe(name=>{
      if (name) {
        this.service.createTab(name);
      }
    });
  }
  
  showTab(i: number) {
    this.service.selectedTabIndex = i;
  }
  
  derivative() {
    this.dialog
      .open(GraphDerivativeComponent, {
        data: this.service.tabs[this.service.selectedTabIndex].legends,
      })
      .afterClosed()
      .subscribe(ret => {
        const deg = ret[0];
        const dataIndex = ret[1];
        if (isNaN(deg) || isNaN(dataIndex)) return;
        this.addDer(deg, dataIndex);
      });
  }
  
  compare(onSameChart: boolean) {
     this.dialog.open(ExternalGraphDialogComponent).afterClosed().subscribe(name=>{
      if (name) {
        const tab = new RecordTab(name, this.service);
        this.api.getRecordingCSV(tab.file).then(result=>{
          tab.init(result);
          if (onSameChart) {
            this.service.tabs[this.service.selectedTabIndex].addData(tab);
          } else {
            this.service.tabs[this.service.selectedTabIndex].compareTo = tab;
          }
        });
      }
    });
  }
  
  downloadRec(tab: RecordTab) {
    this.api.getRecordingFile(tab.file);
  }
  
  downloadCSV(tab: RecordTab) {
    // tslint:disable-next-line: no-any
    const windowObj = window as any;
    const createObjectURL = 
        (windowObj.URL || windowObj.webkitURL || {}).createObjectURL || (()=>{});
    let blob = null;
    const csv = tab.csv;
    const fileType = "application/octet-stream";
    windowObj.BlobBuilder = windowObj.BlobBuilder || 
                         windowObj.WebKitBlobBuilder || 
                         windowObj.MozBlobBuilder || 
                         windowObj.MSBlobBuilder;
    if(windowObj.BlobBuilder){
      const bb = new windowObj.BlobBuilder();
      bb.append(csv);
      blob = bb.getBlob(fileType);
    }else{
      blob = new Blob([csv], {type : fileType});
    }
    const url = createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url
    a.download = tab.file + '.CSV';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  private addDer(deg: number, dataIndex: number) {
    const tab = this.service.tabs[this.service.selectedTabIndex];
    const data = tab.data;
    const graphData = data[dataIndex];
    const cycleTime = this.service.grp.sysInfo.cycleTime;
    let newY = [];
    if (graphData.y) {
      for (let i = 0; i < deg; i++) {
        const y = i === 0 ? graphData.y : newY;
        const tmpY: number[] = [];
        for (let j = 0; j < y.length; j++) {
          if (j < i) {
            tmpY[j] = 0;
          }
          else {
            tmpY[j-i] = (y[j] - y[j - 1]) / (cycleTime / 1000);
          }
        }
        newY = tmpY;
        
      }
    }
    tab.derData = tab.derData.concat([{
      mode: 'lines',
      name: graphData.name + '-DER-' + deg,
      x: graphData.x,
      y: newY,
    }]);
  }

}
