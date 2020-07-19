import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-payload-results',
  templateUrl: './payload-results.component.html',
  styleUrls: ['./payload-results.component.css']
})
export class PayloadResultsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: IdentData, private ref: MatDialogRef<PayloadResultsComponent, boolean>) { }

  ngOnInit() {
    
  }

  close(val: boolean) {
    this.ref.close(val);
  }

}

interface IdentData {
  max: {
    A1: number;
    A2: number;
    A3: number;
    A4: number;
  };
  mean: {
    A1: number;
    A2: number;
    A3: number;
    A4: number;
  };
  mass: number;
  inertia: number;
  offset: string;
  success: boolean;
  enableapply: boolean;
  additionaldata: string;
}