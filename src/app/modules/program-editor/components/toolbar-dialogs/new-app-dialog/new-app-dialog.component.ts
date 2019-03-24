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
    if (this.isValueInvalid())
      return;
    const name = this.name.toUpperCase();
    const proj = this.prj.currProject.value;
    this.submitting = true;
    this.ws.query('?prj_add_app("' + proj.name + '","' + name + '")')
    .then((ret:MCQueryResponse)=>{
      if (ret.result !== '0' || ret.err)
        this.submitting = false;
      else {
        this.data.refreshDomains().then(()=>this.prj.refreshAppList(proj,true))
        .then(()=>{ this.prj.onExpand.emit(name); });
        this.dialogRef.close();
      }
    });
  }

  ngOnInit() {
    this.name = '';
  }
  
  isValueInvalid() {
    return !this.name || this.name.length === 0 || this.submitting;
  }

}
