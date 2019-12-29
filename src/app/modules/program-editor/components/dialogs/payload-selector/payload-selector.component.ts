import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from '../../../../core';
import { Payload } from '../../../../core/models/payload.model';

@Component({
  selector: 'app-payload-selector',
  templateUrl: './payload-selector.component.html',
  styleUrls: ['./payload-selector.component.css'],
})
export class PayloadSelectorComponent implements OnInit {
  pay: Payload = null;

  constructor(
    public dialogRef: MatDialogRef<PayloadSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    public service: DataService
  ) {}

  insert() {
    this.dialogRef.close(this.pay);
  }

  ngOnInit() {}
}
