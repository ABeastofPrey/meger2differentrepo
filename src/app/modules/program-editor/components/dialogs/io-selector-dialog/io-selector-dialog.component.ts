import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {WebsocketService, MCQueryResponse} from '../../../../core';
import {IO} from '../../../../core/models/io.model';

@Component({
  selector: 'app-io-selector-dialog',
  templateUrl: './io-selector-dialog.component.html',
  styleUrls: ['./io-selector-dialog.component.css']
})
export class IoSelectorDialogComponent implements OnInit {
  
  private outputs : IO[] = [];
  private inputs : IO[] = [];
  public io : IO;

  constructor(
    private ws : WebsocketService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.refresh();
  }
  
  refresh() { // takes about 50ms
    let queries:Promise<any>[] = [];
    queries.push(this.ws.query('?tp_out_list'));
    queries.push(this.ws.query('?tp_in_list'));
    Promise.all(queries).then((results : MCQueryResponse[])=>{
      if (results[0].err || results[1].err) {
        return;
      }
      let ioStrings : string[] = results[0].result.slice(1,-1).split(';').slice(0,-1);
      let inputs : IO[] = [], outputs : IO[] = [];
      for (var i=0; i<ioStrings.length; i++) {
        outputs.push(new IO(ioStrings[i]));
      }
      ioStrings = results[1].result.slice(1,-1).split(';').slice(0,-1);
      for (var i=0; i<ioStrings.length; i++) {
        inputs.push(new IO(ioStrings[i]));
      }
      this.outputs = outputs;
      this.inputs = inputs;
    });
  }
  
  cancel() {
    this.dialogRef.close();
  }
  
  insert() {
    if (this.io)
      this.dialogRef.close(this.io.id);
  }

}
