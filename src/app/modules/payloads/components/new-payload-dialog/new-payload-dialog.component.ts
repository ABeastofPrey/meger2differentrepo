import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-payload-dialog',
  templateUrl: './new-payload-dialog.component.html',
  styleUrls: ['./new-payload-dialog.component.css'],
})
export class NewPayloadDialogComponent implements OnInit {
  
  name = new FormControl('',[Validators.required, Validators.pattern('[a-zA-Z]+(\\w*)$'),Validators.maxLength(32)]);

  constructor(
    public dataService: DataService,
    private ref: MatDialogRef<NewPayloadDialogComponent, string>
  ) {}

  ngOnInit() {}

  insert() {
    this.ref.close(this.name.value);
  }

  change(value: string): void {
      this.name.setValue(value);
      this.name.markAsTouched();
  }
}
