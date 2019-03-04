import { Component, OnInit, Inject } from '@angular/core';
import {FOUR_AXES_LOCATION, SIX_AXES_LOCATION} from '../../../core/models/tp/location-format.model';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {WebsocketService, CoordinatesService, DataService, MCQueryResponse} from '../../../core';

@Component({
  selector: 'app-add-frame',
  templateUrl: './add-frame.component.html',
  styleUrls: ['./add-frame.component.css']
})
export class AddFrameComponent implements OnInit {

  name : string;
  values : any[];
  FOUR_AXES: string[] = FOUR_AXES_LOCATION;
  SIX_AXES: string[] = SIX_AXES_LOCATION;
  isArray : boolean = false;
  arrSize : number = 0;

  constructor(
    public dialogRef: MatDialogRef<AddFrameComponent>,
    public coos : CoordinatesService,
    private ws : WebsocketService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: number,
  ) {
  }

  ngOnInit() {
    this.values = ['0','0','0','0','0','0'];
  }
  
  closeDialog(result?: boolean) {
    this.dialogRef.close(result);
  }
  
  add() {
    const name = this.isArray ? this.name + '[' + this.arrSize + ']' : this.name;
    let value : string = '';
    if (!this.isArray) {
      value = this.values.slice(0, this.coos.joints.length).join(',');
    }
    let cmd: string = '?TP_ADD_FRAME("';
    switch(this.data) {
      case 0:
        cmd += 'TOOL';
        break;
      case 1:
        cmd += 'BASE';
        break;
      case 2:
        cmd += 'MT';
        break;
      case 3:
        cmd += 'WP';
        break;
    }
    cmd += '","' + name + '","' + this.dataService.selectedRobot + '","' +
            value + '")';
    this.ws.query(cmd).then((ret:MCQueryResponse)=>{
      if (ret.err || ret.result !== '0') {
        console.log(ret);
      } else {
        this.closeDialog(true);
      }
    });
    
  }

}
