import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {WebsocketService, MCQueryResponse} from '../../../../core';
import {Gripper} from '../../../../core/models/gripper.model';

@Component({
  selector: 'app-gripper-selector',
  templateUrl: './gripper-selector.component.html',
  styleUrls: ['./gripper-selector.component.css']
})
export class GripperSelectorComponent implements OnInit {
  
  endEffectors : endEffector[];
  ef: endEffector = null;
  grp: string = null;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ws: WebsocketService
  ) { }
  
  resetGrp() {
    this.grp = null;
  }
  
  insert() {
    const grp : Gripper = {
      name: this.grp,
      ef: this.ef.name
    }
    this.dialogRef.close(grp);
  }

  ngOnInit() {
    this.ws.query('?grp_get_grippers_list').then((ret:MCQueryResponse)=>{
      let endEffectors : endEffector[] = [];
      for (let ef of ret.result.split(';')) {
        if (ef.trim().length > 0) {
          const index = ef.indexOf(':');
          if (index > -1) {
            endEffectors.push({
              name: ef.substring(0,index),
              grippers: ef.substring(index + 1).split(',')
            });
          }
        }
      }
      this.endEffectors = endEffectors;
    });
  }

}

interface endEffector {
  name: string;
  grippers: string[];
}