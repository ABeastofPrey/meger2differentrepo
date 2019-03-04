import { Component, OnInit, ViewChild } from '@angular/core';
import {MatDialogRef, MatSnackBar, MatInput} from '@angular/material';
import {FOUR_AXES_LOCATION, SIX_AXES_LOCATION} from '../../../core/models/tp/location-format.model';
import {DataService, WebsocketService, CoordinatesService, MCQueryResponse} from '../../../core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'add-var',
  templateUrl: './add-var.component.html',
  styleUrls: ['./add-var.component.css']
})
export class AddVarComponent implements OnInit {
  
   name : string;
   varType : string;
   values : any[];
   FOUR_AXES: string[] = FOUR_AXES_LOCATION;
   SIX_AXES: string[] = SIX_AXES_LOCATION;
   isArray : boolean = false;
   arrSize : number = 0;
   
   private words: any;

  constructor(
    public dialogRef: MatDialogRef<AddVarComponent>,
    public data : DataService,
    private ws : WebsocketService,
    public coos : CoordinatesService,
    private snackbar : MatSnackBar,
    private trn: TranslateService
  ) { 
    if (this.data.domainIsFrame)
      this.varType = 'LOCATION';
    this.trn.get(['success']).subscribe(words=>{
      this.words = words;
    });
  }

  ngOnInit() {
    this.values = ['0','0','0','0','0','0'];
  }
  
  onTypeChange() {
    if (this.varType === 'STRING')
      this.values[0] = '';
    else
      this.values[0] = '0';
  }
  
  closeDialog() {
    this.dialogRef.close();
  }
  
  add() {
    let name = this.isArray ? this.name + '[' + this.arrSize + ']' : this.name;
    let value : string = '';
    if (!this.isArray) {
      if (this.varType === 'JOINT' || this.varType === 'LOCATION') {
        for (let val of this.values.slice(0, this.coos.joints.length))
          value += val + ',';
        value = value.slice(0,-1); // Remove last comma
      } else if (this.values.length > 0){
        value = this.values[0];
      }
    }
    var cmd = '?TP_ADDVAR("' + name + '","' + this.varType + '","' +
              this.data.selectedRobot + '","' + value + '")';
    this.ws.query(cmd).then((ret:MCQueryResponse)=>{
      if (ret.err || ret.result !== '0') {
        console.log(ret);
      } else {
        this.closeDialog();
        this.snackbar.open(this.words['success'],'',{duration:2000});
        var queries = [
          this.data.refreshBases(),
          this.data.refreshTools(),
          this.data.refreshMachineTables(),
          this.data.refreshWorkPieces()
        ];
        Promise.all(queries).then(()=>{
          this.data.refreshVariables();
        });
      }
    });
    
  }

}
