import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../../../core';

@Component({
  selector: 'app-dim-dialog',
  templateUrl: './dim-dialog.component.html',
  styleUrls: ['./dim-dialog.component.css']
})
export class DimDialogComponent implements OnInit {
  
  public varName: string;
  public varType : string;

  constructor(
    public dataService : DataService,
    public dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit() {
  }
  
  cancel() { this.dialogRef.close(); }
  
  insert() {
    this.dialogRef.close('Dim ' + this.varName + ' as ' + this.varType);
  }
}
