import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {WebsocketService, ProjectManagerService, MCQueryResponse, DataService} from '../../../../core';

@Component({
  selector: 'app-new-app-dialog',
  templateUrl: './new-app-dialog.component.html',
  styleUrls: ['./new-app-dialog.component.css']
})
export class NewAppDialogComponent implements OnInit {

  name : string;
  submitting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private ws: WebsocketService,
    private prj: ProjectManagerService,
    private data: DataService
  ) { }
  
  create() {
    const name = this.name.toUpperCase();
    const proj = this.prj.currProject.value.name;
    this.submitting = true;
    this.ws.query('?prj_add_app("' + proj + '","' + name + '")').then((ret:MCQueryResponse)=>{
      if (ret.result !== '0' || ret.err)
        this.submitting = false;
      else {
        this.data.refreshDomains().then(()=>this.prj.getCurrentProject())
        .then(()=>{ this.prj.onExpand.emit(name); });
        this.dialogRef.close();
      }
    });
  }

  ngOnInit() {
    this.name = '';
  }

}
