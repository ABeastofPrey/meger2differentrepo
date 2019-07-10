import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DataService } from '../../../core';

@Component({
  selector: 'app-new-payload-dialog',
  templateUrl: './new-payload-dialog.component.html',
  styleUrls: ['./new-payload-dialog.component.css'],
})
export class NewPayloadDialogComponent implements OnInit {
  name: string;

  constructor(
    public dataService: DataService,
    private ref: MatDialogRef<any>
  ) {}

  ngOnInit() {}

  insert() {
    this.ref.close(this.name);
  }
}
