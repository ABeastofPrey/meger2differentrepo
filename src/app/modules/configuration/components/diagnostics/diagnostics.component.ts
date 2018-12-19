import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import {WebsocketService, MCQueryResponse} from '../../../core';
import {GraphComponent, GraphData} from '../graph/graph.component';

@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.css']
})
export class DiagnosticsComponent implements OnInit {
  
  content : string;
  state : string = '1';
  isRefreshing : boolean = false;
  
  @ViewChild('container', {read: ViewContainerRef}) ref: ViewContainerRef;

  constructor(
    private ws : WebsocketService,
    private resolver : ComponentFactoryResolver
  ) { }

  ngOnInit() {
    this.refresh();
  }
  
  private getGraphsFromText() {
    this.ref.clear();
    let text = this.content;
    let graphs : GraphData[] = [];
    let index: number = text.indexOf('<GRAPH');
    try {
      
      // TODO: GET GRAPH TITLE AND TYPE!
      
      while (index > -1) {
        let index2 = text.indexOf('</GRAPH>');
        let graphText = text.substring(index+7,index2); //X='' Y='' TITLE='' type=''>DATA
        
        // PARSE TITLE
        let index3 = graphText.indexOf('Title="');
        let tmp = graphText.substring(index3+7);
        let index4 = tmp.indexOf('"');
        let title = tmp.substring(0,index4);
        
        // PARSE TYPE
        index3 = graphText.indexOf('type=');
        tmp = graphText.substring(index3+5);
        index4 = Math.min(tmp.indexOf(' '), tmp.indexOf('>'));
        let graphType = tmp.substring(0,index4);
        
        // PARSE X
        index3 = graphText.indexOf('X="');
        tmp = graphText.substring(index3+3);
        index4 = tmp.indexOf('"');
        let XLegend = tmp.substring(0,index4);
        
        // PARSE Y
        index3 = graphText.indexOf('Y="');
        tmp = graphText.substring(index3+3);
        index4 = tmp.indexOf('"');
        let YLegend = tmp.substring(0,index4);
        
        index3 = graphText.indexOf(">");
        graphText = graphText.substring(index3+1); // DATA
        let json = JSON.parse('{' + graphText + '}');
        json['XLegend'] = XLegend;
        json['YLegend'] = YLegend;
        json['title'] = title;
        json['graphType'] = graphType;
        graphs.push(json);
        text = text.substring(0,index) + text.substring(index2+8);
        index = text.indexOf('<GRAPH');
      }
      this.content = text;
      var factory = this.resolver.resolveComponentFactory(GraphComponent);    
      let ref : ComponentRef<GraphComponent>;
      for (let graph of graphs) {
        ref = this.ref.createComponent(factory);
        ref.instance.setData(graph);
      }
    } catch (err) {
      console.log(err);
    }
  }
  
  refresh() {
    this.ref.clear();
    this.isRefreshing = true;
    this.content = null;
    let cmd = this.state === '1' ? '?TP_GET_MOTION_DEVICES_STATE' : '?TP_GET_MOTION_MASTER_STATE';
    this.ws.query(cmd + '(1)').then(()=>{
      return this.ws.query(cmd + '(2)');
    }).then((ret: MCQueryResponse)=>{
      if (ret.err) {
        this.content = 'Data not available. Please load TP libraries and try again.';
        this.isRefreshing = false;
        return;
      }
      if (ret.result !== 'Not Ready') {
        this.content = ret.result;
        this.getGraphsFromText();
        this.isRefreshing = false;
        return;
      }
      let interval = setInterval(()=>{
        this.ws.query(cmd + '(2)').then((ret: MCQueryResponse)=>{
          if (ret.result !== 'Not Ready') {
            clearInterval(interval);
            this.content = ret.result;
            this.getGraphsFromText();
            this.isRefreshing = false;
            return;
          }
        });
      },1000);
    });
  }

}
