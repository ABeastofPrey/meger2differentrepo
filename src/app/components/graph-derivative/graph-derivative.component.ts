import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-graph-derivative',
  templateUrl: './graph-derivative.component.html',
  styleUrls: ['./graph-derivative.component.css'],
})
export class GraphDerivativeComponent implements OnInit {
  deg: number = 1;
  dataIndex: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    private ref: MatDialogRef<number[]>
  ) {}

  ngOnInit() {}

  done() {
    this.ref.close([this.deg, this.dataIndex]);
  }
}
